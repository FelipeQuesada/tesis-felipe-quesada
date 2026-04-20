'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function HomeHeader() {
  const { user, loading } = useAuth();
  
  // Obtener el nombre del usuario si está logueado
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  
  // Debug: mostrar rol en consola
  if (user && typeof window !== 'undefined') {
    console.log('HomeHeader - Usuario:', user.email, 'Rol:', user.role);
  }

  return (
    <header className="material-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                position: 'relative',
                width: '37px',
                height: '37px',
                flexShrink: 0,
              }}
            >
              <Image
                src="/images/saludo.png"
                alt="Saludo"
                fill
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>
              Cargando...
            </h1>
          </div>
        ) : user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  position: 'relative',
                  width: '37px',
                  height: '37px',
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/saludo.png"
                  alt="Saludo"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 500, margin: 0 }}>
                Hola {userName}
              </h1>
            </div>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  position: 'relative',
                  width: '37px',
                  height: '37px',
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/images/saludo.png"
                  alt="Saludo"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link
                href="/auth/register"
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                Registrarse
              </Link>
              <Link
                href="/auth/login"
                style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  color: 'var(--primary-green)',
                  border: 'none',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Iniciar sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
