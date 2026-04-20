'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface PageHeaderProps {
  title: string;
  /** Forzar campanita aunque no haya usuario (por defecto solo si hay sesión). */
  showNotifications?: boolean;
}

export function PageHeader({ title, showNotifications }: PageHeaderProps) {
  const { user, loading } = useAuth();
  const bell =
    showNotifications !== undefined
      ? showNotifications
      : Boolean(user);

  return (
    <header className="material-header">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 500,
            margin: 0,
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          {title}
        </h1>
        {loading ? null : user ? (
          bell ? (
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label="Notificaciones"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
          ) : null
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Link
              href="/auth/register"
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              Registrarse
            </Link>
            <Link
              href="/auth/login"
              style={{
                padding: '0.5rem 0.75rem',
                background: 'white',
                color: 'var(--primary-green)',
                border: 'none',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
