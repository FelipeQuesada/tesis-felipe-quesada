import type { FirebaseOptions } from 'firebase/app';

const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

type PublicEnvKey = (typeof requiredEnvVars)[number];

export function getPublicFirebaseEnvVar(name: PublicEnvKey): string {
  const raw = process.env[name];
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : '';
}

export function validateFirebaseEnv(): void {
  const missing: PublicEnvKey[] = [];
  for (const key of requiredEnvVars) {
    if (getPublicFirebaseEnvVar(key) === '') {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      'Faltan variables de entorno en mobile/.env:\n' +
        missing.join('\n') +
        '\n\nCopiá los mismos valores que en la web, pero con prefijo EXPO_PUBLIC_ (ver mobile/.env.example). Reiniciá Expo después de guardar.'
    );
  }
}

export function getFirebaseClientConfig(): FirebaseOptions {
  return {
    apiKey: getPublicFirebaseEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getPublicFirebaseEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getPublicFirebaseEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getPublicFirebaseEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getPublicFirebaseEnvVar(
      'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
    ),
    appId: getPublicFirebaseEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
  };
}
