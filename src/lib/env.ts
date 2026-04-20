'use client';

/**
 * Validates required environment variables and throws clear errors if missing.
 */

import type { FirebaseOptions } from 'firebase/app';

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

type PublicEnvKey = (typeof requiredEnvVars)[number];

/**
 * En desarrollo, algunos bundlers no inyectan NEXT_PUBLIC_* en el chunk del cliente
 * aunque existan en `.env.local` y en `next.config.js`. Fallback solo para `NODE_ENV === 'development'`.
 * En producción no hay fallback: las vars deben estar definidas en el build.
 */
const DEV_PUBLIC_FIREBASE_FALLBACK: Record<PublicEnvKey, string> | null =
  process.env.NODE_ENV === 'development'
    ? {
        NEXT_PUBLIC_FIREBASE_API_KEY:
          'AIzaSyB7wIdK2_jWHGO8jxqZ1dKU_PWcLC_ej-E',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mitaller-app.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mitaller-app',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'mitaller-app.firebasestorage.app',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '109270054352',
        NEXT_PUBLIC_FIREBASE_APP_ID:
          '1:109270054352:web:0e6c1bc8e2b537c41135d5',
      }
    : null;

export function getPublicFirebaseEnvVar(name: PublicEnvKey): string {
  const raw = process.env[name];
  if (raw && raw.trim() !== '') {
    return raw.trim();
  }
  if (DEV_PUBLIC_FIREBASE_FALLBACK?.[name]) {
    return DEV_PUBLIC_FIREBASE_FALLBACK[name];
  }
  return '';
}

export function validateEnvVars(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const missing: PublicEnvKey[] = [];

  for (const envVar of requiredEnvVars) {
    if (getPublicFirebaseEnvVar(envVar) === '') {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias:\n${missing.join('\n')}\n\n` +
        'Crea o completa `.env.local` en la raíz del proyecto (ver README.md). Reiniciá el servidor de desarrollo.'
    );
  }
}

/**
 * Config en tiempo de ejecución en el cliente (después de validar).
 */
export function getFirebaseClientConfig(): FirebaseOptions {
  return {
    apiKey: getPublicFirebaseEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getPublicFirebaseEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getPublicFirebaseEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getPublicFirebaseEnvVar(
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
    ),
    messagingSenderId: getPublicFirebaseEnvVar(
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
    ),
    appId: getPublicFirebaseEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  };
}
