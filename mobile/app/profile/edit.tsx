import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../src/lib/firebase';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { getCategories } from '../../src/services/category.service';
import { uploadProfileImageFromUri } from '../../src/services/storage.service';
import { updateProfileFields } from '../../src/services/user.service';
import type { Category } from '../../src/types';
import { calculateAge, type UserGender, type UserProfileUpdate } from '../../src/types/user';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [form, setForm] = useState<UserProfileUpdate>({
    displayName: '',
    photoURL: '',
    gender: undefined,
    countryId: '',
    cityId: '',
    birthDate: '',
    phoneNumber: '',
    interests: [],
    bio: '',
  });
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [pickedMime, setPickedMime] = useState<string>('image/jpeg');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catModal, setCatModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await getCategories();
        if (!cancelled) setCategories(cats.filter((c) => c.isActive !== false));
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login' as Href);
    } else if (user) {
      setForm({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        gender: user.gender,
        countryId: user.countryId || '',
        cityId: user.cityId || '',
        birthDate: user.birthDate || '',
        phoneNumber: user.phoneNumber || '',
        interests: user.interests ? [...user.interests] : [],
        bio: user.bio || '',
      });
      setPickedUri(null);
    }
  }, [user, authLoading, router]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permisos', 'Necesitamos acceso a la galería para elegir una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (asset.fileSize != null && asset.fileSize > 10 * 1024 * 1024) {
      Alert.alert('Archivo grande', 'Elegí una imagen de menos de 10 MB.');
      return;
    }

    setPickedUri(asset.uri);
    setPickedMime(asset.mimeType ?? 'image/jpeg');
    setError(null);
  };

  const toggleInterest = (categoryId: string) => {
    setForm((prev) => {
      const list = prev.interests ?? [];
      const has = list.includes(categoryId);
      return {
        ...prev,
        interests: has ? list.filter((id) => id !== categoryId) : [...list, categoryId],
      };
    });
  };

  const submit = async () => {
    if (!user) return;
    const name = form.displayName?.trim();
    if (!name) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      let finalPhoto = form.photoURL?.trim() || '';

      if (pickedUri) {
        try {
          finalPhoto = await uploadProfileImageFromUri(user.uid, pickedUri, pickedMime);
        } catch (uploadErr) {
          console.error(uploadErr);
          if (!finalPhoto) {
            setError(
              uploadErr instanceof Error
                ? uploadErr.message
                : 'No se pudo subir la imagen.'
            );
            setSaving(false);
            return;
          }
          setError('No se pudo actualizar la foto; se guardaron el resto de los datos.');
        }
      }

      await updateProfileFields(user.uid, {
        ...form,
        displayName: name,
        photoURL: finalPhoto || undefined,
        gender: form.gender ?? null,
        countryId: form.countryId?.trim() || undefined,
        cityId: form.cityId?.trim() || undefined,
        birthDate: form.birthDate?.trim() || undefined,
        phoneNumber: form.phoneNumber?.trim() || undefined,
        interests: form.interests?.length ? form.interests : [],
        bio: form.bio?.trim() || undefined,
      });

      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          ...(finalPhoto ? { photoURL: finalPhoto } : {}),
        });
      }

      await refreshUser();
      setSuccess(true);
      setPickedUri(null);
      setTimeout(() => router.back(), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  const previewUri = pickedUri || form.photoURL || '';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarWrap}>
          <Pressable onPress={() => void pickImage()} style={styles.avatarRing}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={40} color={COLORS.primaryGreenDark} />
                <Text style={styles.avatarHint}>Tocá para elegir</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.pressed]}
            onPress={() => void pickImage()}
          >
            <Text style={styles.outlineBtnTxt}>
              {pickedUri ? 'Cambiar foto' : 'Elegir foto de perfil'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.lbl}>Nombre completo *</Text>
        <TextInput
          style={styles.input}
          value={form.displayName ?? ''}
          onChangeText={(t) => setForm((p) => ({ ...p, displayName: t }))}
          placeholder="Tu nombre"
        />

        <Text style={styles.lbl}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user.email}
          editable={false}
        />
        <Text style={styles.hint}>El email no se puede cambiar desde la app.</Text>

        <Text style={styles.lbl}>Género</Text>
        <View style={styles.genderRow}>
          {(
            [
              { value: undefined, label: 'No decir' },
              { value: 'female' as UserGender, label: 'Femenino' },
              { value: 'male' as UserGender, label: 'Masculino' },
              { value: 'other' as UserGender, label: 'Otro' },
            ] as const
          ).map((opt) => {
            const selected = form.gender === opt.value || (!form.gender && opt.value === undefined);
            return (
              <Pressable
                key={opt.label}
                style={[styles.genderChip, selected && styles.genderChipOn]}
                onPress={() => setForm((p) => ({ ...p, gender: opt.value }))}
              >
                <Text style={[styles.genderChipTxt, selected && styles.genderChipTxtOn]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.hint}>Se usa para el saludo (por defecto: bienvenido).</Text>

        <Text style={styles.lbl}>Fecha de nacimiento (AAAA-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={form.birthDate ?? ''}
          onChangeText={(t) => setForm((p) => ({ ...p, birthDate: t }))}
          placeholder="1990-05-15"
          autoCapitalize="none"
        />
        {form.birthDate?.trim() && !Number.isNaN(Date.parse(form.birthDate)) ? (
          <Text style={styles.hint}>
            Edad aproximada: {calculateAge(form.birthDate.trim())} años
          </Text>
        ) : null}

        <Text style={styles.lbl}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={form.phoneNumber ?? ''}
          onChangeText={(t) => setForm((p) => ({ ...p, phoneNumber: t }))}
          placeholder="+54 9 11 1234-5678"
          keyboardType="phone-pad"
        />

        <Text style={styles.lbl}>País (código o texto)</Text>
        <TextInput
          style={styles.input}
          value={form.countryId ?? ''}
          onChangeText={(t) => setForm((p) => ({ ...p, countryId: t }))}
          placeholder="AR"
          autoCapitalize="characters"
        />

        <Text style={styles.lbl}>Ciudad</Text>
        <TextInput
          style={styles.input}
          value={form.cityId ?? ''}
          onChangeText={(t) => setForm((p) => ({ ...p, cityId: t }))}
          placeholder="Buenos Aires"
        />

        <Text style={styles.lbl}>Intereses (categorías)</Text>
        <Pressable
          style={styles.selectBtn}
          onPress={() => setCatModal(true)}
        >
          <Text style={styles.selectBtnTxt}>
            {(form.interests?.length ?? 0) > 0
              ? `${form.interests!.length} categoría(s) elegidas`
              : 'Elegir categorías'}
          </Text>
        </Pressable>

        <Text style={styles.lbl}>Biografía</Text>
        <TextInput
          style={[styles.input, styles.area]}
          value={form.bio ?? ''}
          onChangeText={(t) => setForm((p) => ({ ...p, bio: t }))}
          placeholder="Contanos sobre vos..."
          multiline
        />

        {error ? <Text style={styles.err}>{error}</Text> : null}
        {success ? (
          <Text style={styles.ok}>Perfil actualizado correctamente</Text>
        ) : null}

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            disabled={saving}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryTxt}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, saving && styles.disabled]}
            disabled={saving}
            onPress={() => void submit()}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryTxt}>Guardar cambios</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={catModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tus intereses</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const on = form.interests?.includes(item.id);
                return (
                  <Pressable
                    style={styles.modalRow}
                    onPress={() => toggleInterest(item.id)}
                  >
                    <Text style={styles.modalRowTxt}>{item.name}</Text>
                    <Ionicons
                      name={on ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={on ? COLORS.primaryGreen : COLORS.textSecondary}
                    />
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No hay categorías cargadas.</Text>
              }
            />
            <Pressable style={styles.modalClose} onPress={() => setCatModal(false)}>
              <Text style={styles.modalCloseTxt}>Listo</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.primaryGreen,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreenLight,
    padding: 8,
  },
  avatarHint: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryGreenDark,
    textAlign: 'center',
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  outlineBtnTxt: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  lbl: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  genderChip: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  genderChipOn: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreenLight,
  },
  genderChipTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genderChipTxtOn: {
    color: COLORS.primaryGreenDark,
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
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: COLORS.textSecondary,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 4,
  },
  selectBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
  },
  selectBtnTxt: { fontSize: 16, color: COLORS.textPrimary },
  err: { color: '#b91c1c', marginTop: 12, fontSize: 14 },
  ok: {
    color: COLORS.primaryGreenDark,
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  secondaryTxt: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 15 },
  primaryBtn: {
    flex: 2,
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTxt: { fontWeight: '700', color: '#fff', fontSize: 15 },
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
    maxHeight: '75%',
    paddingBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalRowTxt: { fontSize: 16, color: COLORS.textPrimary, flex: 1 },
  modalEmpty: {
    padding: 24,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  modalClose: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  modalCloseTxt: {
    color: COLORS.primaryGreenDark,
    fontWeight: '700',
    fontSize: 16,
  },
});
