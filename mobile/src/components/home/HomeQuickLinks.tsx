import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { getCategories } from '../../services/category.service';
import { getCategoryChipStyle } from '../../lib/categoryColors';
import { stockCoverByCategory, stockCoverByIndex } from '../../lib/stockImages';
import { resolvePublicAssetUri } from '../../lib/siteAssets';
import { COLORS } from '../../constants/theme';
import type { Category, Workshop } from '../../types';

const TOP_COUNT = 4;

function categoryImageUri(
  categoryName: string,
  workshops: Workshop[],
  index: number
): string | null {
  const fromWorkshop = workshops.find(
    (w) => w.categoryId === categoryName && w.coverImageUrl
  )?.coverImageUrl;
  if (fromWorkshop?.startsWith('http')) return fromWorkshop;

  const stock = stockCoverByCategory(categoryName) ?? stockCoverByIndex(index);
  return resolvePublicAssetUri(stock);
}

type Props = {
  workshops?: Workshop[];
};

export function HomeQuickLinks({ workshops = [] }: Props) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getCategories()
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of workshops) {
      if (!w.categoryId) continue;
      counts.set(w.categoryId, (counts.get(w.categoryId) ?? 0) + 1);
    }

    const fromCatalog = catalog.map((c) => c.name).filter(Boolean);
    const fromWorkshops = Array.from(counts.keys());
    const all = Array.from(new Set([...fromCatalog, ...fromWorkshops]));

    return all
      .sort(
        (a, b) =>
          (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b, 'es')
      )
      .slice(0, TOP_COUNT);
  }, [catalog, workshops]);

  if (topCategories.length === 0) return null;

  return (
    <View style={styles.wrap} accessibilityLabel="Las mejores categorías">
      <Text style={styles.title}>Las mejores categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {topCategories.map((cat, index) => {
          const uri = categoryImageUri(cat, workshops, index);
          const chip = getCategoryChipStyle(cat);
          return (
            <Pressable
              key={cat}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() =>
                router.push({
                  pathname: '/workshops',
                  params: { category: cat },
                } as Href)
              }
            >
              {uri ? (
                <Image source={{ uri }} style={styles.image} />
              ) : (
                <View style={[styles.image, { backgroundColor: chip.bg }]} />
              )}
              <View style={styles.scrim} />
              <Text style={styles.label} numberOfLines={2}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  row: {
    gap: 12,
    paddingRight: 8,
  },
  card: {
    width: 148,
    height: 198,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#d9d3c9',
  },
  cardPressed: {
    opacity: 0.9,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  label: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
