'use client';

import { useState, useEffect } from 'react';
import { getAdminAggregateStats, type AdminAggregateStats } from '@/services/admin.service';

export function useAdminAggregateStats() {
  const [stats, setStats] = useState<AdminAggregateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await getAdminAggregateStats();
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Error al cargar estadísticas'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}
