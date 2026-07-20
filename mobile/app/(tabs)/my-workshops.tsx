import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useStudentEnrollments } from '../../src/hooks/useStudentEnrollments';
import { useFavorites } from '../../src/hooks/useFavorites';
import { getWorkshopById } from '../../src/services/workshops.service';
import { COLORS } from '../../src/constants/theme';
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

function isEnrollment(item: Workshop | Enrollment): item is Enrollment {
  return 'sessionId' in item && 'studentId' in item;
}

type SectionRow = {
  title: string;
  kind: 'saved' | 'enrolled';
  data: (Workshop | Enrollment)[];
};

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

  const sections = useMemo((): SectionRow[] => {
    const out: SectionRow[] = [];
    if (favoriteWorkshops.length > 0) {
      out.push({
        title: 'Guardados',
        kind: 'saved',
        data: favoriteWorkshops,
      });
    }
    if (enrollments.length > 0) {
      out.push({
        title: 'Mis inscripciones',
        kind: 'enrolled',
        data: enrollments,
      });
    }
    return out;
  }, [favoriteWorkshops, enrollments]);

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
    <SectionList<Workshop | Enrollment, SectionRow>
      sections={sections}
      keyExtractor={(item) =>
        isEnrollment(item) ? `e-${item.id}` : `s-${item.id}`
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionHeader}>{section.title}</Text>
      )}
      contentContainerStyle={
        sections.length === 0 ? styles.listEmpty : styles.listContent
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
            No tenés talleres guardados ni inscripciones aún.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]}
            onPress={() => router.push('/workshops')}
          >
            <Text style={styles.linkBtnText}>Explorar talleres</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item, section }) => {
        if (section.kind === 'saved') {
          const w = item as Workshop;
          const coverUri = w.coverImageUrl;
          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/workshops/${w.id}`)}
            >
              <View style={styles.coverWrap}>
                {coverUri ? (
                  <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Ionicons name="image-outline" size={28} color="#94a3b8" />
                  </View>
                )}
              </View>
              <View style={styles.cardBodyRow}>
                <View style={styles.cardBody}>
                  <Text style={styles.savedBadge}>Guardado</Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {w.title}
                  </Text>
                  {w.teacherName ? (
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {w.teacherName}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.favStarAside, pressed && styles.favStarPressed]}
                  hitSlop={10}
                  onPress={() => void handleUnsave(w.id)}
                >
                  <Ionicons name="star" size={22} color="#f59e0b" />
                </Pressable>
              </View>
            </Pressable>
          );
        }

        const enr = item as Enrollment;
        const workshop = workshopsById[enr.workshopId];
        const coverUri = workshop?.coverImageUrl;

        return (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(`/workshops/${enr.workshopId}`)}
          >
            <View style={styles.coverWrap}>
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="image-outline" size={28} color="#94a3b8" />
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {workshop?.title ?? `Taller ${enr.workshopId}`}
              </Text>
              {workshop?.teacherName ? (
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {workshop.teacherName}
                </Text>
              ) : null}
              <Text style={styles.status}>{enrollmentStatusLabel(enr.status)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
