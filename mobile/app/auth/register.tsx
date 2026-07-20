import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { getHomeHrefForRole } from '../../src/lib/authRedirect';
import { validatePassword } from '../../src/lib/passwordValidation';
import type { DocumentType, UserRole } from '../../src/types';

const PHONE_COUNTRY_CODES = [
  { label: 'AR +54', value: '+54' },
  { label: 'CL +56', value: '+56' },
  { label: 'UY +598', value: '+598' },
  { label: 'PY +595', value: '+595' },
  { label: 'BR +55', value: '+55' },
  { label: 'PE +51', value: '+51' },
  { label: 'CO +57', value: '+57' },
  { label: 'MX +52', value: '+52' },
  { label: 'ES +34', value: '+34' },
  { label: 'US +1', value: '+1' },
];

const DOCUMENT_TYPES: Array<{ label: string; value: DocumentType }> = [
  { label: 'DNI', value: 'dni' },
  { label: 'Pasaporte', value: 'pasaporte' },
  { label: 'Cédula', value: 'cedula' },
  { label: 'Otro', value: 'otro' },
];

type SignUpRole = Extract<UserRole, 'student' | 'teacher'>;

export default function RegisterScreen() {
  const router = useRouter();
  const { user, loading: authLoading, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+54');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('dni');
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SignUpRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(getHomeHrefForRole(user.role));
  }, [authLoading, user, router]);

  const handleSubmit = async () => {
    setError(null);
    const cleanUsername = username.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const cleanDocumentNumber = documentNumber.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (!cleanFirstName || !cleanLastName) {
      setError('Completá nombre y apellido.');
      return;
    }
    if (!cleanPhoneNumber) {
      setError('Ingresá un teléfono válido.');
      return;
    }
    if (!cleanDocumentNumber) {
      setError('Ingresá el número de documento.');
      return;
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      setError(pwValidation.message ?? 'La contraseña no cumple los requisitos.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, role, {
        username: cleanUsername,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phoneCountryCode,
        phoneNumber: cleanPhoneNumber,
        documentType,
        documentNumber: cleanDocumentNumber,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.section}>Tipo de cuenta</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.roleChip, role === 'student' && styles.roleChipOn]}
            onPress={() => setRole('student')}
          >
            <Text
              style={[
                styles.roleChipText,
                role === 'student' && styles.roleChipTextOn,
              ]}
            >
              Estudiante
            </Text>
          </Pressable>
          <Pressable
            style={[styles.roleChip, role === 'teacher' && styles.roleChipOn]}
            onPress={() => setRole('teacher')}
          >
            <Text
              style={[
                styles.roleChipText,
                role === 'teacher' && styles.roleChipTextOn,
              ]}
            >
              Profesor
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="nombre@ejemplo.com"
        />

        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="mínimo 3 caracteres"
        />

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.section}>Código país</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          {PHONE_COUNTRY_CODES.map((c) => (
            <Pressable
              key={c.value}
              style={[
                styles.chip,
                phoneCountryCode === c.value && styles.chipOn,
              ]}
              onPress={() => setPhoneCountryCode(c.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  phoneCountryCode === c.value && styles.chipTextOn,
                ]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>Teléfono (solo números)</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Text style={styles.section}>Documento</Text>
        <View style={styles.rowWrap}>
          {DOCUMENT_TYPES.map((d) => (
            <Pressable
              key={d.value}
              style={[
                styles.chip,
                documentType === d.value && styles.chipOn,
              ]}
              onPress={() => setDocumentType(d.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  documentType === d.value && styles.chipTextOn,
                ]}
              >
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Número de documento</Text>
        <TextInput
          style={styles.input}
          value={documentNumber}
          onChangeText={setDocumentNumber}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.hint}>
          Mínimo 8 caracteres, mayúscula, minúscula y un carácter especial.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.pressed,
            submitting && styles.disabled,
          ]}
          onPress={() => void handleSubmit()}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Crear cuenta</Text>
          )}
        </Pressable>

        <Link href="/auth/login" asChild>
          <Pressable style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}>
            <Text style={styles.link}>¿Ya tenés cuenta? Iniciá sesión</Text>
          </Pressable>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.surface },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  scroll: {
    padding: 24,
    paddingBottom: 48,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginTop: -8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  roleChipOn: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreenLight,
  },
  roleChipText: {
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleChipTextOn: {
    color: COLORS.primaryGreenDark,
  },
  chipsScroll: {
    marginBottom: 12,
    maxHeight: 44,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  chipOn: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreenLight,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextOn: {
    color: COLORS.primaryGreenDark,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  link: {
    color: COLORS.primaryGreenDark,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
