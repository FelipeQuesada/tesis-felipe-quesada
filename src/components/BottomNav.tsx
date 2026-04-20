'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const studentNavItems: NavItem[] = [
  {
    href: '/',
    label: 'Inicio',
    icon: (
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
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
  },
  {
    href: '/workshops',
    label: 'Explorar',
    icon: (
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
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
      </svg>
    ),
  },
  {
    href: '/dashboard/my-workshops',
    label: 'Mis Talleres',
    icon: (
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
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
  {
    href: '/dashboard/account',
    label: 'Cuenta',
    icon: (
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

const teacherNavItems: NavItem[] = [
  {
    href: '/teacher/home',
    label: 'Inicio',
    icon: (
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
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
  },
  {
    href: '/teacher/workshops/new',
    label: 'Crear',
    icon: (
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
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    ),
  },
  {
    href: '/teacher/workshops',
    label: 'Mis Talleres',
    icon: (
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
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
  {
    href: '/teacher/account',
    label: 'Cuenta',
    icon: (
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Debug: mostrar información del usuario
  if (user && typeof window !== 'undefined') {
    console.log('BottomNav - Usuario:', user.email, 'Rol:', user.role, 'Loading:', loading);
  }

  // No mostrar BottomNav para administradores
  if (user?.role === 'admin') {
    return null;
  }

  // Seleccionar items según rol
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems;
  
  // Debug: mostrar qué items se están usando
  if (user && typeof window !== 'undefined') {
    console.log('BottomNav - Usando items:', navItems === teacherNavItems ? 'teacherNavItems' : 'studentNavItems');
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href === '/teacher/workshops' && pathname?.startsWith('/teacher/workshops')) ||
          (item.href === '/dashboard/my-workshops' && pathname?.startsWith('/dashboard/my-workshops')) ||
          (item.href === '/dashboard/account' && pathname?.startsWith('/dashboard/account')) ||
          (item.href === '/teacher/account' && pathname?.startsWith('/teacher/account')) ||
          (item.href === '/workshops' && pathname?.startsWith('/workshops')) ||
          (item.href === '/teacher/home' && (pathname === '/teacher/home' || pathname === '/teacher'));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
