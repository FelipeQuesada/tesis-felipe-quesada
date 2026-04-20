'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { getWorkshopById } from '@/services/workshops.service';
import { createSession } from '@/services/sessions.service';
import type { SessionCreateInput } from '@/types';

export default function NewSessionPage() {
  const params = useParams();
  const workshopId = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [workshop, setWorkshop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<SessionCreateInput>({
    workshopId,
    startAt: new Date(),
    endAt: new Date(),
  });

  useEffect(() => {
    async function loadWorkshop() {
      try {
        const data = await getWorkshopById(workshopId);
        if (!data) {
          setError('Taller no encontrado');
          return;
        }
        if (data.teacherId !== user?.uid) {
          setError('No tienes permiso para crear sesiones de este taller');
          return;
        }
        setWorkshop(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el taller');
      } finally {
        setLoading(false);
      }
    }

    if (user && workshopId) {
      loadWorkshop();
    }
  }, [user, workshopId]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseDateTimeLocal = (value: string): Date => {
    return new Date(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createSession(formData);
      router.push(`/workshops/${workshopId}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear la sesión');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  if (error && !workshop) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="error-message">{error}</div>
        </main>
      </>
    );
  }

  if (!user || user.role !== 'teacher') {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="error-message">
            Solo los profesores pueden crear sesiones.
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container" style={{ maxWidth: '600px' }}>
        <h1 style={{ marginBottom: '1rem' }}>Nueva Sesión</h1>
        {workshop && (
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Taller: <strong>{workshop.title}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startAt" className="form-label">
              Fecha y Hora de Inicio *
            </label>
            <input
              id="startAt"
              type="datetime-local"
              className="form-input"
              value={formatDateTimeLocal(formData.startAt)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startAt: parseDateTimeLocal(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endAt" className="form-label">
              Fecha y Hora de Fin *
            </label>
            <input
              id="endAt"
              type="datetime-local"
              className="form-input"
              value={formatDateTimeLocal(formData.endAt)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endAt: parseDateTimeLocal(e.target.value),
                })
              }
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creando...' : 'Crear Sesión'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
