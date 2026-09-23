import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

type BlobKey = 'mint' | 'sand' | 'peach' | 'lilac';

const BLOB_PATHS: Record<
  BlobKey,
  { outer: string; mid: string; inner: string; colors: [string, string, string] }
> = {
  mint: {
    colors: ['#a8cbb8', '#c5ddcf', '#e4f1ea'],
    outer:
      'M16 36 C40 8 70 2 100 10 C130 18 150 4 180 12 C205 18 225 28 232 48 C238 68 220 88 190 92 C160 96 140 86 110 90 C80 94 50 98 28 84 C10 72 4 52 16 36 Z',
    mid:
      'M24 38 C46 14 74 10 102 16 C130 22 150 12 176 18 C200 24 216 32 222 48 C228 64 212 82 186 86 C160 90 140 80 112 84 C84 88 56 90 36 78 C20 68 14 50 24 38 Z',
    inner:
      'M38 42 C58 24 84 22 110 26 C134 30 152 22 174 28 C194 34 206 40 210 52 C214 64 202 76 180 78 C158 80 140 72 116 76 C92 80 68 82 50 72 C36 64 32 50 38 42 Z',
  },
  sand: {
    colors: ['#d4c0a4', '#e5d6c0', '#f5eee4'],
    outer:
      'M8 50 C6 22 36 4 72 8 C108 12 130 0 162 10 C192 18 218 14 232 36 C244 56 236 78 210 88 C182 98 150 92 118 96 C86 100 54 94 30 80 C12 70 10 60 8 50 Z',
    mid:
      'M16 50 C14 28 42 12 76 14 C108 16 130 8 158 16 C186 24 210 22 222 40 C232 56 226 74 204 82 C180 90 150 86 120 88 C90 90 60 86 38 74 C22 66 18 56 16 50 Z',
    inner:
      'M30 50 C28 34 52 22 82 24 C110 26 130 20 154 26 C176 32 196 32 206 44 C214 56 210 68 192 74 C172 80 146 78 120 80 C94 82 70 78 50 68 C36 62 32 54 30 50 Z',
  },
  peach: {
    colors: ['#d9b5a2', '#e9cebf', '#f8ebe3'],
    outer:
      'M14 42 C22 18 48 6 70 14 C88 4 110 2 130 12 C148 4 172 2 192 14 C214 8 232 20 236 42 C240 64 226 86 198 92 C172 98 148 86 122 92 C96 98 70 88 46 90 C24 92 6 74 8 54 C8 48 10 44 14 42 Z',
    mid:
      'M22 44 C30 24 52 14 72 20 C90 12 110 12 128 20 C146 14 168 12 186 22 C206 18 222 28 226 44 C230 62 218 80 194 84 C172 88 150 78 126 84 C102 90 78 80 56 82 C36 84 18 70 18 54 C18 50 20 46 22 44 Z',
    inner:
      'M36 46 C44 32 62 26 80 30 C96 24 114 24 130 30 C146 26 164 26 178 34 C194 32 208 38 210 50 C212 62 202 74 182 76 C164 78 146 70 128 74 C110 78 92 70 74 72 C56 74 42 66 40 54 C40 50 34 48 36 46 Z',
  },
  lilac: {
    colors: ['#b8b1cf', '#d2cce4', '#ebe7f5'],
    outer:
      'M20 28 C48 4 90 0 128 8 C164 16 200 10 224 28 C244 44 242 70 220 84 C198 98 168 100 140 92 C118 100 96 102 74 94 C48 100 22 90 10 68 C2 50 6 36 20 28 Z',
    mid:
      'M28 32 C54 12 92 10 126 16 C158 22 192 18 214 34 C230 48 228 68 210 78 C192 90 166 90 142 84 C122 90 102 92 82 86 C60 90 34 82 22 64 C16 52 18 38 28 32 Z',
    inner:
      'M42 38 C64 24 96 22 126 28 C152 32 180 30 198 42 C210 52 208 66 194 74 C178 82 156 82 136 76 C120 82 104 84 88 78 C70 82 52 76 42 62 C36 52 36 42 42 38 Z',
  },
};

const LINKS = [
  { href: '/workshops', label: 'Explorar talleres', blob: 'mint' as const, icon: 'search-outline' as const },
  { href: '/my-workshops', label: 'Mis talleres', blob: 'sand' as const, icon: 'calendar-outline' as const },
  { href: '/my-workshops', label: 'Favoritos', blob: 'peach' as const, icon: 'heart-outline' as const },
  { href: '/blog', label: 'Blog', blob: 'lilac' as const, icon: 'book-outline' as const },
];

function QuickTile({
  href,
  label,
  blob,
  icon,
}: {
  href: string;
  label: string;
  blob: BlobKey;
  icon: 'search-outline' | 'calendar-outline' | 'heart-outline' | 'book-outline';
}) {
  const router = useRouter();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const shape = BLOB_PATHS[blob];

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.88 }]}
      onLayout={onLayout}
      onPress={() => router.push(href as Href)}
    >
      {size.w > 0 ? (
        <Svg
          width={size.w}
          height={size.h}
          viewBox="0 0 240 100"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Path d={shape.outer} fill={shape.colors[0]} />
          <Path d={shape.mid} fill={shape.colors[1]} />
          <Path d={shape.inner} fill={shape.colors[2]} opacity={0.9} />
        </Svg>
      ) : null}
      <Ionicons name={icon} size={22} color={COLORS.brandForest} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

export function HomeQuickLinks() {
  return (
    <View style={styles.grid} accessibilityLabel="Accesos rápidos">
      {LINKS.map((item) => (
        <QuickTile key={item.label} {...item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
    width: '100%',
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    aspectRatio: 1.45,
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  icon: { zIndex: 1 },
  label: {
    zIndex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.brandForest,
    textAlign: 'center',
    lineHeight: 14,
  },
});
