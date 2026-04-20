'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
  mode?: 'default' | 'brandOnly';
}

export function Navbar({ mode = 'default' }: NavbarProps) {
  const { user, signOut, loading } = useAuth();

  if (mode === 'brandOnly') {
    return (
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link href="/" className="navbar-link">
              <strong>MiTaller</strong>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  if (loading) {
    return (
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link href="/" className="navbar-link">
              <strong>MiTaller</strong>
            </Link>
            <div className="navbar-links">Cargando...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link href="/" className="navbar-link">
            <strong>MiTaller</strong>
          </Link>
          <div className="navbar-links">
            {user ? (
              <>
                <Link href="/dashboard" className="navbar-link">
                  Dashboard
                </Link>
                <Link href={`/profile/${user.uid}`} className="navbar-link">
                  Mi perfil
                </Link>
                {user.role === 'teacher' && (
                  <Link href="/teacher/workshops/new" className="navbar-link">
                    Crear Taller
                  </Link>
                )}
                <span className="navbar-link">
                  {user.displayName || user.email}
                </span>
                <button onClick={signOut} className="btn btn-outline">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="navbar-link">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="btn btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
