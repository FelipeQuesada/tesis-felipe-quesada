import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RemoteAssetImage } from '../../src/components/RemoteAssetImage';
import { TeacherShell } from '../../src/components/teacher/TeacherShell';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { useTeacherWorkshops } from '../../src/hooks/useTeacherWorkshops';
import { resolvePublicAssetUri } from '../../src/lib/siteAssets';
import type { Workshop } from '../../src/types';

function statusChip(workshop: Workshop) {
  const published = workshop.status === 'published';
  const draft = workshop.status === 'draft';
  return {
    label: published ? 'Publicado' : draft ? 'Borrador' : 'Cancelado',
    bg: published
      ? COLORS.primaryGreenLight
      : draft
        ? '#fff3cd'
        : '#f8d7da',
    fg: published
      ? COLORS.primaryGreenDark
      : draft
        ? '#856404'
        : '#721c24',
  };
}

export default function TeacherHomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { workshops, loading: wsLoading } = useTeacherWorkshops(
    user?.uid ?? null
  );

  useEffect(() => {
    if (!authLoading && user && user.role !== 'teacher') {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  if (authLoading || wsLoading || !user || user.role !== 'teacher') {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      </TeacherShell>
    );
  }

  const publishedCount = workshops.filter((w) => w.status === 'published').length;
  const draftCount = workshops.filter((w) => w.status === 'draft').length;
  const promoUri = resolvePublicAssetUri('/images/promo.png');

  return (
    <TeacherShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <RemoteAssetImage
            uri={promoUri}
            containerStyle={styles.heroImg}
            accessibilityLabel="Crear talleres"
          />
          <Text style={styles.heroTitle}>¡Compartí tu conocimiento!</Text>
          <Text style={styles.heroSub}>
            Creá talleres y conectá con estudiantes apasionados por aprender
          </Text>
          <Pressable
            style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
            onPress={() => router.push('/teacher/workshops/new' as Href)}
          >
            <Text style={styles.heroBtnText}>Crear mi primer taller</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{workshops.length}</Text>
            <Text style={styles.statLbl}>Talleres creados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{publishedCount}</Text>
            <Text style={styles.statLbl}>Publicados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#ff9800' }]}>{draftCount}</Text>
            <Text style={styles.statLbl}>Borradores</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accesos rápidos</Text>

        <Pressable
          style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
          onPress={() => router.push('/teacher/workshops/new' as Href)}
        >
          <View style={[styles.quickIcon, { backgroundColor: COLORS.primaryGreen }]}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
          <View style={styles.quickTextWrap}>
            <Text style={styles.quickTitle}>Crear nuevo taller</Text>
            <Text style={styles.quickSub}>
              Publicá un nuevo taller y comenzá a recibir inscripciones
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
          onPress={() => router.push('/teacher/workshops' as Href)}
        >
          <View style={[styles.quickIcon, { backgroundColor: COLORS.primaryGreenLight }]}>
            <Ionicons name="bookmark-outline" size={24} color={COLORS.primaryGreenDark} />
          </View>
          <View style={styles.quickTextWrap}>
            <Text style={styles.quickTitle}>Mis talleres</Text>
            <Text style={styles.quickSub}>
              Administrá tus talleres, editalos y revisá inscripciones
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
        </Pressable>

        {workshops.length > 0 ? (
          <>
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Tus talleres recientes</Text>
              <Pressable onPress={() => router.push('/teacher/workshops' as Href)}>
                <Text style={styles.link}>Ver todos</Text>
              </Pressable>
            </View>
            {workshops.slice(0, 3).map((workshop) => {
              const chip = statusChip(workshop);
              return (
                <Pressable
                  key={workshop.id}
                  style={({ pressed }) => [styles.recentCard, pressed && styles.pressed]}
                  onPress={() =>
                    router.push(`/teacher/workshops/${workshop.id}` as Href)
                  }
                >
                  <RemoteAssetImage
                    uri={
                      workshop.coverImageUrl?.startsWith('http')
                        ? workshop.coverImageUrl
                        : workshop.coverImageUrl
                          ? resolvePublicAssetUri(workshop.coverImageUrl)
                          : promoUri
                    }
                    containerStyle={styles.recentThumb}
                    accessibilityLabel={workshop.title}
                  />
                  <View style={styles.recentBody}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      {workshop.title}
                    </Text>
                    <Text style={styles.recentDesc} numberOfLines={2}>
                      {workshop.description}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: chip.bg }]}>
                      <Text style={[styles.badgeText, { color: chip.fg }]}>
                        {chip.label}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : null}

        <View style={{ height: 16 }} />
      </ScrollView>
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    backgroundColor: COLORS.primaryGreenDark,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  heroBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  heroBtnText: {
    color: COLORS.primaryGreen,
    fontWeight: '700',
    fontSize: 16,
  },
  pressed: { opacity: 0.9 },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 4,
  },
  statLbl: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  quickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrap: { flex: 1 },
  quickTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  quickSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  link: {
    color: COLORS.primaryGreenDark,
    fontWeight: '600',
    fontSize: 14,
  },
  recentCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  recentThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  recentBody: { flex: 1, minWidth: 0 },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recentDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
