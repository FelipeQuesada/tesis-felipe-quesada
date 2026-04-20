'use client';

import Link from 'next/link';
import { usePublishedWorkshops } from '@/hooks/useWorkshops';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import type { Workshop } from '@/types';

function FavoriteButton({
  isFavorite,
  onToggle,
}: {
  isFavorite: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        fontSize: '1.5rem',
      }}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
}

export function WorkshopCard({
  workshop,
  showFavorite = false,
}: {
  workshop: Workshop;
  showFavorite?: boolean;
}) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(user?.uid || null);

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {showFavorite && user && (
          <FavoriteButton
            isFavorite={isFavorite(workshop.id)}
            onToggle={() => toggleFavorite(workshop.id)}
          />
        )}
        <div style={{ flex: 1 }}>
          <Link href={`/workshops/${workshop.id}`}>
            <h3 style={{ marginBottom: '0.5rem' }}>{workshop.title}</h3>
            <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {workshop.description.substring(0, 150)}
              {workshop.description.length > 150 ? '...' : ''}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#0070f3', fontSize: '1.25rem' }}>
                  ${workshop.price} {workshop.currency}
                </strong>
                {workshop.location.cityId && (
                  <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                    📍 {workshop.location.cityId}
                  </p>
                )}
              </div>
            </div>
          </Link>
          <Link
            href={`/profile/${workshop.teacherId}`}
            style={{ fontSize: '0.8rem', color: '#0070f3', marginTop: '0.5rem', display: 'block' }}
          >
            Ver perfil del profesor
          </Link>
        </div>
      </div>
    </div>
  );
}

export function WorkshopList() {
  const { workshops, loading, error } = usePublishedWorkshops();

  if (loading) {
    return <div className="loading">Cargando talleres...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        Error al cargar talleres: {error.message}
      </div>
    );
  }

  if (workshops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        <p>No hay talleres disponibles en este momento.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Sé el primero en crear uno si eres profesor.
        </p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {workshops.map((workshop) => (
        <WorkshopCard key={workshop.id} workshop={workshop} showFavorite />
      ))}
    </div>
  );
}
