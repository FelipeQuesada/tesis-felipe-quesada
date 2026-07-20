import { useRef } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePublishedBlogPosts } from '../../hooks/useBlog';
import { useHomeLayout } from '../../hooks/useHomeLayout';
import { COLORS } from '../../constants/theme';
import { blogCoverUri } from '../../lib/blogDisplay';
import { RemoteAssetImage } from '../RemoteAssetImage';

const CARD_GAP = 16;

export function BlogAdvanceSection() {
  const router = useRouter();
  const { horizontalPadding, isTablet } = useHomeLayout();
  const blogCardWidth = isTablet ? 300 : 280;
  const { posts, loading } = usePublishedBlogPosts();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);

  const blogPosts = posts.slice(0, 8);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = e.nativeEvent.contentOffset.x;
  };

  const scrollByCard = (dir: -1 | 1) => {
    const step = blogCardWidth + CARD_GAP;
    const maxX = Math.max(0, blogPosts.length * step - step * 0.5);
    let next = scrollX.current + dir * step;
    next = Math.max(0, Math.min(next, maxX));
    scrollRef.current?.scrollTo({ x: next, animated: true });
  };

  const headerRow = (
    <View style={styles.headRow}>
      <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
        Blog Advance
      </Text>
      <Pressable
        style={({ pressed }) => [styles.verMas, pressed && styles.pressed]}
        onPress={() => router.push('/blog')}
      >
        <Text style={styles.verMasText}>Ver más</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
        {headerRow}
        <ActivityIndicator color={COLORS.primaryGreen} style={{ marginTop: 12 }} />
        <Text style={styles.muted}>Cargando blog…</Text>
      </View>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
        {headerRow}
        <Text style={styles.muted}>Pronto habrá novedades en el blog.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
      {headerRow}

      <View style={styles.carouselWrap}>
        <Pressable
          style={[styles.arrow, styles.arrowLeft]}
          onPress={() => scrollByCard(-1)}
          accessibilityLabel="Anterior"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.hScrollContent}
          decelerationRate="fast"
          snapToInterval={blogCardWidth + CARD_GAP}
          snapToAlignment="start"
        >
          {blogPosts.map((post) => {
            const coverUri = blogCoverUri(post.coverImageUrl);
            return (
              <Pressable
                key={post.id}
                style={({ pressed }) => [
                  styles.card,
                  { width: blogCardWidth },
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push(`/blog/${post.id}`)}
              >
                <RemoteAssetImage
                  uri={coverUri}
                  containerStyle={styles.coverBox}
                  style={styles.coverImg}
                  accessibilityLabel={post.title}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={3}>
                    {post.title}
                  </Text>
                  <Text style={styles.cardLink}>Leer más →</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[styles.arrow, styles.arrowRight]}
          onPress={() => scrollByCard(1)}
          accessibilityLabel="Siguiente"
        >
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  verMasText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  muted: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  carouselWrap: {
    position: 'relative',
    marginTop: 4,
  },
  hScrollContent: {
    paddingVertical: 8,
    paddingLeft: 4,
    paddingRight: 28,
  },
  card: {
    marginRight: CARD_GAP,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  coverBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  coverImg: {
    width: '100%',
    height: 180,
  },
  cardBody: {
    padding: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  cardLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreenDark,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  arrowLeft: {
    left: -6,
  },
  arrowRight: {
    right: -6,
  },
  pressed: {
    opacity: 0.9,
  },
});
