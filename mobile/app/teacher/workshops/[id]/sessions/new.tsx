import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TeacherShell } from '../../../../../src/components/teacher/TeacherShell';
import { COLORS } from '../../../../../src/constants/theme';
import { useAuth } from '../../../../../src/hooks/useAuth';
import { createSession } from '../../../../../src/services/sessions.service';
import { getWorkshopById } from '../../../../../src/services/workshops.service';
import type { SessionCreateInput } from '../../../../../src/types';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function defaultDates() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  return { dateStr, startTime, endTime };
}

function buildDate(dateStr: string, timeStr: string): Date | null {
  const d = dateStr.trim();
  const t = timeStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  const iso = `${d}T${t}:00`;
  const dt = new Date(iso);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export default function TeacherNewSessionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workshopId = typeof id === 'string' ? id : '';
  const { user, loading: authLoading } = useAuth();

  const defaults = useMemo(() => defaultDates(), []);
  const [dateStr, setDateStr] = useState(defaults.dateStr);
  const [startTime, setStartTime] = useState(defaults.startTime);
  const [endTime, setEndTime] = useState(defaults.endTime);
  const [workshopTitle, setWorkshopTitle] = useState<string | null>(null);
  const [loadingW, setLoadingW] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.uid || !workshopId) return;
      try {
        setLoadingW(true);
        const w = await getWorkshopById(workshopId);
        if (cancelled) return;
        if (!w) {
          setError('Taller no encontrado');
          setWorkshopTitle(null);
          return;
        }
        if (w.teacherId !== user.uid) {
          setError('No tenés permiso para crear sesiones aquí');
          setWorkshopTitle(null);
          return;
        }
        setWorkshopTitle(w.title);
        setError(null);
      } catch {
        if (!cancelled) setError('Error al cargar');
      } finally {
        if (!cancelled) setLoadingW(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, workshopId]);

  const submit = async () => {
    const startAt = buildDate(dateStr, startTime);
    const endAt = buildDate(dateStr, endTime);
    if (!startAt || !endAt) {
      Alert.alert(
        'Revisá las fechas',
        'Usá fecha AAAA-MM-DD y hora HH:MM (24 h).'
      );
      return;
    }
    if (endAt.getTime() <= startAt.getTime()) {
      Alert.alert('Horario', 'La hora de fin debe ser posterior al inicio.');
      return;
    }

    const input: SessionCreateInput = {
      workshopId,
      startAt,
      endAt,
    };

    setSubmitting(true);
    setError(null);
    try {
      await createSession(input);
      router.replace(`/teacher/workshops/${workshopId}` as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear sesión');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingW || !user || user.role !== 'teacher') {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      </TeacherShell>
    );
  }

  if (!workshopTitle) {
    return (
      <TeacherShell>
        <View style={styles.pad}>
          <Text style={styles.err}>{error}</Text>
        </View>
      </TeacherShell>
    );
  }

  return (
    <TeacherShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>Nueva fecha</Text>
        <Text style={styles.sub}>{workshopTitle}</Text>

        <Text style={styles.lbl}>Fecha (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dateStr}
          onChangeText={setDateStr}
          placeholder="2026-05-10"
          autoCapitalize="none"
        />

        <Text style={styles.lbl}>Inicio (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="10:00"
          autoCapitalize="none"
        />

        <Text style={styles.lbl}>Fin (HH:MM)</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="12:00"
          autoCapitalize="none"
        />

        {error ? <Text style={styles.err}>{error}</Text> : null}

        <Pressable
          style={[styles.btn, submitting && styles.disabled]}
          disabled={submitting}
          onPress={() => void submit()}
        >
          <Text style={styles.btnTxt}>
            {submitting ? 'Guardando...' : 'Guardar sesión'}
          </Text>
        </Pressable>

        <View style={{ height: 28 }} />
      </ScrollView>
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad: { padding: 24 },
  h1: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  lbl: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
  },
  err: { color: '#b91c1c', marginTop: 12, marginBottom: 8 },
  btn: {
    marginTop: 24,
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.55 },
});
