'use client';

import { useState, useEffect } from 'react';
import { searchWorkshops } from '@/services/workshops.service';
import type { Workshop, WorkshopSearchFilters } from '@/types';

export function useSearchWorkshops(filters: WorkshopSearchFilters = {}) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await searchWorkshops(filters);
        setWorkshops(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [JSON.stringify(filters)]);

  return { workshops, loading, error };
}
