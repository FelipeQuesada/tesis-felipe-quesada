'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentEnrollments } from '@/hooks/useEnrollments';
import { getWorkshopById } from '@/services/workshops.service';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';
import type { Workshop } from '@/types';

export default function MyWorkshopsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { enrollments, loading: enrollmentsLoading } = useStudentEnrollments(
    user?.uid || null
  );
  const [workshops, setWorkshops] = useState<Record<string, Workshop>>({});
  const [loadingWorkshops, setLoadingWorkshops] = useState(true);

  useEffect(() => {
    async function loadWorkshops() {
      if (enrollments.length === 0) {
        setLoadingWorkshops(false);
        return;
      }

      try {
        const workshopPromises = enrollments.map((enrollment) =>
          getWorkshopById(enrollment.workshopId).then((workshop) => ({
            id: enrollment.workshopId,
            workshop,
          }))
        );
        const results = await Promise.all(workshopPromises);
        const workshopMap: Record<string, Workshop> = {};
        results.forEach(({ id, workshop }) => {
          if (workshop) {
            workshopMap[id] = workshop;
          }
        });
        setWorkshops(workshopMap);
      } catch (err) {
        console.error('Error loading workshops:', err);
      } finally {
        setLoadingWorkshops(false);
      }
    }

    if (!enrollmentsLoading) {
      loadWorkshops();
    }
  }, [enrollments, enrollmentsLoading]);

  // Redirigir profesores a su página de talleres
  useEffect(() => {
    if (!authLoading && user?.role === 'teacher') {
      router.push('/teacher/workshops');
    }
  }, [user, authLoading, router]);

  if (authLoading || enrollmentsLoading || loadingWorkshops) {
    return (
      <>
        <PageHeader title="Mis Talleres" />
        <main style={{ paddingBottom: '80px', padding: '1rem' }}>
          <div className="loading">Cargando...</div>
        </main>
        <BottomNav />
      </>
    );
  }

  // Si es profesor, no renderizar (se redirige)
  if (user?.role === 'teacher') {
    return null;
  }

  // Si no está logueado, mostrar página amigable
  if (!user) {
    return (
      <>
        <PageHeader title="Mis Talleres" />
        <main style={{ padding: '1rem 1rem 150px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '150px',
                height: '150px',
                marginBottom: '1.5rem',
              }}
            >
              <Image
                src="/images/manos.png"
                alt="Iniciar sesión"
                fill
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              Inicia sesión para ver tus talleres
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '400px',
                lineHeight: '1.6',
              }}
            >
              Para guardar talleres en favoritos y ver tus inscripciones es necesario iniciar sesión.
            </p>
            <Link href="/auth/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Iniciar Sesión
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Mis Talleres" />
      <main style={{ paddingBottom: '80px', padding: '1rem' }}>

        {enrollments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-secondary)',
            }}
          >
            <p>No tienes talleres inscritos aún.</p>
            <Link
              href="/workshops"
              className="material-link"
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Explorar talleres
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.map((enrollment, index) => {
              const workshop = workshops[enrollment.workshopId];
              // Rotar entre diferentes imágenes disponibles
              const images = [
                '/images/stock-ceramica.png',
                '/images/stock-pintura.png',
                '/images/stock-floral.png',
                '/images/stock-plantas.png',
              ];
              const imageSrc = workshop?.coverImageUrl || images[index % images.length];
              
              return (
                <Link
                  key={enrollment.id}
                  href={`/workshops/${enrollment.workshopId}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="material-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '180px',
                        background: '#f5f5f5',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={imageSrc}
                        alt={workshop?.title || 'Taller'}
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          marginBottom: '0.5rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {workshop?.title || `Taller ${enrollment.workshopId}`}
                      </h3>
                      {workshop && (
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {workshop.teacherName || 'Profesor'}
                        </p>
                      )}
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          color: 'var(--primary-green)',
                          fontWeight: 500,
                        }}
                      >
                        {enrollment.status === 'pending_payment'
                          ? 'Pendiente de pago'
                          : enrollment.status === 'paid'
                          ? 'Pagado'
                          : enrollment.status}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

