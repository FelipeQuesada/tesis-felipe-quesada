'use client';

import Link from 'next/link';
import type { Workshop } from '@/types';

type Props = {
  workshops: Workshop[];
};

export function RelatedWorkshopsSection({ workshops }: Props) {
  if (workshops.length === 0) return null;

  return (
    <section
      style={{
        marginTop: '2.5rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--divider)',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '1.25rem',
        }}
      >
        Talleres relacionados
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {workshops.map((w) => (
          <li key={w.id}>
            <Link
              href={`/workshops/${w.id}`}
              style={{
                display: 'block',
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--surface)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                boxShadow: 'var(--elevation-1)',
              }}
            >
              <strong>{w.title}</strong>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {w.currency} {w.price.toLocaleString('es-AR')}
                {w.location?.addressText ? ` · ${w.location.addressText}` : ''}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
