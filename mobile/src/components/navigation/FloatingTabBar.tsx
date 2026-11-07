import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Misma estructura que Advance ventas; colores MiTaller. */
const NAV = {
  pillBg: '#EEF2EF',
  indicator: '#FFFFFF',
  active: '#2D7D53',
  inactive: '#5C6B63',
  border: 'rgba(27, 67, 50, 0.08)',
} as const;

const SPRING = { damping: 22, stiffness: 320, mass: 0.85 };

type TabOptions = {
  href?: string | null;
  title?: string;
  tabBarLabel?:
    | string
    | ((props: {
        focused: boolean;
        color: string;
        position: string;
        children: string;
      }) => React.ReactNode);
  tabBarIcon?: (props: {
    focused: boolean;
    color: string;
    size: number;
  }) => React.ReactNode;
  tabBarAccessibilityLabel?: string;
};

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type FloatingTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  descriptors: Record<string, { options: TabOptions }>;
  navigation: {
    emit: (event: {
      type: string;
      target?: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

export function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route) => {
        const options = descriptors[route.key].options;
        return options.href !== null;
      }),
    [state.routes, descriptors]
  );

  const focusedRouteKey = state.routes[state.index]?.key;
  const activeIndex = Math.max(
    0,
    visibleRoutes.findIndex((route) => route.key === focusedRouteKey)
  );

  const itemWidth =
    trackWidth > 0 && visibleRoutes.length > 0
      ? trackWidth / visibleRoutes.length
      : 0;

  useEffect(() => {
    if (itemWidth <= 0) return;
    Animated.spring(indicatorX, {
      toValue: activeIndex * itemWidth,
      useNativeDriver: true,
      ...SPRING,
    }).start();
  }, [activeIndex, itemWidth, indicatorX]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);

  return (
    <View
      style={[styles.wrapper, { paddingBottom: bottomPad }]}
      pointerEvents="box-none"
    >
      <View style={styles.pill}>
        <View style={styles.track} onLayout={onTrackLayout}>
          {itemWidth > 0 ? (
            <Animated.View
              style={[
                styles.indicator,
                {
                  width: itemWidth,
                  transform: [{ translateX: indicatorX }],
                },
              ]}
            />
          ) : null}
          {visibleRoutes.map((route) => {
            const options = descriptors[route.key].options;
            const isFocused = route.key === focusedRouteKey;
            const color = isFocused ? NAV.active : NAV.inactive;

            let label: React.ReactNode = options.title ?? route.name;
            if (typeof options.tabBarLabel === 'string') {
              label = options.tabBarLabel;
            } else if (typeof options.tabBarLabel === 'function') {
              label = options.tabBarLabel({
                focused: isFocused,
                color,
                position: 'below-icon',
                children: options.title ?? route.name,
              });
            }

            const icon = options.tabBarIcon?.({
              focused: isFocused,
              color,
              size: isFocused ? 24 : 22,
            });

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.item}
              >
                {icon}
                {typeof label === 'string' || typeof label === 'number' ? (
                  <Text
                    style={[
                      styles.label,
                      { color },
                      isFocused ? styles.labelActive : null,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                ) : (
                  label
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** Espacio inferior del scroll para que el contenido no quede detrás de la isla. */
export const FLOATING_TAB_BAR_SPACE = 100;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  pill: {
    backgroundColor: NAV.pillBg,
    borderRadius: 999,
    padding: 5,
    borderWidth: 1,
    borderColor: NAV.border,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  track: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    backgroundColor: NAV.indicator,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  item: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minHeight: 48,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  labelActive: {
    fontWeight: '700',
  },
});
