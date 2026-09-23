'use client';

import { AppHeader } from '@/components/AppHeader';

interface PageHeaderProps {
  title?: string;
  showNotifications?: boolean;
}

/** Header de página: misma nav global (el title se ignora a favor del menú unificado). */
export function PageHeader(_props: PageHeaderProps) {
  return <AppHeader />;
}
