'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkshopById } from '@/services/workshops.service';
import { listTeacherEnrollmentsByWorkshop } from '@/services/enrollments.service';
import { getUserDoc } from '@/services/user.service';
import { getAttendanceBySession, setAttendance } from '@/services/attendance.service';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';
import type { Workshop, Enrollment, User } from '@/types';

export default function WorkshopStudentsPage({ id }: { id: string }) {
  const workshopId = id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Record<string, User>>({});
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadData() {
      if (!user || !workshopId) return;

      try {
        setLoading(true);
        const [workshopData, enrollmentsData] = await Promise.all([
          getWorkshopById(workshopId),
          listTeacherEnrollmentsByWorkshop(user.uid, workshopId),
        ]);

        if (!workshopData) {
          router.push('/teacher/workshops');
          return;
        }

        setWorkshop(workshopData);
        setEnrollments(enrollmentsData);

        const sessionIds = [...new Set(enrollmentsData.map((e) => e.sessionId))];
        const attendances = await Promise.all(
          sessionIds.map((sid) => getAttendanceBySession(sid))
        );
        const attMap: Record<string, boolean> = {};
        attendances.flat().forEach((a) => {
          attMap[`${a.sessionId}_${a.enrollmentId}`] = a.present;
        });
        setAttendanceMap(attMap);

        // Cargar información de estudiantes
        const studentIds = [...new Set(enrollmentsData.map((e) => e.studentId))];
        const studentPromises = studentIds.map((studentId) =>
          getUserDoc(studentId).then((student) => ({ studentId, student }))
        );
        const studentResults = await Promise.all(studentPromises);
        const studentMap: Record<string, User> = {};
        studentResults.forEach(({ studentId, student }) => {
          if (student) {
            studentMap[studentId] = student;
          }
        });
        setStudents(studentMap);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user && workshopId) {
      loadData();
    }
  }, [user, workshopId, router]);

  if (authLoading || loading) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '80px' }}>
          <div className="loading">Cargando...</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!user || user.role !== 'teacher' || !workshop) {
    return null;
  }

  return (
    <>
      <HomeHeader />
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
              Alumnos Inscriptos
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {workshop.title}
            </p>
          </div>

          {enrollments.length === 0 ? (
            <div
              className="material-card"
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)',
              }}
            >
              <p>No hay alumnos inscriptos en este taller aún.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {enrollments.map((enrollment) => {
                const student = students[enrollment.studentId];
                return (
                  <div key={enrollment.id} className="material-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {student?.displayName || student?.email || 'Usuario desconocido'}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          {student?.email}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          Inscripción: {enrollment.createdAt.toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background:
                            enrollment.status === 'paid'
                              ? 'var(--primary-green-light)'
                              : enrollment.status === 'pending_payment'
                              ? '#fff3cd'
                              : '#f8d7da',
                          color:
                            enrollment.status === 'paid'
                              ? 'var(--primary-green-dark)'
                              : enrollment.status === 'pending_payment'
                              ? '#856404'
                              : '#721c24',
                          flexShrink: 0,
                        }}
                      >
                        {enrollment.status === 'paid'
                          ? 'Pagado'
                          : enrollment.status === 'pending_payment'
                          ? 'Pendiente de pago'
                          : enrollment.status}
                      </span>
                    </div>
                    {enrollment.status === 'paid' && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--divider)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={attendanceMap[`${enrollment.sessionId}_${enrollment.id}`] ?? false}
                            onChange={async (e) => {
                              if (!user) return;
                              try {
                                await setAttendance(
                                  enrollment.sessionId,
                                  enrollment.id,
                                  enrollment.studentId,
                                  workshopId,
                                  user.uid,
                                  e.target.checked
                                );
                                setAttendanceMap((prev) => ({
                                  ...prev,
                                  [`${enrollment.sessionId}_${enrollment.id}`]: e.target.checked,
                                }));
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                          />
                          <span>Presente</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
