'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listUserFavorites, removeFavorite } from '@/services/favorites.service';
import { getWorkshopById } from '@/services/workshops.service';
import { ExploreWorkshopCard } from './ExploreWorkshopCard';
import type { Workshop } from '@/types';

export function FavoritesList() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) {
        setWorkshops([]);
        setLoading(false);
        return;
      }
      try {
        const favs = await listUserFavorites(user.uid);
        const workshopsData: Workshop[] = [];
        for (const f of favs) {
          const w = await getWorkshopById(f.workshopId);
          if (w && w.status === 'published') workshopsData.push(w);
        }
        setWorkshops(workshopsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user]);

  if (!user) return null;

  if (loading) return <div className="loading">Cargando favoritos...</div>;

  if (workshops.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
        <p>No tienes talleres guardados en favoritos.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Tocá la estrella en un taller para guardarlo.
        </p>
      </div>
    );
  }

  return (
    <div className="explore-grid">
      {workshops.map((workshop, index) => (
        <ExploreWorkshopCard
          key={workshop.id}
          workshop={workshop}
          index={index}
          favorited
          onToggleFavorite={() => {
            void removeFavorite(user.uid, workshop.id);
            setWorkshops((prev) => prev.filter((item) => item.id !== workshop.id));
          }}
        />
      ))}
    </div>
  );
}
