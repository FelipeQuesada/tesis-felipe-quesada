import type { UserRole } from '../types';

/** Ruta inicial después de login/registro (alineado con la web). */
export function getHomeHrefForRole(role: UserRole): '/' | '/teacher/home' | '/admin' {
  switch (role) {
    case 'teacher':
      return '/teacher/home';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}
