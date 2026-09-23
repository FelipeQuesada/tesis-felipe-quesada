'use client';

import Link from 'next/link';

const LINKS = [
  {
    href: '/workshops',
    label: 'Explorar talleres',
    blob: 'mint',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: '/dashboard/my-workshops',
    label: 'Mis talleres',
    blob: 'sand',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: '/dashboard/my-workshops',
    label: 'Favoritos',
    blob: 'peach',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/blog',
    label: 'Blog',
    blob: 'lilac',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
] as const;

export function HomeQuickLinks() {
  return (
    <nav className="home-quick" aria-label="Accesos rápidos">
      {LINKS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`home-quick-blob home-quick-blob--${item.blob}`}
        >
          <span className="home-quick-blob-bg" aria-hidden />
          <span className="qi">{item.icon}</span>
          <span className="home-quick-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
