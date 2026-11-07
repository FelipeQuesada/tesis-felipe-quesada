import { Platform } from 'react-native';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateFirebaseEnv, getFirebaseClientConfig } from './env';
import { silenceFirestoreNoise } from './silenceFirestoreNoise';

// Primero: cortar el spam de LogBox del SDK en Expo Go.
silenceFirestoreNoise();

/**
 * Init estilo Advance + ajustes anti-crash en Expo Go:
 * long polling + caché en memoria (sin IndexedDB).
 */

validateFirebaseEnv();
const firebaseConfig = getFirebaseClientConfig();

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

function createAuth(): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require('@firebase/auth/dist/rn/index.js');
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

function createDb(): Firestore {
  if (Platform.OS === 'web') {
    return getFirestore(app);
  }
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache(),
    });
  } catch {
    return getFirestore(app);
  }
}

export const auth = createAuth();
export const db = createDb();
export const storage: FirebaseStorage = getStorage(app);

export function ensureFirebaseClient(): void {
  // Eager init al importar.
}

export function isFirebaseClientReady(): boolean {
  return Boolean(app && auth && db && storage);
}

export function getFirestoreDb(): Firestore {
  return db;
}

export function getAuthClient(): Auth {
  return auth;
}

let warmUpPromise: Promise<void> | null = null;

/** Pausa breve una sola vez; no llamar enableNetwork en loop (regenera Target IDs). */
export function warmUpFirestoreConnection(): Promise<void> {
  if (Platform.OS === 'web') {
    return Promise.resolve();
  }
  if (!warmUpPromise) {
    warmUpPromise = new Promise((resolve) => setTimeout(resolve, 350));
  }
  return warmUpPromise;
}

export { app };
