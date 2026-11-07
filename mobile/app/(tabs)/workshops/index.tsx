import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePublishedWorkshops } from '../../../src/hooks/usePublishedWorkshops';
import { useAuth } from '../../../src/hooks/useAuth';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { COLORS } from '../../../src/constants/theme';
import { FLOATING_TAB_BAR_SPACE } from '../../../src/components/navigation/FloatingTabBar';
import { getCategories } from '../../../src/services/category.service';
import { getCategoryChipStyle } from '../../../src/lib/categoryColors';
import { stockCoverByCategory, stockCoverByIndex } from '../../../src/lib/stockImages';
import { resolvePublicAssetUri } from '../../../src/lib/siteAssets';
import type { Category, DifficultyLevel, Workshop } from '../../../src/types';

const COUNTRY_OPTIONS = [
  { label: 'Argentina', code: 'AR' },
  { label: 'Chile', code: 'CL' },
  { label: 'Uruguay', code: 'UY' },
  { label: 'Brasil', code: 'BR' },
] as const;

const DIFFICULTY_CHIPS: { label: string; value: DifficultyLevel | '' }[] = [
  { label: 'Todas', value: '' },
  { label: 'Principiante', value: 'beginner' },
  { label: 'Intermedio', value: 'intermediate' },
  { label: 'Avanzado', value: 'advanced' },
];

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

function categoryImageUri(
  categoryName: string,
  workshops: Workshop[],
  index: number
): string | null {
  const fromWorkshop = workshops.find(
    (w) => w.categoryId === categoryName && w.coverImageUrl
  )?.coverImageUrl;
  if (fromWorkshop) return fromWorkshop;

  const stock =
    stockCoverByCategory(categoryName) ?? stockCoverByIndex(index);
  return resolvePublicAssetUri(stock);
}

