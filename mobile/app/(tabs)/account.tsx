import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { GuestAuthEmpty } from '../../src/components/auth/GuestAuthEmpty';
import { COLORS } from '../../src/constants/theme';
import { FLOATING_TAB_BAR_SPACE } from '../../src/components/navigation/FloatingTabBar';
import { useAuth } from '../../src/hooks/useAuth';

type IonName = ComponentProps<typeof Ionicons>['name'];

function initialsFromUser(displayName?: string | null, email?: string): string {
  const name = (displayName || '').trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return (email || 'U').charAt(0).toUpperCase();
}

function MenuRow({
  icon,
  label,
  onPress,
  badge,
  last,
}: {
  icon: IonName;
  label: string;
  onPress: () => void;
  badge?: string;
  last?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed, last && styles.menuRowLast]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={COLORS.textPrimary} />
      <Text style={styles.menuLabel}>{label}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color="#b0b0b0" />
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      router.replace('/teacher/account' as Href);
    }
  }, [loading, user, router]);

  const versionLabel = useMemo(() => {
    const v = Constants.expoConfig?.version ?? '1.0.0';
    return v;
  }, []);

  const handleSignOut = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await signOut();
              router.replace('/');
            } catch {
              Alert.alert('Error', 'No se pudo cerrar sesión.');
            }
          })();
        },
      },
    ]);
  };

  const soon = (title: string) =>
    Alert.alert(title, 'Esta sección va a estar disponible pronto en MiTaller.');

  if (loading || user?.role === 'teacher') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Text style={[styles.pageTitle, styles.pageTitlePad]}>Cuenta</Text>
        <GuestAuthEmpty
          icon="person-outline"
          title="Iniciá sesión para acceder a tu cuenta"
          body="Para ver tu perfil, configuraciones y gestionar tu cuenta es necesario iniciar sesión."
          showRegister
        />
      </View>
    );
  }

  const displayName =
    user.displayName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.email;
  const location =
    [user.cityId, user.countryId].filter(Boolean).join(', ') || 'Sin ubicación';
  const initials = initialsFromUser(displayName, user.email);
  const interestsCount = user.interests?.length ?? 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 8), paddingBottom: FLOATING_TAB_BAR_SPACE },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Cuenta</Text>
        <View style={styles.headerIcons}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => soon('Notificaciones')}
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => soon('Configuración')}
            hitSlop={8}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.profileCard, pressed && styles.pressed]}
        onPress={() => router.push('/profile/edit' as Href)}
      >
        {user.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
        <View style={styles.profileMain}>
          <Text style={styles.profileName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.profileMeta} numberOfLines={1}>
            {location}
          </Text>
          <Text style={styles.profileMeta}>Estudiante en MiTaller</Text>
          <View style={styles.socialRow}>
            <Text style={styles.socialText}>
              <Text style={styles.socialBold}>{interestsCount}</Text> intereses
            </Text>
            <Text style={styles.socialText}>
              <Text style={styles.socialBold}>0</Text> profesores seguidos
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#b0b0b0" />
      </Pressable>

      <View style={styles.interestBanner}>
        <View style={styles.interestCopy}>
          <Text style={styles.interestTitle}>Contanos qué es lo que más te gusta</Text>
          <View style={styles.interestHintRow}>
            <Ionicons name="heart" size={14} color="#fff" />
            <Text style={styles.interestHint}>
              Recibí recomendaciones de talleres según tus intereses
            </Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/profile/edit' as Href)}>
          <Text style={styles.interestLink}>Añadir intereses</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Preferencias</Text>
      <View style={styles.group}>
        <MenuRow
          icon="flash-outline"
          label="Intereses"
          onPress={() => router.push('/profile/edit' as Href)}
        />
        <MenuRow
          icon="people-outline"
          label="Amigos"
          badge="NUEVO"
          last
          onPress={() => soon('Amigos')}
        />
      </View>

      <View style={styles.group}>
        <MenuRow
          icon="ribbon-outline"
          label="Profesores que seguís"
          onPress={() => soon('Profesores')}
        />
        <MenuRow
          icon="notifications-outline"
          label="Administrar las notificaciones"
          last
          onPress={() => soon('Notificaciones')}
        />
      </View>

      <Text style={styles.sectionTitle}>Ayuda</Text>
      <View style={styles.group}>
        <MenuRow
          icon="help-circle-outline"
          label="Explorá el Centro de ayuda"
          last
          onPress={() =>
            Alert.alert(
              'Centro de ayuda',
              'Pronto vas a poder consultar preguntas frecuentes desde la app. Mientras tanto escribinos desde la web.'
            )
          }
        />
      </View>

      <Text style={styles.sectionTitle}>Legal</Text>
      <View style={styles.group}>
        <MenuRow
          icon="document-text-outline"
          label="Términos de servicio"
          onPress={() => soon('Términos de servicio')}
        />
        <MenuRow
          icon="lock-closed-outline"
          label="Privacidad"
          onPress={() => soon('Privacidad')}
        />
        <MenuRow
          icon="accessibility-outline"
          label="Accesibilidad"
          onPress={() => soon('Accesibilidad')}
        />
        <MenuRow
          icon="information-circle-outline"
          label="Cookies"
          last
          onPress={() => soon('Cookies')}
        />
      </View>

      <View style={styles.versionRow}>
        <Text style={styles.versionLabel}>Versión</Text>
        <Text style={styles.versionValue}>{versionLabel}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutRow, pressed && styles.pressed]}
        onPress={handleSignOut}
      >
        <Ionicons name="exit-outline" size={22} color={COLORS.textPrimary} />
        <Text style={styles.logoutLabel}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  content: {
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  pageTitlePad: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 0,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  profileMain: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 1,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  socialText: {
    fontSize: 13,
    color: '#444',
  },
  socialBold: {
    fontWeight: '800',
    color: '#111',
  },
  interestBanner: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
    gap: 12,
  },
  interestCopy: {
    gap: 8,
  },
  interestTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  interestHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  interestHint: {
    flex: 1,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 18,
  },
  interestLink: {
    alignSelf: 'flex-end',
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
    marginTop: 4,
  },
  group: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },
  badge: {
    backgroundColor: '#b6f36c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 14,
    marginBottom: 8,
  },
  versionLabel: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 15,
    color: '#888',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  pressed: { opacity: 0.88 },
});
