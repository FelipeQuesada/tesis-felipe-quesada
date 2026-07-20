import { useCallback, useEffect, useState } from 'react';
import { warmUpFirestoreConnection } from '../lib/firebase';
import { listPublishedWorkshops } from '../services/workshops.service';
import {
  formatFirestoreLoadError,
  runWithFirestoreRetry,
} from '../lib/firestoreRetry';
import type { Workshop } from '../types';

export function usePublishedWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [maxRetryAttempts, setMaxRetryAttempts] = useState(0);

  const fetchWorkshops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRetryAttempt(0);
      // No bloquear la UI: el warm-up corre en paralelo (en web ya es instantáneo)
      void warmUpFirestoreConnection();
      const data = await runWithFirestoreRetry(
        () => listPublishedWorkshops(),
        {
          onRetry: (attempt, max) => {
            setRetryAttempt(attempt);
            setMaxRetryAttempts(max);
          },
        }
      );
      setWorkshops(data);
      setRetryAttempt(0);
    } catch (err) {
      setError(formatFirestoreLoadError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWorkshops();
  }, [fetchWorkshops]);

  return {
    workshops,
    loading,
    error,
    retryAttempt,
    maxRetryAttempts,
    refetch: fetchWorkshops,
  };
}
