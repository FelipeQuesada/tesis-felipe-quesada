'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { useWorkshop } from '@/hooks/useWorkshops';
import { useWorkshopSessions } from '@/hooks/useSessions';
import { useFavorites } from '@/hooks/useFavorites';
import { createEnrollment } from '@/services/enrollments.service';

export default function WorkshopDetailPage() {
  const params = useParams();
  const workshopId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { workshop, loading, error } = useWorkshop(workshopId);
  const { isFavorite, toggleFavorite } = useFavorites(user?.uid || null);
  const { sessions, loading: sessionsLoading } = useWorkshopSessions(workshopId);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const handleEnroll = async (sessionId: string) => {
    if (!user || user.role !== 'student') {
      router.push('/auth/login');
      return;
    }

    if (!workshop) return;

    setEnrolling(true);
    setEnrollError(null);

    try {
      await createEnrollment({
        sessionId,
        workshopId: workshop.id,
        studentId: user.uid,
        teacherId: workshop.teacherId,
      });
      alert('Inscripción creada exitosamente. Estado: pendiente de pago.');
    } catch (err: any) {
      setEnrollError(err.message || 'Error al inscribirse');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="loading">Cargando taller...</div>
        </main>
      </>
    );
  }

  if (error || !workshop) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="error-message">
            {error?.message || 'Taller no encontrado'}
          </div>
        </main>
      </>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <>
      <Navbar />
      <main className="container" style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#0070f3' }}>
            ← Volver a talleres
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {user && (
              <button
                onClick={() => toggleFavorite(workshop.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                }}
                aria-label={isFavorite(workshop.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                {isFavorite(workshop.id) ? '❤️' : '🤍'}
              </button>
            )}
            {user?.role === 'teacher' && workshop.teacherId === user.uid && (
              <Link
                href={`/teacher/workshops/${workshop.id}/edit`}
                className="btn btn-outline"
              >
                Editar taller
              </Link>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>{workshop.title}</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {workshop.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <div>
              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Precio</strong>
              <p style={{ fontSize: '1.5rem', color: '#0070f3', fontWeight: 'bold' }}>
                ${workshop.price} {workshop.currency}
              </p>
            </div>
            <div>
              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Capacidad</strong>
              <p style={{ fontSize: '1.25rem' }}>{workshop.capacity} personas</p>
            </div>
            <div>
              <strong style={{ color: '#666', fontSize: '0.875rem' }}>Ubicación</strong>
              <p>{workshop.location.addressText}</p>
              {workshop.location.cityId && (
                <p style={{ fontSize: '0.875rem', color: '#666' }}>
                  {workshop.location.cityId}
                </p>
              )}
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: '1rem' }}>Sesiones Disponibles</h2>

        {sessionsLoading && <div className="loading">Cargando sesiones...</div>}

        {!sessionsLoading && sessions.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No hay sesiones disponibles para este taller.</p>
            {user?.role === 'teacher' && workshop.teacherId === user.uid && (
              <Link
                href={`/teacher/workshops/${workshop.id}/sessions/new`}
                className="btn btn-primary"
                style={{ marginTop: '1rem', display: 'inline-block' }}
              >
                Crear Sesión
              </Link>
            )}
          </div>
        )}

        {!sessionsLoading && sessions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sessions.map((session) => (
              <div key={session.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>
                      {formatDate(session.startAt)}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>
                      Hasta: {formatDate(session.endAt)}
                    </p>
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      Inscritos: {session.stats.enrolledCount} / {workshop.capacity}
                    </p>
                  </div>
                  {user?.role === 'student' && (
                    <button
                      onClick={() => handleEnroll(session.id)}
                      className="btn btn-primary"
                      disabled={enrolling || session.status !== 'scheduled'}
                    >
                      {enrolling ? 'Inscribiendo...' : 'Inscribirme'}
                    </button>
                  )}
                  {user?.role === 'teacher' && workshop.teacherId === user.uid && (
                    <span
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.25rem',
                        background: '#e0e0e0',
                        fontSize: '0.875rem',
                      }}
                    >
                      {session.status === 'scheduled' ? 'Programada' : session.status}
                    </span>
                  )}
                </div>
                {enrollError && (
                  <div className="error-message" style={{ marginTop: '0.5rem' }}>
                    {enrollError}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
