import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useRouter, type Href, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePublishedWorkshops } from '../../hooks/usePublishedWorkshops';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { COLORS } from '../../constants/theme';
import {
  FEATURED_GRID_GAP,
  featuredCardWidth,
  featuredColumnCount,
  useHomeLayout,
} from '../../hooks/useHomeLayout';
import type { Workshop } from '../../types';

const MAX_ITEMS = 12;

function formatPrice(w: Workshop): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: w.currency || 'ARS',
      maximumFractionDigits: 0,
    }).format(w.price);
  } catch {
    return `${w.currency ?? ''} ${w.price}`;
  }
}

function descriptionPreview(desc: string): string {
  return desc.replace(/\s+/g, ' ').trim();
}

function scoreFeatured(w: Workshop): number {
  const rating = w.stats?.avgRating ?? 0;
  const reviews = w.stats?.reviewsCount ?? 0;
  const enrolled = w.stats?.enrolledCount ?? 0;
  return rating * 1000 + reviews * 50 + enrolled;
}

export function FeaturedWorkshopsSection() {
  const router = useRouter();
  const { horizontalPadding, contentInnerWidth, windowWidth, windowHeight, isTablet } =
    useHomeLayout();
  const [measuredGridWidth, setMeasuredGridWidth] = useState(0);

  /** Ancho real de la grilla; si onLayout no dispara (web), usamos el de pantalla */
  const effectiveGridWidth = useMemo(() => {
    if (measuredGridWidth > 0) return measuredGridWidth;
    return Math.max(1, contentInnerWidth);
  }, [measuredGridWidth, contentInnerWidth]);

  const featuredColumns = useMemo(
    () => featuredColumnCount(effectiveGridWidth, windowWidth, windowHeight),
    [effectiveGridWidth, windowWidth, windowHeight]
  );

  const cardWidth = useMemo(
    () => featuredCardWidth(effectiveGridWidth, featuredColumns),
    [effectiveGridWidth, featuredColumns]
  );

  const onGridLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w <= 0) return;
    setMeasuredGridWidth((prev) => (Math.abs(prev - w) < 0.5 ? prev : w));
  }, []);

  const { user } = useAuth();
  const {
    workshops,
    loading,
    error,
    retryAttempt,
    maxRetryAttempts,
    refetch,
  } = usePublishedWorkshops();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites(
    user?.uid ?? null
  );

  useFocusEffect(
    useCallback(() => {
      void refreshFavorites();
      if (error) {
        void refetch();
      }
    }, [refreshFavorites, error, refetch])
  );

  const featured = [...workshops]
    .sort((a, b) => scoreFeatured(b) - scoreFeatured(a))
    .slice(0, MAX_ITEMS);

  const handleToggleFavorite = useCallback(
    async (workshopId: string) => {
      if (!user) {
        Alert.alert(
          'Guardar taller',
          'Iniciá sesión para guardar talleres y verlos en Mis talleres.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir a login', onPress: () => router.push('/auth/login' as Href) },
          ]
        );
        return;
      }
      try {
        await toggleFavorite(workshopId);
      } catch {
        Alert.alert('Error', 'No se pudo actualizar el guardado.');
      }
    },
    [user, toggleFavorite, router]
  );

  const headerRow = (
    <View style={styles.headRow}>
      <Text
        style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}
      >
        Talleres destacados
      </Text>
      <Pressable
        style={({ pressed }) => [styles.verMas, pressed && styles.verMasPressed]}
        onPress={() => router.push('/workshops' as Href)}
      >
        <Text style={styles.verMasText}>Ver más</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
      {headerRow}

      {loading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={COLORS.primaryGreen} />
          {retryAttempt > 0 && maxRetryAttempts > 0 ? (
            <Text style={styles.loadingHint}>
              Conectando con Firestore… reintento {retryAttempt} de {maxRetryAttempts}
            </Text>
          ) : (
            <Text style={styles.loadingHint}>Cargando talleres…</Text>
          )}
        </View>
      ) : error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.muted}>No se pudieron cargar los talleres.</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            onPress={() => void refetch()}
          >
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : featured.length === 0 ? (
        <Text style={styles.muted}>Todavía no hay talleres publicados.</Text>
      ) : (
        <View style={styles.gridOuter} onLayout={onGridLayout}>
          <View
            style={[
              styles.grid,
              { columnGap: FEATURED_GRID_GAP, rowGap: FEATURED_GRID_GAP },
            ]}
          >
          {featured.map((w) => (
            <Pressable
              key={w.id}
              style={({ pressed }) => [
                styles.card,
                { width: cardWidth, maxWidth: cardWidth },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(`/workshops/${w.id}`)}
            >
              <View style={styles.coverWrap}>
                {w.coverImageUrl ? (
                  <Image
                    source={{ uri: w.coverImageUrl }}
                    style={styles.cover}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cover, styles.coverPlaceholder]} />
                )}
              </View>
              <View style={styles.cardBodyRow}>
                <View style={styles.cardBody}>
                  <Text style={styles.titleLine} numberOfLines={2}>
                    <Text style={styles.cardTitle}>{w.title}</Text>
                    {w.teacherName ? (
                      <Text style={styles.teacherInline}>{' · '}{w.teacherName}</Text>
                    ) : null}
                  </Text>
                  {w.description?.trim() ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {descriptionPreview(w.description)}
                    </Text>
                  ) : null}
                  <Text style={styles.price}>{formatPrice(w)}</Text>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.favStarAside,
                    pressed && styles.favStarPressed,
                  ]}
                  hitSlop={8}
                  onPress={() => void handleToggleFavorite(w.id)}
                >
                  <Ionicons
                    name={isFavorite(w.id) ? 'star' : 'star-outline'}
                    size={20}
                    color={isFavorite(w.id) ? '#f59e0b' : '#64748b'}
                  />
                </Pressable>
              </View>
            </Pressable>
          ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingBottom: 32,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  sectionTitleTablet: {
    fontSize: 24,
  },
  verMas: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  verMasPressed: { opacity: 0.9 },
  verMasText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingBlock: {
    marginTop: 8,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  muted: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  errorBlock: {
    marginTop: 8,
    gap: 10,
  },
  errorDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  retryBtnText: {
    color: COLORS.primaryGreenDark,
    fontWeight: '600',
    fontSize: 14,
  },
  gridOuter: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  pressed: { opacity: 0.92 },
  coverWrap: {
    width: '100%',
    aspectRatio: 1.15,
    backgroundColor: '#f0f0f0',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#e8e8e8',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    minWidth: 0,
  },
  favStarAside: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  favStarPressed: { opacity: 0.85 },
  titleLine: {
    marginBottom: 4,
    lineHeight: 19,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  teacherInline: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
  },
});
