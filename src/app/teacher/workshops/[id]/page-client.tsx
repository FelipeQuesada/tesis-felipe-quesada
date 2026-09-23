'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getWorkshopById } from '@/services/workshops.service';
import { listTeacherEnrollmentsByWorkshop } from '@/services/enrollments.service';
import { listSessionsByWorkshop } from '@/services/sessions.service';
import { getUserDoc } from '@/services/user.service';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';
import type { Enrollment, Session, User, Workshop } from '@/types';

export default function TeacherWorkshopDetailPage({ id }: { id: string }) {
  const workshopId = id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [studentsById, setStudentsById] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);

        const [workshopData, enrollmentsData, sessionsData] = await Promise.all([
          getWorkshopById(workshopId),
          listTeacherEnrollmentsByWorkshop(user.uid, workshopId),
          listSessionsByWorkshop(workshopId),
        ]);

        if (!workshopData) {
          setError('No encontramos este taller.');
          return;
        }
        if (workshopData.teacherId !== user.uid) {
          setError('No tienes permiso para ver este taller.');
          return;
        }

        setWorkshop(workshopData);
        setEnrollments(enrollmentsData);
        setSessions(sessionsData);

        const studentIds = [...new Set(enrollmentsData.map((e) => e.studentId))];
        const studentEntries = await Promise.all(
          studentIds.map(async (id) => {
            const student = await getUserDoc(id);
            return [id, student] as const;
          })
        );

        const map: Record<string, User> = {};
        for (const [id, student] of studentEntries) {
          if (student) map[id] = student;
        }
        setStudentsById(map);
      } catch (err) {
        console.error('Error cargando detalle de taller:', err);
        setError('No se pudo cargar el detalle del taller.');
      } finally {
        setLoading(false);
      }
    }

    if (user && workshopId) {
      loadData();
    }
  }, [user, workshopId]);

  const stats = useMemo(() => {
    const paidCount = enrollments.filter((e) => e.status === 'paid').length;
    const pendingCount = enrollments.filter((e) => e.status === 'pending_payment').length;
    const cancelledCount = enrollments.filter((e) => e.status === 'cancelled').length;
    const totalRevenue = (workshop?.price ?? 0) * paidCount;
    const reservedRevenue = (workshop?.price ?? 0) * (paidCount + pendingCount);
    const nextSession = sessions.find((s) => s.startAt.getTime() >= Date.now()) ?? null;
    return {
      paidCount,
      pendingCount,
      cancelledCount,
      totalRevenue,
      reservedRevenue,
      nextSession,
    };
  }, [enrollments, workshop?.price, sessions]);

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

  if (!user || user.role !== 'teacher') {
    return null;
  }

  if (!workshop) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '120px' }}>
          <div className="material-card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {error ?? 'No encontramos ese taller.'}
            </p>
            <Link href="/teacher/workshops" className="material-link">
              Volver a mis talleres
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <HomeHeader />
      <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '120px' }}>
        <div className="material-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div>
              <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
                {workshop.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {workshop.location.addressText || 'Sin dirección cargada'}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Estado: {workshop.status === 'published' ? 'Publicado' : workshop.status === 'draft' ? 'Borrador' : 'Cancelado'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
              <Link href={`/teacher/workshops/${workshop.id}/edit`} className="btn btn-secondary">
                Editar
              </Link>
              <Link href={`/teacher/workshops/${workshop.id}/sessions/new`} className="btn btn-secondary">
                Agregar fecha
              </Link>
              <Link href={`/teacher/workshops/${workshop.id}/students`} className="btn btn-primary">
                Alumnos y asistencia
              </Link>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="material-card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Inscriptos</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{enrollments.length}</p>
          </div>
          <div className="material-card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Pagados</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.paidCount}</p>
          </div>
          <div className="material-card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Pendientes</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.pendingCount}</p>
          </div>
          <div className="material-card">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Recaudado</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              ${stats.totalRevenue.toLocaleString('es-AR')} {workshop.currency}
            </p>
          </div>
        </div>

        <div className="material-card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Próxima fecha</h2>
          {stats.nextSession ? (
            <p style={{ color: 'var(--text-primary)' }}>
              {stats.nextSession.startAt.toLocaleString('es-AR')} - {stats.nextSession.endAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Sin próximas fechas. Agregá una sesión para recibir inscripciones.
            </p>
          )}
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Recaudación potencial (pagados + pendientes): ${stats.reservedRevenue.toLocaleString('es-AR')} {workshop.currency}
          </p>
        </div>

        <div className="material-card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Lista de alumnos</h2>
          {enrollments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Todavía no hay alumnos inscriptos.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {enrollments.map((enrollment) => {
                const student = studentsById[enrollment.studentId];
                return (
                  <div
                    key={enrollment.id}
                    style={{
                      border: '1px solid var(--divider)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600 }}>
                        {student?.displayName || student?.firstName || student?.email || 'Alumno'}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {student?.email || 'Sin email disponible'}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {enrollment.status === 'paid'
                        ? 'Pagado'
                        : enrollment.status === 'pending_payment'
                        ? 'Pendiente'
                        : enrollment.status === 'cancelled'
                        ? 'Cancelado'
                        : 'Reembolsado'}
                    </span>
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

