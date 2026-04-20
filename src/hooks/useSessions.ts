'use client';

import { useState, useEffect } from 'react';
import { listSessionsByWorkshop } from '@/services/sessions.service';
import type { Session } from '@/types';

export function useWorkshopSessions(workshopId: string | null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workshopId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const wid = workshopId;

    async function fetchSessions() {
      try {
        setLoading(true);
        const data = await listSessionsByWorkshop(wid);
        setSessions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [workshopId]);

  return { sessions, loading, error };
}
