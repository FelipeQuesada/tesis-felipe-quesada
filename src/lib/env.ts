'use client';

/**
 * Variables Firebase del cliente.
 * IMPORTANTE: Next solo inyecta `NEXT_PUBLIC_*` con acceso literal
 * (`process.env.NEXT_PUBLIC_FOO`). `process.env[name]` queda vacío en el browser.
 *
 * Los defaults coinciden con next.config.js (config web pública de mitaller-app).
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

const FIREBASE_PUBLIC_DEFAULTS: Record<PublicEnvKey, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyB7wIdK2_jWHG08jxqZ1dKU_PWcLC_ej-E',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'mitaller-app.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'mitaller-app',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'mitaller-app.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '109270054352',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:109270054352:web:0e6c1bc8e2b537c41135d5',
};

/** Lecturas literales para que el bundler las reemplace en build (Vercel / next build). */
const PUBLIC_FIREBASE_ENV: Record<PublicEnvKey, string | undefined> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getPublicFirebaseEnvVar(name: PublicEnvKey): string {
  const raw = PUBLIC_FIREBASE_ENV[name];
  if (raw && raw.trim() !== '') {
    return raw.trim();
  }
  return FIREBASE_PUBLIC_DEFAULTS[name];
}

export function validateEnvVars(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const missing = requiredEnvVars.filter(
    (envVar) => getPublicFirebaseEnvVar(envVar) === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias:\n${missing.join('\n')}\n\n` +
        'Local: completá `.env.local` y reiniciá `npm run dev`.\n' +
        'Vercel: Settings → Environment Variables (tipo Config) → Redeploy.'
    );
  }
}

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
