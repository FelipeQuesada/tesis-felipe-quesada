'use client';

import type { ReactNode } from 'react';
import { useLayoutEffect, useState } from 'react';
import {
  ensureFirebaseClient,
  getFirebaseInitError,
  isFirebaseClientReady,
} from '@/lib/firebase';

/**
 * Inicializa Firebase una vez al montar en el cliente (no en cada render).
 * Si fallan las env vars (típico en Vercel sin configurar), muestra un aviso visible.
 */
export function FirebaseClientRoot({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    ensureFirebaseClient();
    if (!isFirebaseClientReady()) {
      setError(
        getFirebaseInitError() ||
          'Firebase no está configurado. En Vercel agregá las variables NEXT_PUBLIC_FIREBASE_* y hacé Redeploy.'
      );
    } else {
      setError(null);
    }
  }, []);

  return (
    <>
      {error ? (
        <div
          role="alert"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: '#7f1d1d',
            color: '#fff',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            lineHeight: 1.4,
          }}
        >
          <strong>Error de configuración Firebase.</strong> {error}
        </div>
      ) : null}
      {children}
    </>
  );
}
