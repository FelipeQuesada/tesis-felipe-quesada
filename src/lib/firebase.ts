'use client';

/**
 * Firebase client SDK — solo navegador.
 * Usar `ensureFirebaseClient()` desde `FirebaseClientRoot` antes del resto de la app.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { validateEnvVars, getFirebaseClientConfig } from './env';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

let clientReady = false;
let initError: string | null = null;
/** Evita inundar la consola si algo falla en bucle (p. ej. muchos re-renders). */
let initErrorLogged = false;

/**
 * Idempotente. Ejecutar en el cliente antes de usar auth/db/storage.
 * Tras un fallo se puede volver a llamar (p. ej. login) y se reintenta; no hay bloqueo permanente.
 */
export function ensureFirebaseClient(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (clientReady) {
    return;
  }

  try {
    validateEnvVars();

    if (getApps().length === 0) {
      app = initializeApp(getFirebaseClientConfig());
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    clientReady = true;
    initError = null;
    initErrorLogged = false;
  } catch (error) {
    initError =
      error instanceof Error
        ? error.message
        : 'No se pudo inicializar Firebase';
    if (!initErrorLogged) {
      initErrorLogged = true;
      console.error('Error inicializando Firebase:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
      }
    }
  }
}

export function isFirebaseClientReady(): boolean {
  return clientReady;
}

export function getFirebaseInitError(): string | null {
  return initError;
}

export { app, auth, db, storage };
