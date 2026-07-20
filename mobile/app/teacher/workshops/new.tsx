import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { TeacherShell } from '../../../src/components/teacher/TeacherShell';
import { COLORS } from '../../../src/constants/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { getCategories } from '../../../src/services/category.service';
import {
  createWorkshop,
  publishWorkshop,
} from '../../../src/services/workshops.service';
import type { Category, DifficultyLevel, WorkshopCreateInput } from '../../../src/types';

const emptyForm = (): WorkshopCreateInput => ({
  title: '',
  description: '',
  categoryId: '',
  price: 0,
  currency: 'ARS',
  capacity: 10,
  location: {
    addressText: '',
    cityId: '',
    countryId: 'AR',
  },
});

export default function TeacherNewWorkshopScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<WorkshopCreateInput>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teacherName = useMemo(() => {
    const n = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return (
      n ||
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'Profesor'
    );
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatLoading(true);
        const data = await getCategories();
        if (!cancelled) setCategories(data.filter((c) => c.isActive !== false));
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCatLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  const selectedCategoryLabel =
    categories.find((c) => c.id === form.categoryId)?.name ?? '';

  const saveDraft = async () => {
    if (!user?.uid) return;
    setError(null);
    setSaving(true);
    try {
      const w = await createWorkshop(user.uid, form, teacherName);
      router.replace(`/teacher/workshops/${w.id}` as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear el taller');
    } finally {
      setSaving(false);
    }
  };

  const saveAndPublish = async () => {
    if (!user?.uid) return;
    setError(null);
    setSaving(true);
    try {
      const w = await createWorkshop(user.uid, form, teacherName);
      await publishWorkshop(w.id);
      router.replace(`/teacher/workshops/${w.id}` as Href);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al publicar');
    } finally {
      setSaving(false);
    }
  };

  const setDifficulty = (d: DifficultyLevel | undefined) => {
    setForm((prev) => ({ ...prev, difficultyLevel: d }));
  };

  if (authLoading || !user || user.role !== 'teacher') {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
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
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>MODO CREADOR</Text>
          <Text style={styles.h1}>Crear nuevo taller</Text>
          <Pressable onPress={() => router.push('/teacher/workshops' as Href)}>
            <Text style={styles.link}>Volver a mis talleres</Text>
          </Pressable>
        </View>

        <Text style={styles.h2}>Información principal</Text>
        <View style={styles.card}>
          <Text style={styles.lbl}>Título *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(t) => setForm((p) => ({ ...p, title: t }))}
            placeholder="Ej: Taller de cerámica"
          />

          <Text style={styles.lbl}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.area]}
            value={form.description}
            onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
            placeholder="Contá qué van a aprender..."
            multiline
          />

          <Text style={styles.lbl}>Categoría *</Text>
          <Pressable
            style={styles.selectBtn}
            onPress={() => {
              if (categories.length === 0 && !catLoading) {
                Alert.alert(
                  'Sin categorías',
                  'No se pudieron cargar categorías. Probá de nuevo más tarde.'
                );
                return;
              }
              setCatModal(true);
            }}
          >
            <Text
              style={
                selectedCategoryLabel ? styles.selectTxt : styles.selectPlaceholder
              }
            >
              {catLoading
                ? 'Cargando...'
                : selectedCategoryLabel || 'Elegir categoría'}
            </Text>
          </Pressable>

          <Text style={styles.lbl}>Nivel</Text>
          <View style={styles.diffRow}>
            {(
              [
                { key: undefined as undefined, label: '—' },
                { key: 'beginner' as const, label: 'Ini.' },
                { key: 'intermediate' as const, label: 'Med.' },
                { key: 'advanced' as const, label: 'Avz.' },
              ] as const
            ).map(({ key, label }) => (
              <Pressable
                key={label}
                style={[
                  styles.diffChip,
                  form.difficultyLevel === key && styles.diffChipOn,
                ]}
                onPress={() => setDifficulty(key)}
              >
                <Text
                  style={[
                    styles.diffChipTxt,
                    form.difficultyLevel === key && styles.diffChipTxtOn,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.lbl}>Idioma</Text>
          <View style={styles.langRow}>
            {(['es', 'en', 'pt'] as const).map((lng) => (
              <Pressable
                key={lng}
                style={[
                  styles.diffChip,
                  form.language === lng && styles.diffChipOn,
                ]}
                onPress={() =>
                  setForm((p) => ({
                    ...p,
                    language: p.language === lng ? undefined : lng,
                  }))
                }
              >
                <Text
                  style={[
                    styles.diffChipTxt,
                    form.language === lng && styles.diffChipTxtOn,
                  ]}
                >
                  {lng.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.h2}>Precio y cupos</Text>
        <View style={styles.card}>
          <Text style={styles.lbl}>Precio (ARS) *</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(form.price)}
            onChangeText={(t) =>
              setForm((p) => ({ ...p, price: Number(t.replace(/[^0-9]/g, '')) || 0 }))
            }
          />
          <Text style={styles.lbl}>Capacidad *</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={String(form.capacity)}
            onChangeText={(t) =>
              setForm((p) => ({
                ...p,
                capacity: Math.max(1, Number(t.replace(/[^0-9]/g, '')) || 1),
              }))
            }
          />
        </View>

        <Text style={styles.h2}>Ubicación</Text>
        <View style={styles.card}>
          <Text style={styles.lbl}>Dirección *</Text>
          <TextInput
            style={styles.input}
            value={form.location.addressText}
            onChangeText={(t) =>
              setForm((p) => ({
                ...p,
                location: { ...p.location, addressText: t },
              }))
            }
            placeholder="Ej: Av. Corrientes 1234"
          />
          <Text style={styles.lbl}>Ciudad</Text>
          <TextInput
            style={styles.input}
            value={form.location.cityId ?? ''}
            onChangeText={(t) =>
              setForm((p) => ({
                ...p,
                location: { ...p.location, cityId: t },
              }))
            }
            placeholder="Ej: Buenos Aires"
          />
          <Text style={styles.lbl}>País</Text>
          <TextInput
            style={styles.input}
            value={form.location.countryId ?? ''}
            onChangeText={(t) =>
              setForm((p) => ({
                ...p,
                location: { ...p.location, countryId: t },
              }))
            }
          />
        </View>

        {error ? <Text style={styles.err}>{error}</Text> : null}

        <View style={styles.footerBtns}>
          <Pressable
            style={({ pressed }) => [
              styles.btnSecondary,
              pressed && styles.pressed,
              saving && styles.disabled,
            ]}
            disabled={saving}
            onPress={() => void saveDraft()}
          >
            <Text style={styles.btnSecondaryTxt}>
              {saving ? 'Guardando...' : 'Guardar borrador'}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && styles.pressed,
              saving && styles.disabled,
            ]}
            disabled={saving}
            onPress={() => void saveAndPublish()}
          >
            <Text style={styles.btnPrimaryTxt}>
              {saving ? 'Publicando...' : 'Crear y publicar'}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>

      <Modal visible={catModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Elegí categoría</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalRow}
                  onPress={() => {
                    setForm((p) => ({ ...p, categoryId: item.id }));
                    setCatModal(false);
                  }}
                >
                  <Text style={styles.modalRowTxt}>{item.name}</Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.modalClose} onPress={() => setCatModal(false)}>
              <Text style={styles.modalCloseTxt}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  h1: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  link: { color: COLORS.primaryGreenDark, fontWeight: '600', fontSize: 14 },
  h2: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  lbl: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
  selectBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
  },
  selectTxt: { fontSize: 16, color: COLORS.textPrimary },
  selectPlaceholder: { fontSize: 16, color: '#94a3b8' },
  diffRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 8 },
  diffChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.background,
  },
  diffChipOn: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreenLight,
  },
  diffChipTxt: { fontWeight: '600', color: COLORS.textSecondary, fontSize: 13 },
  diffChipTxtOn: { color: COLORS.primaryGreenDark },
  err: {
    color: '#b91c1c',
    marginBottom: 12,
    fontSize: 14,
  },
  footerBtns: { gap: 12, marginTop: 8 },
  btnSecondary: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  btnSecondaryTxt: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 15 },
  btnPrimary: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryTxt: { fontWeight: '700', color: '#fff', fontSize: 15 },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.55 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    color: COLORS.textPrimary,
  },
  modalRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalRowTxt: { fontSize: 16, color: COLORS.textPrimary },
  modalClose: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalCloseTxt: { color: COLORS.primaryGreenDark, fontWeight: '700', fontSize: 16 },
});
