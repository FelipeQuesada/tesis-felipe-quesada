import { useCallback, useEffect, useState } from 'react';
import { listTeacherWorkshops } from '../services/workshops.service';
import type { Workshop } from '../types';

export function useTeacherWorkshops(teacherId: string | null) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (opts?: { silent?: boolean }) => {
    if (!teacherId) {
      setWorkshops([]);
      setLoading(false);
      return;
    }
    try {
      if (!opts?.silent) setLoading(true);
      const data = await listTeacherWorkshops(teacherId);
      setWorkshops(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar talleres'));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { workshops, loading, error, refetch };
}
