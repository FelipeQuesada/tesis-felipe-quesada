import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TeacherShell } from '../../../../src/components/teacher/TeacherShell';
import { COLORS } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/hooks/useAuth';
import { listTeacherEnrollmentsByWorkshop } from '../../../../src/services/enrollments.service';
import { listSessionsByWorkshop } from '../../../../src/services/sessions.service';
import { getUserDoc } from '../../../../src/services/user.service';
import { getWorkshopById } from '../../../../src/services/workshops.service';
import type { Enrollment, Session, User, Workshop } from '../../../../src/types';

export default function TeacherWorkshopDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workshopId = typeof id === 'string' ? id : '';
  const { user, loading: authLoading } = useAuth();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [studentsById, setStudentsById] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
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
        setLoading(true);
        setError(null);
        const [w, ens, sess] = await Promise.all([
          getWorkshopById(workshopId),
          listTeacherEnrollmentsByWorkshop(user.uid, workshopId),
          listSessionsByWorkshop(workshopId),
        ]);
        if (cancelled) return;
        if (!w) {
          setError('No encontramos este taller.');
          setWorkshop(null);
          return;
        }
        if (w.teacherId !== user.uid) {
          setError('No tenés permiso para ver este taller.');
          setWorkshop(null);
          return;
        }
        setWorkshop(w);
        setEnrollments(ens);
        setSessions(sess);

        const studentIds = [...new Set(ens.map((e) => e.studentId))];
        const entries = await Promise.all(
          studentIds.map(async (sid) => {
            const st = await getUserDoc(sid);
            return [sid, st] as const;
          })
        );
        if (cancelled) return;
        const map: Record<string, User> = {};
        entries.forEach(([sid, st]) => {
          if (st) map[sid] = st;
        });
        setStudentsById(map);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('No se pudo cargar el taller.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, workshopId]);

  const stats = useMemo(() => {
    const paidCount = enrollments.filter((e) => e.status === 'paid').length;
    const pendingCount = enrollments.filter(
      (e) => e.status === 'pending_payment'
    ).length;
    const totalRevenue = (workshop?.price ?? 0) * paidCount;
    const reservedRevenue =
      (workshop?.price ?? 0) * (paidCount + pendingCount);
    const nextSession =
      sessions.find((s) => s.startAt.getTime() >= Date.now()) ?? null;
    return {
      paidCount,
      pendingCount,
      totalRevenue,
      reservedRevenue,
      nextSession,
    };
  }, [enrollments, workshop?.price, sessions]);

  if (
    authLoading ||
    loading ||
    !user ||
    user.role !== 'teacher'
  ) {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      </TeacherShell>
    );
  }

  if (!workshop) {
    return (
      <TeacherShell>
        <View style={styles.pad}>
          <Text style={styles.err}>{error ?? 'Taller no encontrado.'}</Text>
          <Pressable onPress={() => router.push('/teacher/workshops' as Href)}>
            <Text style={styles.link}>Volver a mis talleres</Text>
          </Pressable>
        </View>
      </TeacherShell>
    );
  }

  const statusLabel =
    workshop.status === 'published'
      ? 'Publicado'
      : workshop.status === 'draft'
        ? 'Borrador'
        : 'Cancelado';

  return (
    <TeacherShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{workshop.title}</Text>
          <Text style={styles.sub}>
            {workshop.location.addressText || 'Sin dirección cargada'}
          </Text>
          <Text style={styles.meta}>Estado: {statusLabel}</Text>
          <View style={styles.rowBtns}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() =>
                router.push(`/teacher/workshops/${workshop.id}/edit` as Href)
              }
            >
              <Text style={styles.secondaryTxt}>Editar</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() =>
                router.push(`/teacher/workshops/${workshop.id}/sessions/new` as Href)
              }
            >
              <Text style={styles.secondaryTxt}>Agregar fecha</Text>
            </Pressable>
            <Pressable
              style={styles.primaryBtn}
              onPress={() =>
                router.push(`/teacher/workshops/${workshop.id}/students` as Href)
              }
            >
              <Text style={styles.primaryTxt}>Alumnos</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.statBox}>
            <Text style={styles.statLbl}>Inscriptos</Text>
            <Text style={styles.statVal}>{enrollments.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLbl}>Pagados</Text>
            <Text style={styles.statVal}>{stats.paidCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLbl}>Pendientes</Text>
            <Text style={styles.statVal}>{stats.pendingCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLbl}>Recaudado</Text>
            <Text style={styles.statValSmall}>
              ${stats.totalRevenue.toLocaleString('es-AR')} {workshop.currency}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Próxima fecha</Text>
          {stats.nextSession ? (
            <Text style={styles.body}>
              {stats.nextSession.startAt.toLocaleString('es-AR')} —{' '}
              {stats.nextSession.endAt.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          ) : (
            <Text style={styles.sub}>
              Sin próximas fechas. Agregá una sesión para recibir inscripciones.
            </Text>
          )}
          <Text style={styles.hint}>
            Recaudación potencial (pagados + pendientes): $
            {stats.reservedRevenue.toLocaleString('es-AR')} {workshop.currency}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.h2}>Lista de alumnos</Text>
          {enrollments.length === 0 ? (
            <Text style={styles.sub}>Todavía no hay alumnos inscriptos.</Text>
          ) : (
            enrollments.map((en) => {
              const st = studentsById[en.studentId];
              const name =
                st?.displayName ||
                [st?.firstName, st?.lastName].filter(Boolean).join(' ') ||
                st?.email ||
                'Alumno';
              const statusTxt =
                en.status === 'paid'
                  ? 'Pagado'
                  : en.status === 'pending_payment'
                    ? 'Pendiente'
                    : en.status === 'cancelled'
                      ? 'Cancelado'
                      : 'Reembolsado';
              return (
                <View key={en.id} style={styles.enRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.enName}>{name}</Text>
                    <Text style={styles.enEmail}>{st?.email ?? '—'}</Text>
                  </View>
                  <Text style={styles.enStatus}>{statusTxt}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pad: { padding: 24 },
  err: { color: COLORS.textSecondary, marginBottom: 12 },
  link: { color: COLORS.primaryGreenDark, fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  meta: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 14 },
  rowBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  secondaryTxt: { fontWeight: '600', color: COLORS.textPrimary, fontSize: 13 },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryTxt: { fontWeight: '700', color: '#fff', fontSize: 13 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  statLbl: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  statVal: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary },
  statValSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  body: { fontSize: 15, color: COLORS.textPrimary, lineHeight: 22 },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  enRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  enName: { fontWeight: '600', fontSize: 15, color: COLORS.textPrimary },
  enEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  enStatus: { fontSize: 13, color: COLORS.textSecondary },
});
