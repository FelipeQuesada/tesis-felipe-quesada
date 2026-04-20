'use client';

import { useState, useEffect } from 'react';
import {
  listStudentEnrollments,
  listTeacherEnrollmentsByWorkshop,
} from '@/services/enrollments.service';
import type { Enrollment } from '@/types';

export function useStudentEnrollments(studentId: string | null) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const uid = studentId;

    async function fetchEnrollments() {
      try {
        setLoading(true);
        const data = await listStudentEnrollments(uid);
        setEnrollments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, [studentId]);

  return { enrollments, loading, error };
}

export function useTeacherEnrollments(
  teacherId: string | null,
  workshopId?: string
) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const tid = teacherId;

    async function fetchEnrollments() {
      try {
        setLoading(true);
        const data = await listTeacherEnrollmentsByWorkshop(
          tid,
          workshopId
        );
        setEnrollments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, [teacherId, workshopId]);

  return { enrollments, loading, error };
}
