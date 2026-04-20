'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listUserFavorites } from '@/services/favorites.service';
import { getWorkshopById } from '@/services/workshops.service';
import { WorkshopCard } from './WorkshopList';
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
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>No tienes talleres guardados en favoritos.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Haz clic en el corazón en cualquier taller para guardarlo.
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
