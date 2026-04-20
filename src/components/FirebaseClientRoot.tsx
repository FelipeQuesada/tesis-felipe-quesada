'use client';

import type { ReactNode } from 'react';
import { useLayoutEffect } from 'react';
import { ensureFirebaseClient } from '@/lib/firebase';

/**
 * Inicializa Firebase una vez al montar en el cliente (no en cada render).
 */
export function FirebaseClientRoot({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    ensureFirebaseClient();
  }, []);

  return <>{children}</>;
}
