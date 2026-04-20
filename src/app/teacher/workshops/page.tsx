'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherWorkshops } from '@/hooks/useWorkshops';
import { publishWorkshop, unpublishWorkshop } from '@/services/workshops.service';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';

export default function TeacherWorkshopsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { workshops, loading: workshopsLoading, refetch } = useTeacherWorkshops(user?.uid || null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handlePublish = async (workshopId: string) => {
    try {
      await publishWorkshop(workshopId);
      refetch?.();
    } catch (err) {
      console.error('Error al publicar taller:', err);
      alert('Error al publicar el taller');
    }
  };

  const handleUnpublish = async (workshopId: string) => {
    try {
      await unpublishWorkshop(workshopId);
      refetch?.();
    } catch (err) {
      console.error('Error al despublicar taller:', err);
      alert('Error al despublicar el taller');
    }
  };

  if (authLoading || workshopsLoading) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingBottom: '80px', padding: '1rem' }}>
          <div className="loading">Cargando...</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  return (
    <>
      <HomeHeader />
      <main style={{ paddingBottom: '80px' }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="section-title" style={{ marginBottom: 0 }}>
              Mis Talleres
            </h1>
            <Link
              href="/teacher/workshops/new"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Crear Taller
            </Link>
          </div>

          {workshops.length === 0 ? (
            <div
              className="material-card"
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 1.5rem',
                }}
              >
                <Image
                  src="/images/promo.png"
                  alt="Sin talleres"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Aún no has creado talleres
              </h2>
              <p style={{ marginBottom: '2rem' }}>
                Comenzá a compartir tu conocimiento creando tu primer taller
              </p>
              <Link href="/teacher/workshops/new" className="btn btn-primary">
                Crear mi primer taller
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {workshops.map((workshop) => (
                <div key={workshop.id} className="material-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#f5f5f5',
                      }}
                    >
                      <Image
                        src={workshop.coverImageUrl || '/images/promo.png'}
                        alt={workshop.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {workshop.title}
                        </h3>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background:
                              workshop.status === 'published'
                                ? 'var(--primary-green-light)'
                                : workshop.status === 'draft'
                                ? '#fff3cd'
                                : '#f8d7da',
                            color:
                              workshop.status === 'published'
                                ? 'var(--primary-green-dark)'
                                : workshop.status === 'draft'
                                ? '#856404'
                                : '#721c24',
                            flexShrink: 0,
                            marginLeft: '0.5rem',
                          }}
                        >
                          {workshop.status === 'published'
                            ? 'Publicado'
                            : workshop.status === 'draft'
                            ? 'Borrador'
                            : 'Cancelado'}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.75rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {workshop.description}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          💰 ${workshop.price} {workshop.currency}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          👥 {workshop.stats.enrolledCount} / {workshop.capacity}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          ⭐ {workshop.stats.avgRating.toFixed(1)} ({workshop.stats.reviewsCount})
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link
                          href={`/teacher/workshops/${workshop.id}`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          Ver detalle
                        </Link>
                        <Link
                          href={`/teacher/workshops/${workshop.id}/edit`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          Editar
                        </Link>
                        <Link
                          href={`/teacher/workshops/${workshop.id}/students`}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          Ver Alumnos ({workshop.stats.enrolledCount})
                        </Link>
                        {workshop.status === 'published' ? (
                          <button
                            onClick={() => handleUnpublish(workshop.id)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            Despublicar
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePublish(workshop.id)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            Publicar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
