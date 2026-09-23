'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Ruta legacy: el dashboard ya no se usa; todo va al inicio. */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

