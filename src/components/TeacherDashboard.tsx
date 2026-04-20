'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherWorkshops } from '@/hooks/useWorkshops';
import {
  deleteWorkshop,
  publishWorkshop,
  unpublishWorkshop,
} from '@/services/workshops.service';

export function TeacherDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { workshops, loading, error } = useTeacherWorkshops(user?.uid || null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDelete = async (workshopId: string, title: string) => {
    if (!confirm(`¿Eliminar el taller "${title}"? Esta acción no se puede deshacer.`))
      return;
    setActionLoading(workshopId);
    try {
      await deleteWorkshop(workshopId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (
    workshopId: string,
    isPublished: boolean
  ) => {
    setActionLoading(workshopId);
    try {
      if (isPublished) {
        await unpublishWorkshop(workshopId);
      } else {
        await publishWorkshop(workshopId);
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/teacher/workshops/new" className="btn btn-primary">
          Crear Nuevo Taller
        </Link>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Mis Talleres</h2>

      {loading && <div className="loading">Cargando talleres...</div>}

      {error && (
        <div className="error-message">Error: {error.message}</div>
      )}

      {!loading && !error && workshops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No has creado ningún taller aún.</p>
          <p style={{ marginTop: '0.5rem' }}>
            <Link href="/teacher/workshops/new" style={{ color: '#0070f3' }}>
              Crea tu primer taller
            </Link>
          </p>
        </div>
      )}

      {!loading && workshops.length > 0 && (
        <div className="card-grid">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3>{workshop.title}</h3>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    background:
                      workshop.status === 'published'
                        ? '#28a745'
                        : workshop.status === 'draft'
                        ? '#ffc107'
                        : '#dc3545',
                    color: 'white',
                  }}
                >
                  {workshop.status === 'published'
                    ? 'Publicado'
                    : workshop.status === 'draft'
                    ? 'Borrador'
                    : 'Cancelado'}
                </span>
              </div>
              <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {workshop.description.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link
                  href={`/workshops/${workshop.id}`}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Ver
                </Link>
                <Link
                  href={`/teacher/workshops/${workshop.id}/edit`}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Editar
                </Link>
                {workshop.status === 'draft' ? (
                  <button
                    onClick={() => handleTogglePublish(workshop.id, false)}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={actionLoading === workshop.id}
                  >
                    {actionLoading === workshop.id ? '...' : 'Publicar'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleTogglePublish(workshop.id, true)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    disabled={actionLoading === workshop.id}
                  >
                    {actionLoading === workshop.id ? '...' : 'Ocultar'}
                  </button>
                )}
                {workshop.status === 'draft' && (
                  <Link
                    href={`/teacher/workshops/${workshop.id}/sessions/new`}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Agregar Sesión
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(workshop.id, workshop.title)}
                  className="btn btn-outline"
                  style={{ flex: 1, color: '#dc3545', borderColor: '#dc3545' }}
                  disabled={actionLoading === workshop.id}
                >
                  {actionLoading === workshop.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
