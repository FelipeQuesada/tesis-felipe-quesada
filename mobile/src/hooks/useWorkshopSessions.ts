import { useCallback, useEffect, useState } from 'react';
import { listSessionsByWorkshop } from '../services/sessions.service';
import type { Session } from '../types';

export function useWorkshopSessions(workshopId: string | null | undefined) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!workshopId) {
      setSessions([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      const data = await listSessionsByWorkshop(workshopId);
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Error al cargar sesiones')
      );
    } finally {
      setLoading(false);
    }
  }, [workshopId]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}
