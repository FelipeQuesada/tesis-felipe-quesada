'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  if (user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin/stats" className={`navbar-link ${pathname?.includes('/stats') ? 'active' : ''}`}>
            Estadísticas
          </Link>
          <Link href="/admin/users" className={`navbar-link ${pathname?.includes('/users') ? 'active' : ''}`}>
            Usuarios
          </Link>
          <Link href="/admin/workshops" className={`navbar-link ${pathname?.includes('/workshops') ? 'active' : ''}`}>
            Talleres
          </Link>
        </div>
        {children}
      </main>
    </>
  );
}
