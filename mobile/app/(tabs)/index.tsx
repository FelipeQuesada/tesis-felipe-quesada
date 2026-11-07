import { useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { useFavorites } from '../../src/hooks/useFavorites';
import { usePublishedWorkshops } from '../../src/hooks/usePublishedWorkshops';
import { usePublishedBlogPosts } from '../../src/hooks/useBlog';
import { COLORS } from '../../src/constants/theme';
import { blogCoverUri } from '../../src/lib/blogDisplay';
import { resolvePublicAssetUri } from '../../src/lib/siteAssets';
import { HomeQuickLinks } from '../../src/components/home/HomeQuickLinks';
import { HomeWelcomeHero } from '../../src/components/home/HomeWelcomeHero';
import { HomeSearchBar } from '../../src/components/home/HomeSearchBar';
import { FLOATING_TAB_BAR_SPACE } from '../../src/components/navigation/FloatingTabBar';
import { stockCoverByCategory, stockCoverByIndex } from '../../src/lib/stockImages';
import { getCategoryChipStyle } from '../../src/lib/categoryColors';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(user?.uid ?? null);
  const {
    workshops,
    loading: wLoading,
    error: wError,
    refetch: refetchWorkshops,
  } = usePublishedWorkshops();
  const { posts, loading: bLoading } = usePublishedBlogPosts();

  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      router.replace('/teacher/home');
    }
  }, [loading, user, router]);

  if (!loading && user?.role === 'teacher') {
    return <View style={styles.blank} />;
  }

  const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();

  const recommended = [...workshops]
    .sort(
      (a, b) =>
        (b.stats?.enrolledCount ?? 0) - (a.stats?.enrolledCount ?? 0) ||
        (b.stats?.avgRating ?? 0) - (a.stats?.avgRating ?? 0)
    )
    .slice(0, 8);

  const blogList = posts.slice(0, 6);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topbar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>✦</Text>
          </View>
          <Text style={styles.brand}>MiTaller</Text>
        </View>
        <View style={styles.topActions}>
          {user ? (
            <Pressable onPress={() => router.push('/account')}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
              )}
            </Pressable>
          ) : (
            <Pressable style={styles.loginChip} onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginChipText}>Entrar</Text>
            </Pressable>
          )}
        </View>
      </View>

      <HomeWelcomeHero />
      <HomeSearchBar />
      <HomeQuickLinks workshops={workshops} />

      <View style={styles.promo}>
        <Text style={styles.eyebrow}>UNA COMUNIDAD CREATIVA</Text>
        <Text style={styles.promoTitle}>Aprendé arte donde y cuando quieras</Text>
        <Text style={styles.promoSub}>
          Descubrí talleres presenciales cerca tuyo y conectá con personas que
          comparten tu pasión.
        </Text>
        <Pressable style={styles.cta} onPress={() => router.push('/workshops')}>
          <Text style={styles.ctaText}>Explorar talleres →</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Talleres recomendados</Text>
        <Pressable onPress={() => router.push('/workshops')}>
          <Text style={styles.seeAll}>Ver todos →</Text>
        </Pressable>
      </View>

      {wLoading ? (
        <Text style={styles.empty}>Cargando talleres…</Text>
      ) : wError ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No pudimos cargar los talleres</Text>
          <Text style={styles.emptyBody} numberOfLines={3}>
            {wError.message}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => void refetchWorkshops()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : recommended.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="color-palette-outline" size={36} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Todavía no hay talleres publicados</Text>
          <Text style={styles.emptyBody}>
            Cuando haya propuestas nuevas van a aparecer acá.
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => router.push('/workshops')}>
            <Text style={styles.retryBtnText}>Ir a buscar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {recommended.map((w, i) => {
            const chip = getCategoryChipStyle(w.categoryId);
            const coverPath = w.coverImageUrl?.trim()
              ? w.coverImageUrl
              : stockCoverByCategory(w.categoryId) || stockCoverByIndex(i);
            const cover = coverPath.startsWith('http')
              ? coverPath
              : resolvePublicAssetUri(coverPath);
            return (
              <Pressable
                key={w.id}
                style={styles.workshopCard}
                onPress={() => router.push(`/workshops/${w.id}` as Href)}
              >
                <View style={styles.coverWrap}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={styles.cover} />
                  ) : (
                    <View style={[styles.cover, { backgroundColor: chip.bg }]} />
                  )}
                  <Pressable
                    style={styles.favBtn}
                    hitSlop={8}
                    onPress={() => {
                      if (!user) {
                        Alert.alert(
                          'Guardar taller',
                          'Iniciá sesión para guardar talleres y verlos en Mis talleres.',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Ir a login',
                              onPress: () => router.push('/auth/login' as Href),
                            },
                          ]
                        );
                        return;
                      }
                      void toggleFavorite(w.id);
                    }}
                  >
                    <Ionicons
                      name={isFavorite(w.id) ? 'star' : 'star-outline'}
                      size={16}
                      color={isFavorite(w.id) ? '#b45309' : COLORS.brandForest}
                    />
                  </Pressable>
                </View>
                <View style={styles.cardBody}>
                  <Text
                    style={[styles.chip, { backgroundColor: chip.bg, color: chip.color }]}
                  >
                    {w.categoryId || 'Taller'}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {w.title}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {w.location?.addressText?.split(',')[0] || 'Presencial'}
                  </Text>
                  <Text style={styles.price}>
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: w.currency || 'ARS',
                      maximumFractionDigits: 0,
                    }).format(w.price)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Últimas del blog</Text>
        <Pressable onPress={() => router.push('/blog')}>
          <Text style={styles.seeAll}>Ver todas →</Text>
        </Pressable>
      </View>

      {bLoading ? (
        <Text style={styles.empty}>Cargando blog…</Text>
      ) : blogList.length === 0 ? (
        <Text style={styles.empty}>Pronto vas a ver notas del blog acá.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {blogList.map((post, i) => {
            const uri = blogCoverUri(post.coverImageUrl, i);
            const fallback = resolvePublicAssetUri(stockCoverByIndex(i));
            const cover = uri || fallback;
            return (
              <Pressable
                key={post.id}
                style={styles.blogCard}
                onPress={() => router.push(`/blog/${post.id}` as Href)}
              >
                <View style={styles.blogCover}>
                  {cover ? <Image source={{ uri: cover }} style={styles.cover} /> : null}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={3}>
                    {post.title}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  blank: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingBottom: FLOATING_TAB_BAR_SPACE },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.brandForest },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loginChip: {
    backgroundColor: COLORS.brandForest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  loginChipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brandForest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  promo: {
    borderRadius: 24,
    marginTop: 8,
    marginBottom: 22,
    padding: 18,
    backgroundColor: COLORS.mint,
    borderWidth: 1,
    borderColor: 'rgba(45, 106, 79, 0.12)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.brandForest,
    marginBottom: 8,
    lineHeight: 28,
  },
  promoSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 14,
    lineHeight: 20,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.brandForest,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.brandForest },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primaryGreen },
  hScroll: { gap: 12, paddingBottom: 16, paddingRight: 4 },
  workshopCard: {
    width: 210,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  coverWrap: { height: 132, backgroundColor: '#d9d3c9', position: 'relative' },
  cover: { width: '100%', height: '100%' },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 12 },
  chip: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.brandForest,
    marginBottom: 4,
    lineHeight: 20,
  },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginTop: 2,
  },
  blogCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  blogCover: { height: 112, backgroundColor: '#cfc7bb' },
  empty: { color: COLORS.textSecondary, marginBottom: 16 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 6,
    backgroundColor: COLORS.brandForest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