export default function WorkshopsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { workshops, loading, error, refetch } = usePublishedWorkshops();
  const { isFavorite, toggleFavorite, refreshFavorites } = useFavorites(
    user?.uid ?? null
  );

  useFocusEffect(
    useCallback(() => {
      void refreshFavorites();
    }, [refreshFavorites])
  );

  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<Category[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('AR');
  const [locationQuery, setLocationQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | ''>('');
  const [language, setLanguage] = useState('');
  const [minRating, setMinRating] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q =
      typeof params.q === 'string'
        ? params.q
        : Array.isArray(params.q)
          ? params.q[0]
          : '';
    if (q) setSearchQuery(q);
  }, [params.q]);

  useEffect(() => {
    const cat =
      typeof params.category === 'string'
        ? params.category
        : Array.isArray(params.category)
          ? params.category[0]
          : '';
    if (cat) setSelectedCategories([cat]);
  }, [params.category]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getCategories();
        if (!cancelled) setCatalogCategories(data);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        if (!cancelled) setCatalogCategories([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const fromCatalog = catalogCategories.map((c) => c.name).filter(Boolean);
    const fromWorkshops = workshops.map((w) => w.categoryId).filter(Boolean);
    return Array.from(new Set([...fromCatalog, ...fromWorkshops])).sort((a, b) =>
      a.localeCompare(b, 'es')
    );
  }, [catalogCategories, workshops]);

  const filtered = useMemo(() => {
    let list = workshops;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.categoryId.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      const selected = new Set(selectedCategories);
      list = list.filter((w) => selected.has(w.categoryId));
    }

    if (selectedCountryCode) {
      const code = selectedCountryCode.toUpperCase();
      list = list.filter(
        (w) => (w.location?.countryId || '').toUpperCase() === code
      );
    }

    const loc = locationQuery.trim().toLowerCase();
    if (loc) {
      list = list.filter((w) => {
        const addr = (w.location?.addressText || '').toLowerCase();
        const city = (w.location?.cityId || '').toLowerCase();
        return addr.includes(loc) || city.includes(loc);
      });
    }

    if (priceMin.trim()) {
      const min = Number(priceMin);
      if (!Number.isNaN(min)) list = list.filter((w) => w.price >= min);
    }
    if (priceMax.trim()) {
      const max = Number(priceMax);
      if (!Number.isNaN(max)) list = list.filter((w) => w.price <= max);
    }
    if (difficultyLevel) {
      list = list.filter((w) => w.difficultyLevel === difficultyLevel);
    }
    if (language.trim()) {
      const lang = language.trim().toLowerCase();
      list = list.filter((w) => (w.language || '').toLowerCase().includes(lang));
    }
    if (minRating.trim()) {
      const r = Number(minRating.replace(',', '.'));
      if (!Number.isNaN(r)) {
        list = list.filter((w) => (w.stats?.avgRating ?? 0) >= r);
      }
    }

    return list;
  }, [
    workshops,
    searchQuery,
    selectedCategories,
    selectedCountryCode,
    locationQuery,
    priceMin,
    priceMax,
    difficultyLevel,
    language,
    minRating,
  ]);

  const featured = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ratingDiff = (b.stats?.avgRating ?? 0) - (a.stats?.avgRating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.stats?.enrolledCount ?? 0) - (a.stats?.enrolledCount ?? 0);
    });
  }, [filtered]);

  const isBrowseMode =
    !searchQuery.trim() &&
    selectedCategories.length === 0 &&
    !locationQuery.trim() &&
    !priceMin.trim() &&
    !priceMax.trim() &&
    !difficultyLevel &&
    !language.trim() &&
    !minRating.trim();

  const listTitle = isBrowseMode
    ? 'Talleres destacados'
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : selectedCategories.length > 1
        ? `${selectedCategories.length} categorías`
        : 'Resultados';

  const activeFilterCount = [
    selectedCountryCode !== 'AR',
    !!locationQuery.trim(),
    !!priceMin.trim(),
    !!priceMax.trim(),
    !!difficultyLevel,
    !!language.trim(),
    !!minRating.trim(),
  ].filter(Boolean).length;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refreshFavorites()]);
    } finally {
      setRefreshing(false);
    }
  };

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

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const renderItem = ({ item }: { item: Workshop }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push(`/workshops/${item.id}`)}
    >
      <View style={styles.coverWrap}>
        {item.coverImageUrl ? (
          <Image
            source={{ uri: item.coverImageUrl }}
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image-outline" size={28} color="#94a3b8" />
          </View>
        )}
      </View>
      <View style={styles.cardBodyRow}>
        <View style={styles.cardBody}>
          <Text style={styles.titleLine} numberOfLines={2}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.teacherName ? (
              <Text style={styles.teacherInline}>
                {' · '}
                {item.teacherName}
              </Text>
            ) : null}
          </Text>
          {item.description?.trim() ? (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {descriptionPreview(item.description)}
            </Text>
          ) : null}
          <View style={styles.cardFooter}>
            <Text style={styles.price}>{formatPrice(item)}</Text>
            {item.stats?.reviewsCount ? (
              <Text style={styles.meta}>
                ★ {item.stats.avgRating?.toFixed(1) ?? '–'} · {item.stats.reviewsCount}{' '}
                reseñas
              </Text>
            ) : (
              <Text style={styles.meta}>Sin reseñas</Text>
            )}
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.favStarAside, pressed && styles.favStarPressed]}
          hitSlop={10}
          onPress={() => void handleToggleFavorite(item.id)}
        >
          <Ionicons
            name={isFavorite(item.id) ? 'star' : 'star-outline'}
            size={22}
            color={isFavorite(item.id) ? '#f59e0b' : '#64748b'}
          />
        </Pressable>
      </View>
    </Pressable>
  );

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.pageTitle}>Buscar</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color="#8a918c" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerámica, pintura, yoga…"
          placeholderTextColor="#9aa39c"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={12}>
            <Ionicons name="close-circle" size={20} color="#9aa39c" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterBar}>
        <Pressable
          style={[styles.filterToggle, showFilters && styles.filterToggleOn]}
          onPress={() => setShowFilters((s) => !s)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={COLORS.primaryGreenDark}
          />
          <Text style={styles.filterToggleText}>
            Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
          <Ionicons
            name={showFilters ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.primaryGreenDark}
          />
        </Pressable>
        {selectedCategories.length > 0 ? (
          <Pressable
            style={styles.clearCategory}
            onPress={() => setSelectedCategories([])}
          >
            <Text style={styles.clearCategoryText}>
              {selectedCategories.length === 1
                ? selectedCategories[0]
                : `${selectedCategories.length} categorías`}
            </Text>
            <Ionicons name="close" size={14} color={COLORS.primaryGreenDark} />
          </Pressable>
        ) : null}
      </View>

      {showFilters ? (
        <View style={styles.filtersPanel}>
          <Text style={styles.filterLabel}>País</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {COUNTRY_OPTIONS.map((c) => {
              const selected = selectedCountryCode === c.code;
              return (
                <Pressable
                  key={c.code}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setSelectedCountryCode(c.code)}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextSelected]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.filterLabel}>Ubicación</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="Ciudad o dirección…"
            placeholderTextColor="#9aa39c"
            value={locationQuery}
            onChangeText={setLocationQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.filterLabel}>
            Precio ({workshops[0]?.currency ?? 'ARS'})
          </Text>
          <View style={styles.rowInputs}>
            <TextInput
              style={styles.smallInput}
              placeholder="Mín."
              placeholderTextColor="#9aa39c"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.smallInput}
              placeholder="Máx."
              placeholderTextColor="#9aa39c"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.filterLabel}>Dificultad</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {DIFFICULTY_CHIPS.map((d) => {
              const selected = difficultyLevel === d.value;
              return (
                <Pressable
                  key={d.label}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setDifficultyLevel(d.value)}
                >
                  <Text
                    style={[styles.chipText, selected && styles.chipTextSelected]}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.filterLabel}>Idioma</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="Ej. español, inglés…"
            placeholderTextColor="#9aa39c"
            value={language}
            onChangeText={setLanguage}
            autoCapitalize="none"
          />

          <Text style={styles.filterLabel}>Rating mínimo</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder="Ej. 4"
            placeholderTextColor="#9aa39c"
            value={minRating}
            onChangeText={setMinRating}
            keyboardType="decimal-pad"
          />
        </View>
      ) : null}

      {categories.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Explorar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.browseRow}
          >
            {categories.map((cat, index) => {
              const uri = categoryImageUri(cat, workshops, index);
              const chip = getCategoryChipStyle(cat);
              const selected = selectedCategories.includes(cat);
              return (
                <Pressable
                  key={`browse-${cat}`}
                  style={[styles.browseCard, selected && styles.browseCardSelected]}
                  onPress={() => toggleCategory(cat)}
                >
                  {uri ? (
                    <Image source={{ uri }} style={styles.browseImage} />
                  ) : (
                    <View style={[styles.browseImage, { backgroundColor: chip.bg }]} />
                  )}
                  <View style={styles.browseScrim} />
                  <Text style={styles.browseLabel} numberOfLines={2}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      <View style={styles.listTitleRow}>
        <Text style={styles.sectionTitleInline}>{listTitle}</Text>
        <Text style={styles.resultCount}>{featured.length}</Text>
      </View>
    </View>
  );

  if (loading && workshops.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Cargando talleres…</Text>
      </View>
    );
  }

  if (error && workshops.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorTitle}>No se pudieron cargar los talleres</Text>
        <Text style={styles.errorBody}>{error.message}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={featured}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          featured.length === 0 ? styles.emptyList : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={COLORS.primaryGreen}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>
              {isBrowseMode
                ? 'No hay talleres publicados todavía.'
                : 'No hay talleres que coincidan con la búsqueda.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  headerBlock: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f3f1ed',
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.mint,
  },
  filterToggleOn: {
    backgroundColor: COLORS.primaryGreenLight,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
  },
  clearCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.sand,
  },
  clearCategoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
  },
  filtersPanel: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f7f4ef',
    gap: 0,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryGreenLight,
    borderColor: COLORS.primaryGreen,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chipTextSelected: {
    color: COLORS.primaryGreenDark,
  },
  fieldInput: {
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  smallInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.surface,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitleInline: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  browseRow: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  browseCard: {
    width: 148,
    height: 198,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#d9d3c9',
  },
  browseCardSelected: {
    borderWidth: 3,
    borderColor: COLORS.primaryGreen,
  },
  browseImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  browseScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  browseLabel: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  listContent: {
    paddingBottom: FLOATING_TAB_BAR_SPACE,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: FLOATING_TAB_BAR_SPACE,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cardPressed: {
    opacity: 0.92,
  },
  coverWrap: {
    width: 100,
    backgroundColor: '#e2e8f0',
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
  favStarPressed: {
    opacity: 0.85,
  },
  cover: {
    width: '100%',
    height: '100%',
    minHeight: 100,
  },
  coverPlaceholder: {
    flex: 1,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    minWidth: 0,
  },
  cardBodyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
  },
  titleLine: {
    marginBottom: 6,
    lineHeight: 22,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  teacherInline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9ca3af',
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  meta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyBox: {
    paddingVertical: 48,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
