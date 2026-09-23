'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { getUserDoc } from '@/services/user.service';
import { listTeacherWorkshops } from '@/services/workshops.service';
import { listStudentEnrollments } from '@/services/enrollments.service';
import { getWorkshopById } from '@/services/workshops.service';
import { getSessionById } from '@/services/sessions.service';
import type { User } from '@/types';

export default function ProfilePage({ uid }: { uid: string }) {
  
  const [user, setUser] = useState<User | null>(null);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const userDoc = await getUserDoc(uid);
        if (!userDoc) {
          setError('Usuario no encontrado');
          setLoading(false);
          return;
        }
        setUser(userDoc);

        if (userDoc.role === 'teacher') {
          const w = await listTeacherWorkshops(uid);
          setWorkshops(w);
        } else if (userDoc.role === 'student') {
          const enrolls = await listStudentEnrollments(uid);
          const details = [];
          for (const e of enrolls) {
            if (e.status === 'cancelled' || e.status === 'refunded') continue;
            const workshop = await getWorkshopById(e.workshopId);
            const session = await getSessionById(e.sessionId);
            if (workshop) details.push({ enrollment: e, workshop, session });
          }
          setEnrollments(details);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="loading">Cargando perfil...</div>
        </main>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="error-message">{error || 'Usuario no encontrado'}</div>
          <Link href="/">Volver al inicio</Link>
        </main>
      </>
    );
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(date);

  return (
    <>
      <Navbar />
      <main className="container" style={{ maxWidth: '800px' }}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Avatar'}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            )}
            <div>
              <h1 style={{ marginBottom: '0.25rem' }}>
                {user.displayName || 'Sin nombre'}
              </h1>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>{user.email}</p>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: '#e0e0e0',
                  fontSize: '0.875rem',
                }}
              >
                {user.role === 'teacher' ? 'Profesor' : user.role === 'student' ? 'Estudiante' : 'Admin'}
              </span>
              {user.bio && (
                <p style={{ marginTop: '1rem', color: '#333' }}>{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {user.role === 'teacher' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Talleres que dicta</h2>
            {workshops.length === 0 ? (
              <p style={{ color: '#666' }}>No tiene talleres publicados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workshops
                  .filter((w) => w.status === 'published')
                  .map((w) => (
                    <Link
                      key={w.id}
                      href={`/workshops/${w.id}`}
                      className="card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <h3 style={{ marginBottom: '0.5rem' }}>{w.title}</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        ${w.price} {w.currency}
                      </p>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'student' && (
          <div>
            <h2 style={{ marginBottom: '1rem' }}>Talleres realizados / inscrito</h2>
            {enrollments.length === 0 ? (
              <p style={{ color: '#666' }}>No tiene inscripciones.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {enrollments.map(({ enrollment, workshop, session }) => (
                  <Link
                    key={enrollment.id}
                    href={`/workshops/${workshop.id}`}
                    className="card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ marginBottom: '0.5rem' }}>{workshop.title}</h3>
                    {session && (
                      <p style={{ color: '#666', fontSize: '0.875rem' }}>
                        {formatDate(session.startAt)}
                      </p>
                    )}
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        background:
                          enrollment.status === 'paid'
                            ? '#28a745'
                            : enrollment.status === 'pending_payment'
                            ? '#ffc107'
                            : '#6c757d',
                        color: 'white',
                      }}
                    >
                      {enrollment.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
