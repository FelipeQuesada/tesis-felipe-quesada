'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Componente que redirige automáticamente según el rol del usuario
 * Se debe incluir en el layout principal
 */
export function RoleRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Si no hay usuario, no hacer nada
    if (!user) return;

    // Debug: mostrar el rol del usuario
    console.log('RoleRedirect - Usuario:', user.email, 'Rol:', user.role, 'Pathname:', pathname);

    // Si es profesor y no está en una ruta de profesor, redirigir
    // Pero permitir acceso a rutas compartidas
    if (
      user.role === 'teacher' &&
      !pathname?.startsWith('/teacher') &&
      !pathname?.startsWith('/auth') &&
      !pathname?.startsWith('/dashboard/account') &&
      !pathname?.startsWith('/teacher/account') &&
      !pathname?.startsWith('/workshops') &&
      !pathname?.startsWith('/blog')
    ) {
      console.log('Redirigiendo profesor a /teacher/home');
      router.push('/teacher/home');
      return;
    }

    // Si es administrador y no está en una ruta de admin, redirigir
    // Pero permitir acceso a rutas compartidas como /dashboard/account
    if (
      user.role === 'admin' &&
      !pathname?.startsWith('/admin') &&
      !pathname?.startsWith('/auth') &&
      !pathname?.startsWith('/dashboard/account')
    ) {
      console.log('Redirigiendo admin a /admin');
      router.push('/admin');
      return;
    }

    // Si es estudiante y está en una ruta de profesor/admin, redirigir
    if (user.role === 'student' && (pathname?.startsWith('/teacher') || pathname?.startsWith('/admin'))) {
      console.log('Redirigiendo estudiante a /');
      router.push('/');
      return;
    }
  }, [user, loading, pathname, router]);

  return null;
}
