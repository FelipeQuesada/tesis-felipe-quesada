import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePublishedBlogPosts } from '../../src/hooks/useBlog';
import { COLORS } from '../../src/constants/theme';
import { blogCoverUri } from '../../src/lib/blogDisplay';
import { RemoteAssetImage } from '../../src/components/RemoteAssetImage';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { getCategories } from '../../src/services/category.service';
const COLLAPSED_CATEGORY_COUNT = 8;

function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toLowerCase()
    .trim();
}

export default function BlogListScreen() {
  const router = useRouter();
  const { posts, loading } = usePublishedBlogPosts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('inicio');
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [catalogCategories, setCatalogCategories] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const categories = await getCategories();
        if (!cancelled) {
          setCatalogCategories(
            categories.map((category) => ({
              id: category.id,
              name: category.name || category.id,
            }))
          );
        }
      } catch (err) {
        console.error('Error cargando categorías para blog:', err);
        if (!cancelled) setCatalogCategories([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const options = [{ id: 'inicio', label: 'Inicio' }];
    const seen = new Set<string>(['inicio']);
    for (const category of catalogCategories) {
      if (!category.id || seen.has(category.id)) continue;
      options.push({ id: category.id, label: category.name });
      seen.add(category.id);
    }
    return options;
  }, [catalogCategories]);

  const visibleCategories = categoriesExpanded
    ? categoryOptions
    : categoryOptions.slice(0, COLLAPSED_CATEGORY_COUNT);

  const filteredPosts = useMemo(() => {
    const term = normalizeForSearch(search);
    return [...posts]
      .filter((post) => {
        const normalizedTitle = normalizeForSearch(post.title);
        const matchesName = term.length === 0 || normalizedTitle.includes(term);
        const normalizedCategories = post.categoryIds.map((id) =>
          normalizeForSearch(id)
        );
        const matchesCategory = normalizedCategories.includes(
          normalizeForSearch(selectedCategory)
        );
        return matchesName && matchesCategory;
      })
      .sort((a, b) => {
        const aInicio = a.categoryIds
          .map((id) => normalizeForSearch(id))
          .includes('inicio');
        const bInicio = b.categoryIds
          .map((id) => normalizeForSearch(id))
          .includes('inicio');
        if (aInicio !== bInicio) return aInicio ? -1 : 1;
        const tb = b.publishedAt?.getTime() ?? b.createdAt.getTime();
        const ta = a.publishedAt?.getTime() ?? a.createdAt.getTime();
        return tb - ta;
      });
  }, [posts, search, selectedCategory]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.muted}>Cargando blog…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredPosts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <View style={styles.filtersWrap}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#94a3b8"
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.chipsWrap}>
            {visibleCategories.map((category) => {
              const selected = category.id === selectedCategory;
              return (
                <Pressable
                  key={category.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
            {categoryOptions.length > COLLAPSED_CATEGORY_COUNT ? (
              <Pressable
                style={styles.moreBtn}
                onPress={() => setCategoriesExpanded((prev) => !prev)}
              >
                <Text style={styles.moreBtnText}>
                  {categoriesExpanded ? 'Ver menos' : 'Ver más'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.muted}>
          {search || selectedCategory !== 'inicio'
            ? 'No hay artículos que coincidan con la búsqueda.'
            : 'No hay artículos publicados.'}
        </Text>
      }
      renderItem={({ item }) => {
        const coverUri = blogCoverUri(item.coverImageUrl);
        return (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.push(`/blog/${item.id}`)}
          >
            <RemoteAssetImage
              uri={coverUri}
              containerStyle={styles.coverBox}
              style={styles.coverImg}
              accessibilityLabel={item.title}
            />
            <View style={styles.cardBody}>
              <Text style={styles.title}>{item.title}</Text>
              {item.excerpt ? (
                <Text style={styles.excerpt} numberOfLines={3}>
                  {item.excerpt}
                </Text>
              ) : null}
              <Text style={styles.link}>Leer más →</Text>
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
    padding: 24,
    backgroundColor: COLORS.background,
  },
  muted: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: COLORS.background,
  },
  filtersWrap: {
    marginBottom: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingVertical: 0,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreenLight,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: COLORS.primaryGreenDark,
  },
  moreBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  moreBtnText: {
    fontSize: 13,
    color: COLORS.primaryGreenDark,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
  },
});
