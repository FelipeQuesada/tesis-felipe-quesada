import { COLORS } from './theme';

/** Mismo verde que `HomeHeroHeader` — headers de navegación unificados */
export const greenHeaderScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.primaryGreenDark,
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    color: '#ffffff',
    fontWeight: '600' as const,
    fontSize: 17,
  },
  headerShadowVisible: false,
  headerBackTitle: 'Atrás',
  headerTitleAlign: 'center' as const,
};

/** Alias para stacks nativos (Explorar, blog, auth, profesor, etc.) */
export const greenStackScreenOptions = greenHeaderScreenOptions;
