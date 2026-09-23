'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type NavLink = { href: string; label: string };

const STUDENT_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/workshops', label: 'Explorar' },
  { href: '/dashboard/my-workshops', label: 'Mis talleres' },
  { href: '/blog', label: 'Blog' },
  { href: '/dashboard/account', label: 'Cuenta' },
];

const TEACHER_LINKS: NavLink[] = [
  { href: '/teacher/home', label: 'Inicio' },
  { href: '/teacher/workshops', label: 'Mis talleres' },
  { href: '/teacher/workshops/new', label: 'Crear' },
  { href: '/blog', label: 'Blog' },
  { href: '/teacher/account', label: 'Cuenta' },
];

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/' || href === '/teacher/home') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppHeaderProps {
  /** Compatibilidad con Navbar antiguo; el nav siempre se muestra. */
  brandOnly?: boolean;
}

/**
 * Header unificado web: logo → inicio + nav + acciones.
 * En móvil: nav scrolleable en el header + BottomNav.
 * En desktop: menú centrado.
 */
export function AppHeader(_props: AppHeaderProps = {}) {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const initial =
    (user?.displayName || user?.email || 'U').trim().charAt(0).toUpperCase() || 'U';

  const homeHref =
    user?.role === 'teacher'
      ? '/teacher/home'
      : user?.role === 'admin'
        ? '/admin'
        : '/';

  const links =
    user?.role === 'teacher'
      ? TEACHER_LINKS
      : user?.role === 'admin'
        ? [
            { href: '/admin', label: 'Admin' },
            { href: '/admin/blogs', label: 'Blogs' },
            { href: '/admin/users', label: 'Usuarios' },
            { href: '/', label: 'Sitio' },
          ]
        : STUDENT_LINKS;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href={homeHref} className="home-brand">
          <span className="home-brand-mark" aria-hidden>
            ✦
          </span>
          MiTaller
        </Link>

        <nav className="home-desktop-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={isActivePath(pathname, link.href) ? 'active' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="home-topbar-actions">
          {loading ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Cargando…
            </span>
          ) : user ? (
            <>
              <button type="button" className="home-icon-btn" aria-label="Notificaciones">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="badge-dot" />
              </button>
              <Link
                href={
                  user.role === 'teacher'
                    ? '/teacher/account'
                    : user.role === 'admin'
                      ? '/admin'
                      : '/dashboard/account'
                }
                aria-label="Mi cuenta"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="" className="home-avatar" />
                ) : (
                  <span className="home-avatar-fallback">{initial}</span>
                )}
              </Link>
              <button type="button" className="app-header-logout" onClick={() => void signOut()}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/register" className="home-desktop-only-link">
                Registrarse
              </Link>
              <Link href="/auth/login" className="home-cta" style={{ padding: '0.45rem 0.9rem' }}>
                Entrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
