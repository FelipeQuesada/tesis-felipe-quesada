import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { COLORS } from '../../constants/theme';
import { FLOATING_TAB_BAR_SPACE } from '../navigation/FloatingTabBar';

type IonName = ComponentProps<typeof Ionicons>['name'];

type GuestAuthEmptyProps = {
  icon: IonName;
  title: string;
  body: string;
  showRegister?: boolean;
};

export function GuestAuthEmpty({
  icon,
  title,
  body,
  showRegister = false,
}: GuestAuthEmptyProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Ionicons name={icon} size={56} color={COLORS.textSecondary} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/auth/login' as Href)}
        >
          <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
        </Pressable>
        {showRegister ? (
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={() => router.push('/auth/register' as Href)}
          >
            <Text style={styles.secondaryBtnText}>Crear cuenta</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const BTN_WIDTH = 220;
const TEXT_WIDTH = 300;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: FLOATING_TAB_BAR_SPACE,
    backgroundColor: COLORS.background,
  },
  block: {
    width: '100%',
    maxWidth: TEXT_WIDTH,
    alignItems: 'center',
  },
  title: {
    width: '100%',
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 26,
  },
  body: {
    width: '100%',
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryBtn: {
    width: BTN_WIDTH,
    backgroundColor: COLORS.brandForest,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    width: BTN_WIDTH,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: { opacity: 0.88 },
});
