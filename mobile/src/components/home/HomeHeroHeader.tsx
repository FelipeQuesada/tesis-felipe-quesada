import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useHomeLayout } from '../../hooks/useHomeLayout';
import { COLORS } from '../../constants/theme';
import { RemoteAssetImage } from '../RemoteAssetImage';
import { resolvePublicAssetUri } from '../../lib/siteAssets';

export function HomeHeroHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { horizontalPadding } = useHomeLayout();
  const { user, loading } = useAuth();

  const userName =
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Usuario';

  const saludoUri = resolvePublicAssetUri('/images/saludo.png');

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, 10),
          paddingBottom: 14,
          paddingHorizontal: horizontalPadding,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <RemoteAssetImage
            uri={saludoUri}
            containerStyle={styles.saludoBox}
            style={styles.saludoImg}
            accessibilityLabel="Saludo"
            placeholderIcon="sparkles-outline"
          />
          {loading ? (
            <Text style={styles.title}>Cargando…</Text>
          ) : user ? (
            <Text style={styles.title}>Hola {userName}</Text>
          ) : null}
        </View>

        {!loading && user ? (
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityLabel="Notificaciones"
            disabled
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </Pressable>
        ) : null}

        {!loading && !user ? (
          <View style={styles.authButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.btnGhost,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/auth/register')}
            >
              <Text style={styles.btnGhostText}>Registrarse</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btnSolid,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.btnSolidText}>Iniciar sesión</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.primaryGreenDark,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  saludoBox: {
    width: 37,
    height: 37,
    borderRadius: 8,
    flexShrink: 0,
  },
  saludoImg: {
    width: 37,
    height: 37,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fff',
    flexShrink: 1,
  },
  iconBtn: {
    padding: 8,
  },
  authButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  btnGhost: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  btnGhostText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSolid: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  btnSolidText: {
    color: COLORS.primaryGreenDark,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
