import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

const ACTIVE_BG = '#E8F5E9';

/**
 * Ítem activo: pastilla verde claro detrás de ícono + etiqueta.
 */
export function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  accessibilityLabel,
  testID,
  style,
}: BottomTabBarButtonProps) {
  const focused = Boolean(accessibilityState?.selected);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: 'rgba(45, 125, 83, 0.12)', borderless: true }}
      style={({ pressed }) => [
        styles.pressable,
        style as object,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.chip, focused && styles.chipActive]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    minWidth: 68,
  },
  chipActive: {
    backgroundColor: ACTIVE_BG,
  },
});
