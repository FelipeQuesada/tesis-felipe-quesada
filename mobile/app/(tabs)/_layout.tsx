import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { greenHeaderScreenOptions } from '../../src/constants/navigation';
import { FloatingTabBar } from '../../src/components/navigation/FloatingTabBar';
import { COLORS } from '../../src/constants/theme';

const NAV_GREEN = '#2D7D53';

type IonName = ComponentProps<typeof Ionicons>['name'];

function HomeIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.5 10.5L12 4l7.5 6.5V19a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V10.5z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill={focused ? color : 'none'}
      />
      <Path
        d="M10 20.5V14h4v6.5"
        stroke={focused ? '#FFFFFF' : color}
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TabIon({
  focused,
  color,
  size,
  outline,
  filled,
}: {
  focused: boolean;
  color: string;
  size: number;
  outline: IonName;
  filled: IonName;
}) {
  return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        ...greenHeaderScreenOptions,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: COLORS.background },
        // Mismo patrón que Advance ventas: transparente + absoluto para que flote.
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 'auto',
        },
        tabBarActiveTintColor: NAV_GREEN,
        tabBarInactiveTintColor: '#5C6B63',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
          tabBarLabel: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => (
            <HomeIcon focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workshops"
        options={{
          title: 'Buscar',
          headerShown: false,
          tabBarLabel: 'Buscar',
          tabBarAccessibilityLabel: 'Buscar',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIon
              focused={focused}
              color={color}
              size={size}
              outline="search-outline"
              filled="search"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-workshops"
        options={{
          title: 'Guardados',
          tabBarLabel: 'Guardados',
          tabBarAccessibilityLabel: 'Guardados',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIon
              focused={focused}
              color={color}
              size={size}
              outline="bookmark-outline"
              filled="bookmark"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          headerShown: false,
          tabBarLabel: 'Cuenta',
          tabBarAccessibilityLabel: 'Cuenta',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIon
              focused={focused}
              color={color}
              size={size}
              outline="person-outline"
              filled="person"
            />
          ),
        }}
      />
    </Tabs>
  );
}
