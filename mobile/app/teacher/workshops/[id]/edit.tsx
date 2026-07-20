import { useEffect, useState } from 'react';
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
import { TeacherShell } from '../../../../src/components/teacher/TeacherShell';
import { COLORS } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/hooks/useAuth';
import {
  getWorkshopById,
  publishWorkshop,
  unpublishWorkshop,
  updateWorkshop,
} from '../../../../src/services/workshops.service';
import type { WorkshopCreateInput } from '../../../../src/types';

export default function TeacherEditWorkshopScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workshopId = typeof id === 'string' ? id : '';
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<WorkshopCreateInput | null>(null);

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
        const w = await getWorkshopById(workshopId);
        if (cancelled) return;
        if (!w) {
          setError('Taller no encontrado');
          setForm(null);
          return;
        }
        if (w.teacherId !== user.uid && user.role !== 'admin') {
          setError('No tenés permiso para editar este taller');
          setForm(null);
          return;
        }
        setForm({
          title: w.title,
          description: w.description,
          categoryId: w.categoryId,
          price: w.price,
          currency: w.currency,
          capacity: w.capacity,
          location: {
            addressText: w.location.addressText || '',
            cityId: w.location.cityId || '',
            countryId: w.location.countryId || 'AR',
          },
          coverImageUrl: w.coverImageUrl,
          difficultyLevel: w.difficultyLevel,
          language: w.language,
        });
        setError(null);
      } catch {
        if (!cancelled) setError('Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user, workshopId]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await updateWorkshop(workshopId, form);
      router.replace(`/teacher/workshops/${workshopId}` as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await updateWorkshop(workshopId, form);
      await publishWorkshop(workshopId);
      router.replace(`/teacher/workshops/${workshopId}` as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al publicar');
    } finally {
      setSaving(false);
    }
  };

  const unpublish = () => {
    Alert.alert(
      'Ocultar taller',
      '¿Ocultar este taller? No aparecerá en la lista pública.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ocultar',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await unpublishWorkshop(workshopId);
              router.replace(`/teacher/workshops/${workshopId}` as Href);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Falló');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (authLoading || loading || !user || user.role !== 'teacher') {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      </TeacherShell>
    );
  }

  if (!form) {
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
        <Text style={styles.h1}>Editar taller</Text>

        <Text style={styles.lbl}>Título *</Text>
        <TextInput
          style={styles.input}
          value={form.title}
          onChangeText={(t) => setForm((p) => (p ? { ...p, title: t } : p))}
        />

        <Text style={styles.lbl}>Descripción *</Text>
        <TextInput
          style={[styles.input, styles.area]}
          value={form.description}
          onChangeText={(t) =>
            setForm((p) => (p ? { ...p, description: t } : p))
          }
          multiline
        />

        <Text style={styles.lbl}>Categoría *</Text>
        <TextInput
          style={styles.input}
          value={form.categoryId}
          onChangeText={(t) =>
            setForm((p) => (p ? { ...p, categoryId: t } : p))
          }
          placeholder="Ej: Cocina, Arte"
        />

        <Text style={styles.lbl}>Idioma (texto)</Text>
        <TextInput
          style={styles.input}
          value={form.language ?? ''}
          onChangeText={(t) =>
            setForm((p) =>
              p ? { ...p, language: t.trim() || undefined } : p
            )
          }
          placeholder="es, en..."
        />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>Precio *</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(form.price)}
              onChangeText={(t) =>
                setForm((p) =>
                  p
                    ? {
                        ...p,
                        price: Number(t.replace(/[^0-9]/g, '')) || 0,
                      }
                    : p
                )
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>Capacidad *</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(form.capacity)}
              onChangeText={(t) =>
                setForm((p) =>
                  p
                    ? {
                        ...p,
                        capacity: Math.max(
                          1,
                          Number(t.replace(/[^0-9]/g, '')) || 1
                        ),
                      }
                    : p
                )
              }
            />
          </View>
        </View>

        <Text style={styles.lbl}>Dirección *</Text>
        <TextInput
          style={styles.input}
          value={form.location.addressText}
          onChangeText={(t) =>
            setForm((p) =>
              p
                ? {
                    ...p,
                    location: { ...p.location, addressText: t },
                  }
                : p
            )
          }
        />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>Ciudad</Text>
            <TextInput
              style={styles.input}
              value={form.location.cityId ?? ''}
              onChangeText={(t) =>
                setForm((p) =>
                  p
                    ? {
                        ...p,
                        location: { ...p.location, cityId: t },
                      }
                    : p
                )
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.lbl}>País</Text>
            <TextInput
              style={styles.input}
              value={form.location.countryId ?? ''}
              onChangeText={(t) =>
                setForm((p) =>
                  p
                    ? {
                        ...p,
                        location: { ...p.location, countryId: t },
                      }
                    : p
                )
              }
            />
          </View>
        </View>

        {error ? <Text style={styles.err}>{error}</Text> : null}

        <View style={styles.btns}>
          <Pressable
            style={[styles.primaryBtn, saving && styles.disabled]}
            disabled={saving}
            onPress={() => void save()}
          >
            <Text style={styles.primaryTxt}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.secondaryBtn, saving && styles.disabled]}
            disabled={saving}
            onPress={() => void publish()}
          >
            <Text style={styles.secondaryTxt}>Publicar</Text>
          </Pressable>
          <Pressable
            style={[styles.outlineBtn, saving && styles.disabled]}
            disabled={saving}
            onPress={unpublish}
          >
            <Text style={styles.outlineTxt}>Ocultar</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() =>
              router.replace(`/teacher/workshops/${workshopId}` as Href)
            }
          >
            <Text style={styles.secondaryTxt}>Cancelar</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
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
    marginBottom: 16,
  },
  lbl: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 12 },
  err: { color: '#b91c1c', marginTop: 12 },
  btns: { gap: 12, marginTop: 20 },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  secondaryTxt: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 15 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#c62828',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineTxt: { fontWeight: '700', color: '#c62828', fontSize: 15 },
  disabled: { opacity: 0.55 },
});
