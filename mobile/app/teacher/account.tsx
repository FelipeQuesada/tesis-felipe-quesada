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
import { TeacherShell } from '../../src/components/teacher/TeacherShell';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';

export default function TeacherAccountScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) {
      router.replace('/');
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

  if (loading || !user || user.role !== 'teacher') {
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
        <Text style={styles.pageTitle}>Mi cuenta</Text>

        <AccountProfileCard
          displayName={
            [user.firstName, user.lastName].filter(Boolean).join(' ') ||
            user.displayName ||
            user.email.split('@')[0] ||
            user.email
          }
          email={user.email}
          photoURL={user.photoURL}
          roleLabel="Profesor"
          hint="Tocá para editar tu perfil"
          onPress={() => router.push('/profile/edit' as Href)}
        />

        <Text style={styles.section}>Menú</Text>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => router.push('/profile/edit' as Href)}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Editar perfil</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() => router.push('/teacher/workshops')}
        >
          <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Mis talleres</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() =>
            Alert.alert('Configuración', 'Pronto podrás editar preferencias desde la app.')
          }
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Configuración</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          onPress={() =>
            Alert.alert('Atención al cliente', 'Escribinos desde la web o por correo.')
          }
        >
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.rowLabel}>Atención al cliente</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.rowDanger, pressed && styles.pressed]}
          onPress={() => void handleSignOut()}
        >
          <Ionicons name="log-out-outline" size={22} color="#c62828" />
          <Text style={styles.rowDangerLabel}>Cerrar sesión</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  row: {
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
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  rowDanger: {
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
  rowDangerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c62828',
  },
  pressed: { opacity: 0.88 },
});
