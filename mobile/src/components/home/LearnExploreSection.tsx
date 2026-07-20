import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useHomeLayout } from '../../hooks/useHomeLayout';
import { resolvePublicAssetUri } from '../../lib/siteAssets';
import { RemoteAssetImage } from '../RemoteAssetImage';

export function LearnExploreSection() {
  const router = useRouter();
  const { horizontalPadding, isTablet } = useHomeLayout();
  const promoUri = resolvePublicAssetUri('/images/promo.png');

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}>
      <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
        Aprendé arte donde y cuando quieras
      </Text>
      <View style={styles.card}>
        <View style={styles.textCol}>
          <Text style={styles.body}>
            Descubrí talleres presenciales cerca tuyo y anotate en minutos desde la app.
          </Text>
          <Pressable onPress={() => router.push('/workshops')}>
            <Text style={styles.link}>Explorar talleres</Text>
          </Pressable>
        </View>
        <RemoteAssetImage
          uri={promoUri}
          containerStyle={[styles.promoBox, isTablet && styles.promoBoxTablet]}
          style={[styles.promoImg, isTablet && styles.promoImgTablet]}
          accessibilityLabel="Aprendé de expertos"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  sectionTitleTablet: {
    fontSize: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 14,
  },
  link: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGreenDark,
    textDecorationLine: 'underline',
  },
  promoBox: {
    width: 120,
    height: 120,
    borderRadius: 12,
    flexShrink: 0,
    overflow: 'hidden',
  },
  promoBoxTablet: {
    width: 140,
    height: 140,
  },
  promoImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  promoImgTablet: {
    width: 140,
    height: 140,
    borderRadius: 12,
  },
});
