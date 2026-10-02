'use client';

/**
 * Una sola conexión de Firebase en el navegador.
 * Auth, Firestore y Storage salen siempre de esta app, nunca de una instancia vieja.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { validateEnvVars, getFirebaseClientConfig } from './env';

const APP_NAME = 'mitaller';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let clientReady = false;
let initError: string | null = null;
let initErrorLogged = false;

export function ensureFirebaseClient(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (clientReady && app && auth && db && storage) {
    return;
  }

  try {
    validateEnvVars();
    const config = getFirebaseClientConfig();
    const current = getApps().find((item) => item.name === APP_NAME);

    if (current && current.options.apiKey === config.apiKey) {
      app = current;
    } else if (!current) {
      app = initializeApp(config, APP_NAME);
    } else {
      app = initializeApp(config, `${APP_NAME}-actual`);
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    clientReady = true;
    initError = null;
    initErrorLogged = false;
  } catch (error) {
    clientReady = false;
    initError =
      error instanceof Error
        ? error.message
        : 'No se pudo inicializar Firebase';
    if (!initErrorLogged) {
      initErrorLogged = true;
      console.error('Error inicializando Firebase:', error);
    }
  }
}

export function getFirebaseAuth(): Auth {
  ensureFirebaseClient();
  if (!auth) {
    throw new Error(initError || 'Firebase Auth no está inicializado');
  }
  return auth;
}

export function getDb(): Firestore {
  ensureFirebaseClient();
  if (!db) {
    throw new Error(initError || 'Firestore no está inicializado');
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  ensureFirebaseClient();
  if (!storage) {
    throw new Error(initError || 'Firebase Storage no está inicializado');
  }
  return storage;
}

export function isFirebaseClientReady(): boolean {
  return clientReady;
}

export function getFirebaseInitError(): string | null {
  return initError;
}
