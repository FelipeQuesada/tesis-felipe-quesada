import { useEffect, useState } from 'react';
import { getWorkshopById } from '../services/workshops.service';
import type { Workshop } from '../types';

export function useWorkshop(workshopId: string | null | undefined) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workshopId || workshopId === '') {
      setWorkshop(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setLoading(true);
        const data = await getWorkshopById(workshopId);
        if (!cancelled) {
          setWorkshop(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error('Error al cargar el taller')
          );
          setWorkshop(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workshopId]);

  return { workshop, loading, error };
}
