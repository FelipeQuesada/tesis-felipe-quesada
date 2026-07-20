import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AccountProfileCard } from '../../src/components/account/AccountProfileCard';
import { RemoteAssetImage } from '../../src/components/RemoteAssetImage';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { resolvePublicAssetUri } from '../../src/lib/siteAssets';

export default function AccountScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const manosUri = resolvePublicAssetUri('/images/manos.png');

  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      router.replace('/teacher/account' as Href);
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (user?.role === 'teacher') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.guestContent}
        keyboardShouldPersistTaps="handled"
      >
        <RemoteAssetImage
          uri={manosUri}
          containerStyle={styles.heroImg}
          accessibilityLabel="Iniciar sesión"
        />
        <Text style={styles.guestTitle}>Iniciá sesión para acceder a tu cuenta</Text>
        <Text style={styles.guestBody}>
          Para ver tu perfil, configuraciones y gestionar tu cuenta es necesario iniciar sesión.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/auth/login' as Href)}
        >
          <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/auth/register' as Href)}
        >
          <Text style={styles.secondaryBtnText}>Crear cuenta</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Mi cuenta</Text>

      <AccountProfileCard
        displayName={user.displayName || user.email}
        email={user.email}
        photoURL={user.photoURL}
        roleLabel="Estudiante"
        hint="Tocá para editar tu perfil"
        onPress={() => router.push('/profile/edit' as Href)}
      />

      <Text style={styles.sectionKicker}>Menú</Text>

      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        onPress={() => router.push('/my-workshops' as Href)}
      >
        <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.menuLabel}>Próximos talleres</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        onPress={() =>
          Alert.alert('Configuración', 'Preferencias y notificaciones: próximamente en la app.')
        }
      >
        <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.menuLabel}>Configuración</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
        onPress={() =>
          Alert.alert('Atención al cliente', 'Contactanos desde la web o por correo.')
        }
      >
        <Ionicons name="chatbubble-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.menuLabel}>Atención al cliente</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.logoutRow, pressed && styles.pressed]}
        onPress={() => void handleSignOut()}
      >
        <Ionicons name="log-out-outline" size={22} color="#c62828" />
        <Text style={styles.logoutLabel}>Cerrar sesión</Text>
      </Pressable>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  guestContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  heroImg: {
    width: 150,
    height: 150,
    marginBottom: 24,
    borderRadius: 12,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  guestBody: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 340,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  sectionKicker: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c62828',
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 220,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    minWidth: 220,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: { opacity: 0.9 },
});
