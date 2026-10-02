import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useStudentEnrollments } from '../../src/hooks/useStudentEnrollments';
import { useFavorites } from '../../src/hooks/useFavorites';
import { getWorkshopById } from '../../src/services/workshops.service';
import { COLORS } from '../../src/constants/theme';
import { resolvePublicAssetUri } from '../../src/lib/siteAssets';
import { stockCoverByCategory, stockCoverByIndex } from '../../src/lib/stockImages';
import type { Enrollment, Workshop } from '../../src/types';

function enrollmentStatusLabel(status: Enrollment['status']): string {
  switch (status) {
    case 'pending_payment':
      return 'Pendiente de pago';
    case 'paid':
      return 'Pagado';
    case 'cancelled':
      return 'Cancelado';
    case 'refunded':
      return 'Reembolsado';
    default:
      return status;
  }
}

function coverUri(workshop: Workshop | undefined, index: number): string | null {
  const path =
    workshop?.coverImageUrl?.trim() ||
    stockCoverByCategory(workshop?.categoryId) ||
    stockCoverByIndex(index);
  if (!path) return null;
  return path.startsWith('http') ? path : resolvePublicAssetUri(path);
}

function formatPrice(workshop: Workshop): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: workshop.currency || 'ARS',
      maximumFractionDigits: 0,
    }).format(workshop.price);
  } catch {
    return `${workshop.currency ?? ''} ${workshop.price}`;
  }
}

