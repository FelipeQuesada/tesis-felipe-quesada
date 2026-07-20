import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Href } from 'expo-router';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/teacher/home', label: 'Inicio', icon: 'home-outline' },
  { href: '/teacher/workshops/new', label: 'Crear', icon: 'add-circle-outline' },
  { href: '/teacher/workshops', label: 'Mis Talleres', icon: 'bookmark-outline' },
  { href: '/teacher/account', label: 'Cuenta', icon: 'person-outline' },
];

function navItemActive(pathname: string, href: string): boolean {
  if (href === '/teacher/home') {
    return pathname === '/teacher/home';
  }
  if (href === '/teacher/workshops/new') {
    return pathname === '/teacher/workshops/new';
  }
  if (href === '/teacher/account') {
    return pathname === '/teacher/account';
  }
  if (href === '/teacher/workshops') {
    return (
      pathname.startsWith('/teacher/workshops') &&
      pathname !== '/teacher/workshops/new'
    );
  }
  return false;
}

export function TeacherBottomNav() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: bottomPad,
          minHeight: 48 + bottomPad,
        },
      ]}
    >
      {ITEMS.map((item) => {
        const active = navItemActive(pathname, item.href);
        const color = active ? COLORS.primaryGreen : COLORS.textSecondary;
        return (
          <Pressable
            key={item.href}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            accessibilityLabel={item.label}
            onPress={() => router.push(item.href as Href)}
          >
            <Ionicons name={item.icon} size={26} color={color} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
