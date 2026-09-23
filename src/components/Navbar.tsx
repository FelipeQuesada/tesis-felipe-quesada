'use client';

import { AppHeader } from '@/components/AppHeader';

interface NavbarProps {
  mode?: 'default' | 'brandOnly';
}

export function Navbar({ mode = 'default' }: NavbarProps) {
  return <AppHeader brandOnly={mode === 'brandOnly'} />;
}