export default function MyWorkshopsScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    enrollments,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useStudentEnrollments(user?.uid ?? null);
  const { favoriteIds, toggleFavorite, refreshFavorites, loading: favoritesLoading } =
    useFavorites(user?.uid ?? null);

  const [workshopsById, setWorkshopsById] = useState<Record<string, Workshop>>({});
  const [loadingEnrollWorkshops, setLoadingEnrollWorkshops] = useState(true);
  const [favoriteWorkshops, setFavoriteWorkshops] = useState<Workshop[]>([]);
  const [loadingFavWorkshops, setLoadingFavWorkshops] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState<'enrolled' | 'favorites'>('enrolled');
  const params = useLocalSearchParams<{ section?: string }>();

  useFocusEffect(
    useCallback(() => {
      void refreshFavorites();
    }, [refreshFavorites])
  );

  useEffect(() => {
    if (!authLoading && user?.role === 'teacher') {
      router.replace('/teacher/workshops');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const value = Array.isArray(params.section) ? params.section[0] : params.section;
    if (value === 'favorites') setSection('favorites');
  }, [params.section]);

  const loadWorkshopsForEnrollments = useCallback(async (list: Enrollment[]) => {
    if (list.length === 0) {
      setWorkshopsById({});
      setLoadingEnrollWorkshops(false);
      return;
    }

    try {
      setLoadingEnrollWorkshops(true);
      const uniqueIds = [...new Set(list.map((e) => e.workshopId))];
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          const w = await getWorkshopById(id);
          return { id, workshop: w };
        })
      );
      const map: Record<string, Workshop> = {};
      results.forEach(({ id, workshop }) => {
        if (workshop) map[id] = workshop;
      });
      setWorkshopsById(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEnrollWorkshops(false);
    }
  }, []);

  useEffect(() => {
    if (!enrollmentsLoading) {
      void loadWorkshopsForEnrollments(enrollments);
    }
  }, [enrollmentsLoading, enrollments, loadWorkshopsForEnrollments]);

  useEffect(() => {
    if (!user?.uid) {
      setFavoriteWorkshops([]);
      return;
    }
    const ids = [...favoriteIds];
    if (ids.length === 0) {
      setFavoriteWorkshops([]);
      return;
    }
    let cancelled = false;
    setLoadingFavWorkshops(true);
    void Promise.all(ids.map((id) => getWorkshopById(id)))
      .then((rows) => {
        if (cancelled) return;
        const ws = rows.filter(
          (w): w is Workshop => !!w && w.status === 'published'
        );
        setFavoriteWorkshops(ws);
      })
      .finally(() => {
        if (!cancelled) setLoadingFavWorkshops(false);
      });
    return () => {
      cancelled = true;
    };
  }, [favoriteIds, user?.uid]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const fresh = await refetchEnrollments();
      await loadWorkshopsForEnrollments(fresh);
      await refreshFavorites();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnsave = async (workshopId: string) => {
    if (!user?.uid) return;
    try {
      await toggleFavorite(workshopId);
    } catch (e) {
      console.error(e);
    }
  };

  if (!authLoading && user?.role === 'teacher') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (
    authLoading ||
    enrollmentsLoading ||
    loadingEnrollWorkshops ||
    favoritesLoading ||
    loadingFavWorkshops
  ) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="bookmark-outline" size={56} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Iniciá sesión para ver tus talleres</Text>
        <Text style={styles.emptyBody}>
          Guardá talleres con la estrella en Explorar y ver tus inscripciones acá.
        </Text>
        <Link href="/auth/login" asChild>
          <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
            <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (enrollmentsError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{enrollmentsError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, section === 'enrolled' && styles.tabOn]}
          onPress={() => setSection('enrolled')}
        >
          <Text style={[styles.tabText, section === 'enrolled' && styles.tabTextOn]}>
            Inscriptos
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, section === 'favorites' && styles.tabOn]}
          onPress={() => setSection('favorites')}
        >
          <Text style={[styles.tabText, section === 'favorites' && styles.tabTextOn]}>
            ★ Favoritos
          </Text>
        </Pressable>
      </View>

      {section === 'favorites' ? (
        <FlatList
          data={favoriteWorkshops}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            favoriteWorkshops.length === 0 ? styles.listEmpty : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={COLORS.primaryGreen}
            />
          }
          ListEmptyComponent={
            <View style={styles.inlineEmpty}>
              <Text style={styles.inlineEmptyText}>
                No tienes talleres guardados en favoritos.
              </Text>
              <Text style={styles.emptyHint}>Tocá la estrella en un taller para guardarlo.</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const uri = coverUri(item, index);
            const reviews =
              item.stats?.reviewsCount && item.stats.reviewsCount > 0
                ? `★ ${item.stats.avgRating?.toFixed(1) ?? '–'} · ${item.stats.reviewsCount} reseñas`
                : 'Sin reseñas';
            return (
              <Pressable
                style={({ pressed }) => [styles.exploreCard, pressed && styles.cardPressed]}
                onPress={() => router.push(`/workshops/${item.id}`)}
              >
                <View style={styles.exploreCover}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.cover} resizeMode="cover" />
                  ) : (
                    <View style={styles.coverPlaceholder}>
                      <Ionicons name="image-outline" size={28} color="#94a3b8" />
                    </View>
                  )}
                </View>
                <View style={styles.exploreBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                    {item.teacherName ? (
                      <Text style={styles.teacherInline}> · {item.teacherName}</Text>
                    ) : null}
                  </Text>
                  {item.description?.trim() ? (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description.replace(/\s+/g, ' ').trim()}
                    </Text>
                  ) : null}
                  <View style={styles.exploreFooter}>
                    <Text style={styles.price}>{formatPrice(item)}</Text>
                    <Text style={styles.meta}>{reviews}</Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [styles.favStarAside, pressed && styles.favStarPressed]}
                  hitSlop={10}
                  onPress={() => void handleUnsave(item.id)}
                >
                  <Ionicons name="star" size={22} color="#f59e0b" />
                </Pressable>
              </Pressable>
            );
          }}
        />
      ) : (
        <FlatList
          data={enrollments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={enrollments.length === 0 ? styles.listEmpty : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void onRefresh()}
              tintColor={COLORS.primaryGreen}
            />
          }
          ListEmptyComponent={
            <View style={styles.inlineEmpty}>
              <Text style={styles.inlineEmptyText}>No tienes talleres inscritos aún.</Text>
              <Pressable
                style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
                onPress={() => router.push('/workshops')}
              >
                <Text style={styles.linkBtnText}>Explorar talleres</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item, index }) => {
            const workshop = workshopsById[item.workshopId];
            const uri = coverUri(workshop, index);
            return (
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/workshops/${item.workshopId}`)}
              >
                <View style={styles.coverWrap}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.cover} resizeMode="cover" />
                  ) : (
                    <View style={styles.coverPlaceholder}>
                      <Ionicons name="image-outline" size={28} color="#94a3b8" />
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {workshop?.title ?? `Taller ${item.workshopId}`}
                  </Text>
                  {workshop?.teacherName ? (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {workshop.teacherName}
                    </Text>
                  ) : null}
                  <Text style={styles.status}>{enrollmentStatusLabel(item.status)}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabOn: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  tabText: { fontWeight: '700', color: COLORS.textPrimary, fontSize: 14 },
  tabTextOn: { color: '#fff' },
  exploreCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exploreCover: { width: 100, backgroundColor: '#e2e8f0' },
  exploreBody: { flex: 1, padding: 12, justifyContent: 'center', minWidth: 0 },
  exploreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  teacherInline: { fontWeight: '500', color: COLORS.textSecondary },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  price: { fontSize: 15, fontWeight: '700', color: COLORS.brandForest },
  meta: { fontSize: 12, color: COLORS.textSecondary, flexShrink: 1 },
  emptyHint: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  pressed: { opacity: 0.88 },
  errorText: {
    color: '#b91c1c',
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  inlineEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  inlineEmptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  linkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  linkBtnText: {
    color: COLORS.primaryGreenDark,
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  cardPressed: { opacity: 0.92 },
  coverWrap: {
    height: 140,
    backgroundColor: '#f5f5f5',
  },
  cover: { width: '100%', height: '100%' },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
  },
  favStarAside: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  favStarPressed: { opacity: 0.85 },
  cardBody: {
    flex: 1,
    padding: 14,
    minWidth: 0,
  },
  savedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primaryGreen,
  },
});
