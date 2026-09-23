'use client';

import { useAdminAggregateStats } from '@/hooks/useAdminStats';

export default function AdminStatsPage() {
  const { stats, loading, error } = useAdminAggregateStats();

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (error || !stats) {
    return (
      <div>
        <h1 style={{ marginBottom: '1.5rem' }}>Estadísticas</h1>
        <p style={{ color: 'crimson' }}>{error?.message ?? 'No se pudieron cargar los datos.'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Estadísticas</h1>
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Usuarios</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>{stats.users}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Talleres publicados</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.publishedWorkshops}</p>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem' }}>Inscripciones</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6c757d' }}>{stats.enrollments}</p>
        </div>
      </div>
    </div>
  );
}

