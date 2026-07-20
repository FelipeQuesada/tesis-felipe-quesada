import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../src/constants/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useWorkshop } from '../../../src/hooks/useWorkshop';
import { useWorkshopSessions } from '../../../src/hooks/useWorkshopSessions';
import { createEnrollment } from '../../../src/services/enrollments.service';
import type { Session, Workshop } from '../../../src/types';

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

function formatSessionRange(startAt: Date, endAt: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'short',
  };
  const start = new Intl.DateTimeFormat('es-AR', opts).format(startAt);
  const endTime = new Intl.DateTimeFormat('es-AR', {
    timeStyle: 'short',
  }).format(endAt);
  return `${start} → ${endTime}`;
}

function difficultyLabel(d?: Workshop['difficultyLevel']): string | null {
  if (!d) return null;
  const map: Record<NonNullable<Workshop['difficultyLevel']>, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };
  return map[d] ?? d;
}

function sessionCapacity(workshop: Workshop, session: Session): number {
  return session.capacityOverride ?? workshop.capacity;
}

function sessionStatusLabel(status: Session['status']): string {
  switch (status) {
    case 'scheduled':
      return 'Programada';
    case 'full':
      return 'Completa';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
}

export default function WorkshopDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workshopId =
    typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';

  const { workshop, loading, error } = useWorkshop(workshopId);
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useWorkshopSessions(workshop?.id);

  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: workshop?.title ? workshop.title.slice(0, 40) : 'Taller',
    });
  }, [navigation, workshop?.title]);

  const handleEnroll = async (sessionId: string) => {
    if (!workshop) return;

    if (!user) {
      Alert.alert(
        'Iniciá sesión',
        'Necesitás una cuenta de estudiante para inscribirte.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ir al login',
            onPress: () => router.push('/auth/login'),
          },
        ]
      );
      return;
    }

    if (user.role !== 'student') {
      Alert.alert(
        'Solo estudiantes',
        'Las inscripciones están disponibles para cuentas con rol estudiante.'
      );
      return;
    }

    setEnrollingId(sessionId);
    try {
      await createEnrollment({
        sessionId,
        workshopId: workshop.id,
        studentId: user.uid,
        teacherId: workshop.teacherId,
      });
      Alert.alert(
        'Listo',
        'Inscripción creada. Estado: pendiente de pago.'
      );
      await refetchSessions();
    } catch (e) {
      Alert.alert(
        'No se pudo inscribir',
        e instanceof Error ? e.message : 'Error desconocido'
      );
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Cargando…</Text>
      </View>
    );
  }

  if (error || !workshop) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>No se encontró el taller</Text>
        <Text style={styles.muted}>
          {error?.message ??
            'Es posible que no exista o no tengas permiso para verlo.'}
        </Text>
      </View>
    );
  }

  const diff = difficultyLabel(workshop.difficultyLevel);
  const isWorkshopTeacher =
    user?.role === 'teacher' && user.uid === workshop.teacherId;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {workshop.coverImageUrl ? (
          <Image
            source={{ uri: workshop.coverImageUrl }}
            style={styles.heroImg}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="image-outline" size={48} color="#94a3b8" />
          </View>
        )}
      </View>

      <Text style={styles.title}>{workshop.title}</Text>
      {workshop.teacherName ? (
        <Text style={styles.teacher}>Por {workshop.teacherName}</Text>
      ) : null}

      <Text style={styles.price}>{formatPrice(workshop)}</Text>

      <View style={styles.row}>
        {diff ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{diff}</Text>
          </View>
        ) : null}
        <Text style={styles.meta}>
          Cupos (taller): {workshop.capacity} · Inscriptos globales:{' '}
          {workshop.stats?.enrolledCount ?? 0}
        </Text>
      </View>

      {workshop.stats?.reviewsCount ? (
        <Text style={styles.rating}>
          ★ {workshop.stats.avgRating?.toFixed(1) ?? '–'} ·{' '}
          {workshop.stats.reviewsCount} reseña(s)
        </Text>
      ) : (
        <Text style={styles.ratingMuted}>Sin reseñas aún</Text>
      )}

      {workshop.location?.addressText ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <Text style={styles.body}>{workshop.location.addressText}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.body}>{workshop.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sesiones disponibles</Text>

        {sessionsLoading ? (
          <View style={styles.sessionsLoading}>
            <ActivityIndicator />
            <Text style={styles.muted}>Cargando sesiones…</Text>
          </View>
        ) : null}

        {sessionsError ? (
          <Text style={styles.errorInline}>{sessionsError.message}</Text>
        ) : null}

        {!sessionsLoading && sessions.length === 0 ? (
          <View style={styles.emptySessions}>
            <Text style={styles.emptySessionsText}>
              No hay sesiones para este taller.
            </Text>
            {isWorkshopTeacher ? (
              <Text style={styles.hintTeacher}>
                Podés crear sesiones desde el panel web del profesor.
              </Text>
            ) : null}
          </View>
        ) : null}

        {!sessionsLoading &&
          sessions.map((session) => {
            const cap = sessionCapacity(workshop, session);
            const enrolled = session.stats?.enrolledCount ?? 0;
            const isFull =
              session.status === 'full' ||
              enrolled >= cap ||
              session.status === 'cancelled';
            const canEnrollStudent =
              user?.role === 'student' &&
              session.status === 'scheduled' &&
              !isFull;

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionCardHeader}>
                  <Text style={styles.sessionDate}>
                    {formatSessionRange(session.startAt, session.endAt)}
                  </Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>
                      {sessionStatusLabel(session.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.sessionMeta}>
                  Inscriptos: {enrolled} / {cap}
                </Text>

                {user?.role === 'student' ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.enrollBtn,
                      (!canEnrollStudent || enrollingId === session.id) &&
                        styles.enrollBtnDisabled,
                      pressed && canEnrollStudent && styles.enrollBtnPressed,
                    ]}
                    disabled={
                      !canEnrollStudent || enrollingId === session.id
                    }
                    onPress={() => void handleEnroll(session.id)}
                  >
                    {enrollingId === session.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.enrollBtnText}>
                        {isFull ? 'Sin cupos' : 'Inscribirme'}
                      </Text>
                    )}
                  </Pressable>
                ) : null}

                {!user ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.enrollBtnOutline,
                      pressed && styles.enrollBtnPressed,
                    ]}
                    onPress={() => router.push('/auth/login')}
                  >
                    <Text style={styles.enrollBtnOutlineText}>
                      Iniciá sesión para inscribirte
                    </Text>
                  </Pressable>
                ) : null}

                {user && user.role !== 'student' ? (
                  <Text style={styles.roleHint}>
                    Las inscripciones son solo para estudiantes.
                  </Text>
                ) : null}
              </View>
            );
          })}
      </View>

      <View style={styles.payHint}>
        <Text style={styles.payHintText}>
          El pago con Mercado Pago / confirmación quedará enlazado como en la web
          (próximo paso en la app).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  muted: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorInline: {
    color: '#b91c1c',
    fontSize: 14,
    marginBottom: 8,
  },
  hero: {
    width: '100%',
    height: 200,
    backgroundColor: '#e2e8f0',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  teacher: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
  },
  rating: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#b45309',
    fontWeight: '600',
  },
  ratingMuted: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
  },
  sessionsLoading: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emptySessions: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptySessionsText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 15,
  },
  hintTeacher: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.primaryGreenDark,
    textAlign: 'center',
  },
  sessionCard: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  sessionDate: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusPill: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sessionMeta: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  enrollBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  enrollBtnPressed: {
    opacity: 0.9,
  },
  enrollBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  enrollBtnOutline: {
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollBtnOutlineText: {
    color: COLORS.primaryGreenDark,
    fontWeight: '700',
    fontSize: 15,
  },
  roleHint: {
    marginTop: 8,
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  payHint: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  payHintText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
  },
});
