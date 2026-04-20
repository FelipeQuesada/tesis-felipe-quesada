'use client';

import Link from 'next/link';

export function AdminDashboard() {
  return (
    <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '0.5rem' }}>
      <h2>Panel de Administración</h2>
      <p style={{ color: '#666', marginTop: '0.5rem', marginBottom: '1rem' }}>
        Gestiona usuarios, talleres y consulta estadísticas.
      </p>
      <Link href="/admin/stats" className="btn btn-primary">
        Ir al panel de admin
      </Link>
    </div>
  );
}
