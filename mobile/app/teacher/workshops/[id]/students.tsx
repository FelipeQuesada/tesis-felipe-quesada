import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TeacherShell } from '../../../../src/components/teacher/TeacherShell';
import { COLORS } from '../../../../src/constants/theme';
import { useAuth } from '../../../../src/hooks/useAuth';
import {
  getAttendanceBySession,
  setAttendance,
} from '../../../../src/services/attendance.service';
import { listTeacherEnrollmentsByWorkshop } from '../../../../src/services/enrollments.service';
import { getWorkshopById } from '../../../../src/services/workshops.service';
import { getUserDoc } from '../../../../src/services/user.service';
import type { Enrollment, User, Workshop } from '../../../../src/types';

export default function TeacherWorkshopStudentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const workshopId = typeof id === 'string' ? id : '';
  const { user, loading: authLoading } = useAuth();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Record<string, User>>({});
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.uid || !workshopId) return;
      try {
        setLoading(true);
        const [w, ens] = await Promise.all([
          getWorkshopById(workshopId),
          listTeacherEnrollmentsByWorkshop(user.uid, workshopId),
        ]);
        if (cancelled) return;
        if (!w) {
          router.replace('/teacher/workshops');
          return;
        }
        setWorkshop(w);
        setEnrollments(ens);

        const sessionIds = [...new Set(ens.map((e) => e.sessionId))];
        const attendances = await Promise.all(
          sessionIds.map((sid) => getAttendanceBySession(sid))
        );
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        attendances.flat().forEach((a) => {
          map[`${a.sessionId}_${a.enrollmentId}`] = a.present;
        });
        setAttendanceMap(map);

        const studentIds = [...new Set(ens.map((e) => e.studentId))];
        const results = await Promise.all(
          studentIds.map(async (sid) => {
            const st = await getUserDoc(sid);
            return [sid, st] as const;
          })
        );
        if (cancelled) return;
        const sm: Record<string, User> = {};
        results.forEach(([sid, st]) => {
          if (st) sm[sid] = st;
        });
        setStudents(sm);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, workshopId, router]);

  if (
    authLoading ||
    loading ||
    !user ||
    user.role !== 'teacher' ||
    !workshop
  ) {
    return (
      <TeacherShell>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
      </TeacherShell>
    );
  }

  return (
    <TeacherShell>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.h1}>Alumnos inscriptos</Text>
        <Text style={styles.sub}>{workshop.title}</Text>

        {enrollments.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>
              No hay alumnos inscriptos en este taller aún.
            </Text>
          </View>
        ) : (
          enrollments.map((enrollment) => {
            const st = students[enrollment.studentId];
            const name =
              st?.displayName ||
              [st?.firstName, st?.lastName].filter(Boolean).join(' ') ||
              st?.email ||
              'Usuario desconocido';
            const key = `${enrollment.sessionId}_${enrollment.id}`;
            const paid = enrollment.status === 'paid';
            const statusLabel =
              enrollment.status === 'paid'
                ? 'Pagado'
                : enrollment.status === 'pending_payment'
                  ? 'Pendiente de pago'
                  : enrollment.status;

            return (
              <View key={enrollment.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.email}>{st?.email}</Text>
                    <Text style={styles.date}>
                      Inscripción:{' '}
                      {enrollment.createdAt.toLocaleDateString('es-AR')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      enrollment.status === 'paid'
                        ? styles.badgeOk
                        : styles.badgeWarn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeTxt,
                        enrollment.status === 'paid'
                          ? styles.badgeTxtOk
                          : styles.badgeTxtWarn,
                      ]}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                {paid ? (
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLbl}>Presente</Text>
                    <Switch
                      value={attendanceMap[key] ?? false}
                      onValueChange={async (v) => {
                        if (!user) return;
                        try {
                          await setAttendance(
                            enrollment.sessionId,
                            enrollment.id,
                            enrollment.studentId,
                            workshopId,
                            user.uid,
                            v
                          );
                          setAttendanceMap((prev) => ({ ...prev, [key]: v }));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      trackColor={{
                        false: '#ccc',
                        true: COLORS.primaryGreenLight,
                      }}
                      thumbColor={
                        attendanceMap[key] ? COLORS.primaryGreen : '#f4f3f4'
                      }
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </TeacherShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  h1: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
  empty: {
    padding: 28,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  emptyTxt: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  date: { fontSize: 13, color: COLORS.textSecondary },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeOk: { backgroundColor: COLORS.primaryGreenLight },
  badgeWarn: { backgroundColor: '#fff3cd' },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  badgeTxtOk: { color: COLORS.primaryGreenDark },
  badgeTxtWarn: { color: '#856404' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  switchLbl: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
});
