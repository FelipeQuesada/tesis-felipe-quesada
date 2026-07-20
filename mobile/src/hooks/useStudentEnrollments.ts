import { useCallback, useEffect, useState } from 'react';
import { listStudentEnrollments } from '../services/enrollments.service';
import type { Enrollment } from '../types';

export function useStudentEnrollments(studentId: string | null) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (): Promise<Enrollment[]> => {
    if (!studentId) {
      setEnrollments([]);
      return [];
    }
    const data = await listStudentEnrollments(studentId);
    setEnrollments(data);
    return data;
  }, [studentId]);

  useEffect(() => {
    if (!studentId) {
      setEnrollments([]);
      setLoading(false);
      setError(null);
      return;
    }

    const uid = studentId;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await listStudentEnrollments(uid);
        if (!cancelled) {
          setEnrollments(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Error desconocido'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return { enrollments, loading, error, refetch };
}
