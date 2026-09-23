'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherWorkshops } from '@/hooks/useWorkshops';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';

export default function TeacherHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { workshops, loading: workshopsLoading } = useTeacherWorkshops(user?.uid || null);

  useEffect(() => {
    if (!loading && user && user.role !== 'teacher') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || workshopsLoading) {
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

  const publishedCount = workshops.filter((w) => w.status === 'published').length;
  const draftCount = workshops.filter((w) => w.status === 'draft').length;

  return (
    <>
      <HomeHeader />
      <main style={{ paddingBottom: '120px' }}>
        {/* Sección de bienvenida e incentivo */}
        <section style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div
            className="material-card"
            style={{
              background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%)',
              color: 'white',
              padding: '2rem',
              textAlign: 'center',
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
                alt="Crear talleres"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: 'white',
              }}
            >
              ¡Compartí tu conocimiento!
            </h1>
            <p
              style={{
                fontSize: '1rem',
                marginBottom: '2rem',
                opacity: 0.95,
                lineHeight: '1.6',
              }}
            >
              Creá talleres y conectá con estudiantes apasionados por aprender
            </p>
            <Link
              href="/teacher/workshops/new"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'white',
                color: 'var(--primary-green)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 'var(--elevation-2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--elevation-3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--elevation-2)';
              }}
            >
              Crear mi primer taller
            </Link>
          </div>
        </section>

        {/* Estadísticas rápidas */}
        <section style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
            }}
          >
            <div className="material-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                {workshops.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Talleres creados
              </div>
            </div>
            <div className="material-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                {publishedCount}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Publicados
              </div>
            </div>
            <div className="material-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9800', marginBottom: '0.5rem' }}>
                {draftCount}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Borradores
              </div>
            </div>
          </div>
        </section>

        {/* Accesos rápidos */}
        <section style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h2 className="section-title">Accesos rápidos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link
              href="/teacher/workshops/new"
              className="material-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  Crear nuevo taller
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Publicá un nuevo taller y comenzá a recibir inscripciones
                </p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--text-secondary)' }}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>

            <Link
              href="/teacher/workshops"
              className="material-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary-green-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--primary-green-dark)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  Mis talleres
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Administrá tus talleres, editalos y revisá inscripciones
                </p>
              </div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--text-secondary)' }}
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
        </section>

        {/* Talleres recientes */}
        {workshops.length > 0 && (
          <section style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                Tus talleres recientes
              </h2>
              <Link
                href="/teacher/workshops"
                className="material-link"
                style={{ fontSize: '0.875rem' }}
              >
                Ver todos
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {workshops.slice(0, 3).map((workshop) => (
                <Link
                  key={workshop.id}
                  href={`/teacher/workshops/${workshop.id}`}
                  className="material-card"
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#f5f5f5',
                    }}
                  >
                    <Image
                      src="/images/promo.png"
                      alt={workshop.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        marginBottom: '0.25rem',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {workshop.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {workshop.description}
                    </p>
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
                      }}
                    >
                      {workshop.status === 'published'
                        ? 'Publicado'
                        : workshop.status === 'draft'
                        ? 'Borrador'
                        : 'Cancelado'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </>
  );
}

