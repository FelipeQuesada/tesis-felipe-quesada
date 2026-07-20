import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    router.replace(getHomeHrefForRole(user.role));
  }, [authLoading, user, router]);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError('Completá correo y contraseña.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(trimmed, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert(
        'Google',
        e instanceof Error ? e.message : 'No se pudo iniciar con Google'
      );
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
        <Text style={styles.label}>Correo</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="nombre@ejemplo.com"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

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
            <Text style={styles.primaryBtnText}>Entrar</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
          onPress={() => router.push('/auth/forgot-password')}
        >
          <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.pressed,
          ]}
          onPress={() => void handleGoogle()}
        >
          <Text style={styles.secondaryBtnText}>Continuar con Google</Text>
        </Pressable>

        <Link href="/auth/register" asChild>
          <Pressable style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}>
            <Text style={styles.link}>¿No tenés cuenta? Registrate</Text>
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
    paddingTop: 16,
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
    marginBottom: 16,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
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
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  linkBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  link: {
    color: COLORS.primaryGreenDark,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },
});
