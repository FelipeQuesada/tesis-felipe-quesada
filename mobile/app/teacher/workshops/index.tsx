import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TeacherShell } from '../../../src/components/teacher/TeacherShell';
import { COLORS } from '../../../src/constants/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useTeacherWorkshops } from '../../../src/hooks/useTeacherWorkshops';
import {
  publishWorkshop,
  unpublishWorkshop,
} from '../../../src/services/workshops.service';
import { resolvePublicAssetUri } from '../../../src/lib/siteAssets';
import type { Workshop } from '../../../src/types';

function formatPrice(w: Workshop): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: w.currency || 'ARS',
      maximumFractionDigits: 0,
    }).format(w.price);
  } catch {
    return `${w.currency} ${w.price}`;
  }
}

export default function TeacherWorkshopsListScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { workshops, loading, refetch } = useTeacherWorkshops(user?.uid ?? null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  const onPublish = async (id: string) => {
    try {
      await publishWorkshop(id);
      await refetch({ silent: true });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo publicar el taller.');
    }
  };

  const onUnpublish = async (id: string) => {
    try {
      await unpublishWorkshop(id);
      await refetch({ silent: true });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo despublicar el taller.');
    }
  };

  if (authLoading || loading || !user || user.role !== 'teacher') {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      </TeacherShell>
    );
  }

  const promoFallback = resolvePublicAssetUri('/images/promo.png');

  return (
    <TeacherShell>
      <View style={styles.head}>
        <Pressable
          style={({ pressed }) => [styles.createBtn, pressed && styles.pressed]}
          onPress={() => router.push('/teacher/workshops/new' as Href)}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.createBtnText}>Crear</Text>
        </Pressable>
      </View>

      <FlatList
        data={workshops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          workshops.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await refetch({ silent: true });
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aún no has creado talleres</Text>
            <Text style={styles.emptyBody}>
              Comenzá a compartir tu conocimiento creando tu primer taller
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              onPress={() => router.push('/teacher/workshops/new' as Href)}
            >
              <Text style={styles.primaryBtnText}>Crear mi primer taller</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const uri =
            item.coverImageUrl?.startsWith('http')
              ? item.coverImageUrl
              : item.coverImageUrl
                ? resolvePublicAssetUri(item.coverImageUrl)
                : promoFallback;
          const published = item.status === 'published';
          const draft = item.status === 'draft';

          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.thumbWrap}>
                  {uri ? (
                    <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.thumbPh]}>
                      <Ionicons name="image-outline" size={28} color="#94a3b8" />
                    </View>
                  )}
                </View>
                <View style={styles.cardMain}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: published
                            ? COLORS.primaryGreenLight
                            : draft
                              ? '#fff3cd'
                              : '#f8d7da',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: published
                              ? COLORS.primaryGreenDark
                              : draft
                                ? '#856404'
                                : '#721c24',
                          },
                        ]}
                      >
                        {published ? 'Publicado' : draft ? 'Borrador' : 'Cancelado'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.meta}>
                    {formatPrice(item)} · {item.stats.enrolledCount}/{item.capacity}{' '}
                    inscriptos · ★ {item.stats.avgRating.toFixed(1)} (
                    {item.stats.reviewsCount})
                  </Text>
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() =>
                        router.push(`/teacher/workshops/${item.id}` as Href)
                      }
                    >
                      <Text style={styles.secondaryBtnText}>Detalle</Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() =>
                        router.push(`/teacher/workshops/${item.id}/edit` as Href)
                      }
                    >
                      <Text style={styles.secondaryBtnText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={styles.secondaryBtn}
                      onPress={() =>
                        router.push(`/teacher/workshops/${item.id}/students` as Href)
                      }
                    >
                      <Text style={styles.secondaryBtnText}>
                        Alumnos ({item.stats.enrolledCount})
                      </Text>
                    </Pressable>
                    {published ? (
                      <Pressable
                        style={styles.secondaryBtn}
                        onPress={() => void onUnpublish(item.id)}
                      >
                        <Text style={styles.secondaryBtnText}>Despublicar</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.primaryMini}
                        onPress={() => void onPublish(item.id)}
                      >
                        <Text style={styles.primaryMiniText}>Publicar</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, paddingTop: 0, paddingBottom: 24 },
  emptyList: { flexGrow: 1, padding: 16 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cardRow: { flexDirection: 'row', padding: 12, gap: 12 },
  thumbWrap: {},
  thumb: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
  },
  thumbPh: { alignItems: 'center', justifyContent: 'center' },
  cardMain: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  desc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  primaryMini: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: { opacity: 0.9 },
});
