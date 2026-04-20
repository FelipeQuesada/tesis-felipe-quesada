/**
 * Firebase Admin SDK - server-side only.
 * Used by API routes (webhooks) to write to Firestore with admin privileges.
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0] as App;
  }
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is required for server-side Firebase operations');
  }
  app = initializeApp({
    credential: cert(JSON.parse(key)),
  });
  return app;
}

export function getAdminDb() {
  getAdminApp();
  return getFirestore();
}

export async function verifyIdToken(token: string) {
  const auth = getAuth(getAdminApp());
  return auth.verifyIdToken(token);
}
