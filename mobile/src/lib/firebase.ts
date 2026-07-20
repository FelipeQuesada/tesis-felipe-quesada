import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  collection,
  enableNetwork,
  getDocs,
  getFirestore,
  initializeFirestore,
  limit,
  query,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import { validateFirebaseEnv, getFirebaseClientConfig } from './env';

let firestoreInitAttempted = false;

/**
 * En iOS/Android el canal por defecto a veces no responde en 10s (bug conocido SDK + Expo).
 * Long polling + no reutilizar getFirestore() sin esos flags tras hot reload.
 */
function createFirestore(app: FirebaseApp): Firestore {
  if (Platform.OS === 'web') {
    return getFirestore(app);
  }
  if (firestoreInitAttempted) {
    return getFirestore(app);
  }
  firestoreInitAttempted = true;
  return initializeFirestore(app, {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
  });
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

let clientReady = false;
let initErrorLogged = false;

/**
 * Inicializa Firebase una sola vez (Expo / React Native).
 * Misma base que la web; solo cambia el prefijo de variables (EXPO_PUBLIC_*).
 */
export function ensureFirebaseClient(): void {
  if (clientReady) {
    return;
  }

  try {
    validateFirebaseEnv();

    if (getApps().length === 0) {
      app = initializeApp(getFirebaseClientConfig());
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = createFirestore(app);
    storage = getStorage(app);
    clientReady = true;
    initErrorLogged = false;
  } catch (error) {
    if (!initErrorLogged) {
      initErrorLogged = true;
      console.error('Error inicializando Firebase (mobile):', error);
    }
    throw error;
  }
}

export function isFirebaseClientReady(): boolean {
  return clientReady;
}

/** Firestore listo para usar (inicializa Firebase si hace falta). Evita carreras con efectos del layout. */
export function getFirestoreDb(): Firestore {
  ensureFirebaseClient();
  if (!db) {
    throw new Error('Firestore no está inicializado');
  }
  return db;
}

export function getAuthClient(): Auth {
  ensureFirebaseClient();
  if (!auth) {
    throw new Error('Auth no está inicializado');
  }
  return auth;
}

let warmUpPromise: Promise<void> | null = null;

/**
 * Primera conexión en Expo Go suele fallar; un getDocs liviano + enableNetwork ayuda antes de la UI.
 */
export function warmUpFirestoreConnection(): Promise<void> {
  if (Platform.OS === 'web') {
    return Promise.resolve();
  }
  if (!warmUpPromise) {
    warmUpPromise = (async () => {
      ensureFirebaseClient();
      const firestore = getFirestoreDb();
      try {
        await enableNetwork(firestore);
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 500));
      try {
        await getDocs(query(collection(firestore, 'workshops'), limit(1)));
      } catch {
        /* el hook de talleres reintenta */
      }
    })();
  }
  return warmUpPromise;
}

export { app, auth, db, storage };
