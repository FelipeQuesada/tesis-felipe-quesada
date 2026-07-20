import { useCallback, useEffect, useState } from 'react';
import { runWithFirestoreRetry } from '../lib/firestoreRetry';
import {
  addFavorite,
  listUserFavorites,
  removeFavorite,
} from '../services/favorites.service';

export function useFavorites(userId: string | null) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refreshFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    try {
      const favs = await runWithFirestoreRetry(() => listUserFavorites(userId));
      setFavoriteIds(new Set(favs.map((f) => f.workshopId)));
    } catch (err) {
      console.error('Error cargando favoritos:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    void refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (workshopId: string) => {
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
        console.error('Error al actualizar favorito:', err);
        throw err;
      }
    },
    [userId, favoriteIds]
  );

  const isFavorite = useCallback(
    (workshopId: string) => favoriteIds.has(workshopId),
    [favoriteIds]
  );

  return { favoriteIds, isFavorite, toggleFavorite, loading, refreshFavorites };
}
