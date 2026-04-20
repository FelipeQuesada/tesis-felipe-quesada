'use client';

import { useState, useEffect } from 'react';
import { listAllWorkshopsAdmin } from '@/services/workshops.service';
import type { Workshop } from '@/types';

export function useAdminWorkshops(maxResults = 100) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await listAllWorkshopsAdmin(maxResults);
        if (!cancelled) {
          setWorkshops(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Error al cargar talleres'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [maxResults]);

  return { workshops, loading, error };
}
