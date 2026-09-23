'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';

interface AccountMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export default function TeacherAccountPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'teacher')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '80px' }}>
          <div className="loading">Cargando...</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!user || user.role !== 'teacher') {
    return null;
  }

  const menuItems: AccountMenuItem[] = [
    {
      id: 'upcoming',
      label: 'Mis talleres',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      href: '/teacher/workshops',
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
        </svg>
      ),
      href: '#',
    },
    {
      id: 'support',
      label: 'Atención al cliente',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
      href: '#',
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      ),
      onClick: async () => {
        await signOut();
        router.push('/');
      },
    },
  ];

  return (
    <>
      <HomeHeader />
      <main style={{ paddingTop: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '180px' }}>
        <h1 className="section-title" style={{ marginBottom: '2rem' }}>
          Mi Cuenta
        </h1>

        {/* Sección de Perfil */}
        <Link href="/teacher/account/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="material-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#f5f5f5',
              }}
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary-green)',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 600,
                  }}
                >
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.displayName || user.email}
              </h2>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Toca para editar tu perfil
              </p>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </Link>

        {/* Menú de opciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          {menuItems.map((item, index) => {
            const content = (
              <div
                className="material-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                }}
              >
                <div style={{ color: 'var(--text-secondary)' }}>{item.icon}</div>
                <div style={{ flex: 1, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {item.label}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            );

            const isLast = index === menuItems.length - 1;
            const wrapperStyle = isLast ? { marginBottom: '2rem' } : {};

            if (item.onClick) {
              return (
                <div key={item.id} onClick={item.onClick} style={wrapperStyle}>
                  {content}
                </div>
              );
            }

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} style={{ textDecoration: 'none', ...wrapperStyle }}>
                  {content}
                </Link>
              );
            }

            return <div key={item.id} style={wrapperStyle}>{content}</div>;
          })}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

