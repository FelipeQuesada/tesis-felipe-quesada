'use client';

import { useState, useEffect } from 'react';
import {
  listUserFavorites,
  addFavorite,
  removeFavorite,
  getFavorite,
} from '@/services/favorites.service';

export function useFavorites(userId: string | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    listUserFavorites(userId).then((favs) => {
      setFavoriteIds(new Set(favs.map((f) => f.workshopId)));
      setLoading(false);
    });
  }, [userId]);

  const toggleFavorite = async (workshopId: string) => {
    if (!userId) return;
    const isFav = favoriteIds.has(workshopId);
    try {
      if (isFav) {
        await removeFavorite(userId, workshopId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(workshopId);
          return next;
        });
      } else {
        await addFavorite(userId, workshopId);
        setFavoriteIds((prev) => new Set(prev).add(workshopId));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const isFavorite = (workshopId: string) => favoriteIds.has(workshopId);

  return { favoriteIds, isFavorite, toggleFavorite, loading };
}

export function useIsFavorite(userId: string | null, workshopId: string) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !workshopId) {
      setIsFav(false);
      setLoading(false);
      return;
    }
    getFavorite(userId, workshopId).then((f) => {
      setIsFav(!!f);
      setLoading(false);
    });
  }, [userId, workshopId]);

  return { isFavorite: isFav, loading };
}
