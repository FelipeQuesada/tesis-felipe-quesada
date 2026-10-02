import type { FirebaseOptions } from 'firebase/app';

/**
 * Expo solo inyecta EXPO_PUBLIC_* si se leen de forma literal
 * (`process.env.EXPO_PUBLIC_FOO`). `process.env[nombre]` puede quedar
 * con una clave vieja o vacía y Google responde 400.
 */
const PUBLIC_FIREBASE_ENV = {
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
} as const;

type PublicEnvKey = keyof typeof PUBLIC_FIREBASE_ENV;

function readEnv(name: PublicEnvKey): string {
  const raw = PUBLIC_FIREBASE_ENV[name];
  return typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : '';
}

export function validateFirebaseEnv(): void {
  const missing = (Object.keys(PUBLIC_FIREBASE_ENV) as PublicEnvKey[]).filter(
    (key) => readEnv(key) === ''
  );
  if (missing.length > 0) {
    throw new Error(
      'Faltan variables de entorno en mobile/.env:\n' +
        missing.join('\n') +
        '\n\nUsá los mismos valores que en la web, con prefijo EXPO_PUBLIC_. Después reiniciá Expo con caché limpia: npx expo start -c'
    );
  }
}

export function getFirebaseClientConfig(): FirebaseOptions {
  return {
    apiKey: readEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
    authDomain: readEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: readEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: readEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  };
}
