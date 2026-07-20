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
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePublishedWorkshops } from '../../../src/hooks/usePublishedWorkshops';
import { useAuth } from '../../../src/hooks/useAuth';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { COLORS } from '../../../src/constants/theme';
import { getCategories } from '../../../src/services/category.service';
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

const COLLAPSED_CATEGORY_COUNT = 6;

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

export default function WorkshopsListScreen() {
  const router = useRouter();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [catalogCategories, setCatalogCategories] = useState<Category[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('AR');
  const [locationQuery, setLocationQuery] = useState('');
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | ''>('');
  const [language, setLanguage] = useState('');
  const [minRating, setMinRating] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  const categoryButtons = useMemo(() => {
    const fromCatalog = catalogCategories.map((c) => c.name).filter(Boolean);
    const fromWorkshops = workshops.map((w) => w.categoryId).filter(Boolean);
    const unique = Array.from(new Set([...fromCatalog, ...fromWorkshops])).sort((a, b) =>
      a.localeCompare(b, 'es')
    );
    return ['Todos', ...unique];
  }, [catalogCategories, workshops]);

  const visibleCategories = categoriesExpanded
    ? categoryButtons
    : categoryButtons.slice(0, COLLAPSED_CATEGORY_COUNT);

  const filtered = useMemo(() => {
    let list = workshops;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'Todos') {
      list = list.filter((w) => w.categoryId === selectedCategory);
    }

    if (selectedCountryCode) {
      const code = selectedCountryCode.toUpperCase();
      list = list.filter((w) => (w.location?.countryId || '').toUpperCase() === code);
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
    selectedCategory,
    selectedCountryCode,
    locationQuery,
    priceMin,
    priceMax,
    difficultyLevel,
    language,
    minRating,
  ]);

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
              <Text style={styles.teacherInline}>{' · '}{item.teacherName}</Text>
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
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {c.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={20} color="#64748b" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título o descripción…"
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={12}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.filterLabel}>Categoría</Text>
      <View style={styles.categoryChipsWrap}>
        {visibleCategories.map((cat) => {
          const selected = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{cat}</Text>
            </Pressable>
          );
        })}
      </View>
      {categoryButtons.length > COLLAPSED_CATEGORY_COUNT ? (
        <Pressable
          style={styles.expandBtn}
          onPress={() => setCategoriesExpanded((e) => !e)}
        >
          <Text style={styles.expandBtnText}>
            {categoriesExpanded ? 'Ver menos' : 'Ver más categorías'}
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.filterLabel}>Ubicación</Text>
      <TextInput
        style={styles.locationInput}
        placeholder="Ciudad o dirección (coincidencia parcial)…"
        placeholderTextColor="#94a3b8"
        value={locationQuery}
        onChangeText={setLocationQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced((s) => !s)}
      >
        <Ionicons
          name={showAdvanced ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.primaryGreenDark}
        />
        <Text style={styles.advancedToggleText}>Más filtros</Text>
      </Pressable>

      {showAdvanced ? (
        <View style={styles.advancedPanel}>
          <Text style={styles.advancedHint}>Precio ({workshops[0]?.currency ?? 'ARS'})</Text>
          <View style={styles.rowInputs}>
            <TextInput
              style={styles.smallInput}
              placeholder="Mín."
              placeholderTextColor="#94a3b8"
              value={priceMin}
              onChangeText={setPriceMin}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.smallInput}
              placeholder="Máx."
              placeholderTextColor="#94a3b8"
              value={priceMax}
              onChangeText={setPriceMax}
              keyboardType="decimal-pad"
            />
          </View>

          <Text style={styles.advancedHint}>Dificultad</Text>
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
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.advancedHint}>Idioma</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Ej. español, inglés…"
            placeholderTextColor="#94a3b8"
            value={language}
            onChangeText={setLanguage}
            autoCapitalize="none"
          />

          <Text style={styles.advancedHint}>Rating mínimo</Text>
          <TextInput
            style={styles.locationInput}
            placeholder="Ej. 4"
            placeholderTextColor="#94a3b8"
            value={minRating}
            onChangeText={setMinRating}
            keyboardType="decimal-pad"
          />
        </View>
      ) : null}

      <View style={styles.headerDivider} />
    </View>
  );

  if (loading && workshops.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Cargando talleres…</Text>
      </View>
    );
  }

  if (error && workshops.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>No se pudieron cargar los talleres</Text>
        <Text style={styles.errorBody}>{error.message}</Text>
        <Pressable style={styles.retryBtn} onPress={() => void refetch()}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedCategory !== 'Todos' ||
    locationQuery.trim() ||
    priceMin.trim() ||
    priceMax.trim() ||
    difficultyLevel ||
    language.trim() ||
    minRating.trim();

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyList : styles.listContent
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
              {hasActiveFilters
                ? 'No hay talleres que coincidan con los filtros.'
                : 'No hay talleres publicados todavía.'}
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
    backgroundColor: '#f1f5f9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
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
    color: '#64748b',
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
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginHorizontal: 16,
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  expandBtn: {
    alignSelf: 'stretch',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
  },
  expandBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryGreenDark,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 4,
  },
  locationInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
  },
  advancedToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryGreenDark,
  },
  advancedPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  advancedHint: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  smallInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  headerDivider: {
    height: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#059669',
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
    color: '#64748b',
    textAlign: 'center',
  },
});
