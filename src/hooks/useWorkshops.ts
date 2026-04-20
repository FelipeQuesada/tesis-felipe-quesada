'use client';

import { useState, useEffect } from 'react';
import {
  listPublishedWorkshops,
  listTeacherWorkshops,
  getWorkshopById,
} from '@/services/workshops.service';
import type { Workshop } from '@/types';

export function usePublishedWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchWorkshops() {
      try {
        setLoading(true);
        const data = await listPublishedWorkshops();
        setWorkshops(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchWorkshops();
  }, []);

  return { workshops, loading, error };
}

export function useTeacherWorkshops(teacherId: string | null) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkshops = async () => {
    if (!teacherId) {
      setWorkshops([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await listTeacherWorkshops(teacherId);
      setWorkshops(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [teacherId]);

  return { workshops, loading, error, refetch: fetchWorkshops };
}

export function useWorkshop(workshopId: string | null) {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workshopId) {
      setWorkshop(null);
      setLoading(false);
      return;
    }

    const id = workshopId;

    async function fetchWorkshop() {
      try {
        setLoading(true);
        const data = await getWorkshopById(id);
        setWorkshop(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchWorkshop();
  }, [workshopId]);

  return { workshop, loading, error };
}
