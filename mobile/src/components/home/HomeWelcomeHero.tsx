import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/theme';
import { resolvePublicAssetUri } from '../../lib/siteAssets';
import { welcomeAdjective } from '../../types/user';

/** Borde derecho ondulado del panel crema (viewBox 400×320). */
const WAVE_PATH =
  'M0 0 H268 C292 18 278 48 292 78 C308 112 286 138 298 172 C312 208 288 236 300 268 C308 292 292 308 278 320 H0 Z';

export function HomeWelcomeHero() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const heroH = Math.max(200, Math.min(260, width * 0.58));
  const panelW = Math.min(width * 0.62, 280);

  const firstName =
    user?.firstName || user?.displayName?.split(' ')[0] || null;
  const welcome = welcomeAdjective(user?.gender);
  const titleLines = useMemo(() => {
    if (firstName) {
      return [`Hola ${firstName},`, `${welcome} a`, 'MiTaller'];
    }
    return [
      `${welcome.charAt(0).toUpperCase()}${welcome.slice(1)} a`,
      'MiTaller',
    ];
  }, [firstName, welcome]);

  const heroUri = resolvePublicAssetUri('/images/home-hero.jpg');

  return (
    <View style={[styles.hero, { height: heroH }]}>
      <View style={styles.media} pointerEvents="none">
        {heroUri ? (
          <Image source={{ uri: heroUri }} style={styles.mediaImg} />
        ) : (
          <View style={[styles.mediaImg, styles.mediaFallback]} />
        )}
      </View>

      <View style={[styles.copyWrap, { width: panelW, height: heroH }]}>
        <Svg
          width={panelW}
          height={heroH}
          viewBox="0 0 400 320"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          <Path d={WAVE_PATH} fill="#f6efe4" />
        </Svg>
        <View style={styles.copyInner}>
          <Text style={styles.title}>
            {titleLines.join('\n')}
          </Text>
          <Text style={styles.sub}>
            Aprendé, compartí y disfrutá del arte en comunidad.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() => router.push('/workshops')}
          >
            <Text style={styles.ctaText}>Explorar talleres →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#efe6d8',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  mediaImg: {
    width: '100%',
    height: '100%',
  },
  mediaFallback: {
    backgroundColor: '#d8c3a5',
  },
  copyWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  copyInner: {
    paddingLeft: 18,
    paddingRight: 36,
    paddingVertical: 16,
    maxWidth: 220,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.brandForest,
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.brandForest,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
