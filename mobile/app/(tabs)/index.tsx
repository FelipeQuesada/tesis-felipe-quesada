import { useEffect } from 'react';
import {
  Image,
  ImageBackground,
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
import { usePublishedWorkshops } from '../../src/hooks/usePublishedWorkshops';
import { usePublishedBlogPosts } from '../../src/hooks/useBlog';
import { COLORS } from '../../src/constants/theme';
import { blogCoverUri } from '../../src/lib/blogDisplay';
import { resolvePublicAssetUri } from '../../src/lib/siteAssets';
import { HomeQuickLinks } from '../../src/components/home/HomeQuickLinks';
import { HomeWelcomeHero } from '../../src/components/home/HomeWelcomeHero';
import { HomeSearchBar } from '../../src/components/home/HomeSearchBar';
import { stockCoverByCategory, stockCoverByIndex } from '../../src/lib/stockImages';
import { getCategoryChipStyle } from '../../src/lib/categoryColors';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();
  const { workshops, loading: wLoading } = usePublishedWorkshops();
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
        (b.stats?.enrolledCount ?? 0) - (a.stats?.enrolledCount ?? 0)
    )
    .slice(0, 8);

  const blogList = posts.slice(0, 6);
  const promoUri = resolvePublicAssetUri('/images/stock-plantas.png');

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
            <>
              <View style={styles.iconBtn}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.brandForest} />
                <View style={styles.dot} />
              </View>
              <Pressable onPress={() => router.push('/account')}>
                {user.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                )}
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.cta} onPress={() => router.push('/auth/login')}>
              <Text style={styles.ctaText}>Entrar</Text>
            </Pressable>
          )}
        </View>
      </View>

      <HomeWelcomeHero />
      <HomeSearchBar />
      <HomeQuickLinks />

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Talleres recomendados</Text>
        <Pressable onPress={() => router.push('/workshops')}>
          <Text style={styles.seeAll}>Ver todos →</Text>
        </Pressable>
      </View>

      {wLoading ? (
        <Text style={styles.empty}>Cargando talleres…</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
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
                    <View style={[styles.cover, { backgroundColor: '#d9d3c9' }]} />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.chip, { backgroundColor: chip.bg, color: chip.color }]}>
                    {w.categoryId || 'Taller'}
                  </Text>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {w.title}
                  </Text>
                  <Text style={styles.meta} numberOfLines={1}>
                    {w.location?.addressText?.split(',')[0] || 'Presencial'}
                  </Text>
                  <Text style={styles.meta}>
                    {Math.max(0, (w.capacity ?? 0) - (w.stats?.enrolledCount ?? 0))}{' '}
                    lugares disponibles
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {promoUri ? (
        <ImageBackground
          source={{ uri: promoUri }}
          style={styles.promo}
          imageStyle={styles.promoImg}
        >
          <View style={styles.promoOverlay}>
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
        </ImageBackground>
      ) : (
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
      )}

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Últimas del blog</Text>
        <Pressable onPress={() => router.push('/blog')}>
          <Text style={styles.seeAll}>Ver todas →</Text>
        </Pressable>
      </View>

      {bLoading ? (
        <Text style={styles.empty}>Cargando blog…</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {blogList.map((post, i) => {
            const uri = blogCoverUri(post.coverImageUrl, i);
            return (
              <Pressable
                key={post.id}
                style={styles.blogCard}
                onPress={() => router.push(`/blog/${post.id}` as Href)}
              >
                <View style={styles.blogCover}>
                  {uri ? <Image source={{ uri }} style={styles.cover} /> : null}
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
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { color: '#fff', fontWeight: '800' },
  brand: { fontSize: 20, fontWeight: '800', color: COLORS.brandForest },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e63946',
  },
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
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.brandForest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.brandForest },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primaryGreen },
  hScroll: { gap: 12, paddingBottom: 8 },
  workshopCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  coverWrap: { height: 120, backgroundColor: '#d9d3c9' },
  cover: { width: '100%', height: '100%' },
  cardBody: { padding: 10 },
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
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.brandForest,
    marginBottom: 4,
  },
  meta: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  promo: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 34,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 30,
    marginVertical: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.mint,
  },
  promoImg: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 34,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 30,
  },
  promoOverlay: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: COLORS.primaryGreen,
    marginBottom: 6,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.brandForest,
    marginBottom: 6,
  },
  promoSub: {
    fontSize: 13,
    color: COLORS.brandForest,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 18,
  },
  blogCard: {
    width: 190,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
  },
  blogCover: { height: 100, backgroundColor: '#cfc7bb' },
  empty: { color: COLORS.textSecondary, marginBottom: 12 },
});
