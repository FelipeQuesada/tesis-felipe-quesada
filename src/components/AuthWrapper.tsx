'use client';

import { RoleRedirect } from './RoleRedirect';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoleRedirect />
      {children}
    </>
  );
}
