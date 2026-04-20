'use client';

import Link from 'next/link';
import { useAdminWorkshops } from '@/hooks/useAdminWorkshops';

export default function AdminWorkshopsPage() {
  const { workshops, loading, error } = useAdminWorkshops(100);

  if (loading) return <div className="loading">Cargando talleres...</div>;

  if (error) {
    return (
      <div>
        <h1 style={{ marginBottom: '1rem' }}>Talleres</h1>
        <p style={{ color: 'crimson' }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Talleres</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {workshops.map((w) => (
          <div
            key={w.id}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <strong>{w.title}</strong>
              <span
                style={{
                  marginLeft: '1rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  background: w.status === 'published' ? '#28a745' : '#ffc107',
                  color: 'white',
                }}
              >
                {w.status}
              </span>
            </div>
            <Link href={`/workshops/${w.id}`} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
              Ver
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
