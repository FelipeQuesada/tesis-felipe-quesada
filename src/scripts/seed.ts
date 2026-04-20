/**
 * Pobla datos mínimos en Firestore con Firebase Admin SDK.
 *
 * Requisitos:
 * - Variable `FIREBASE_SERVICE_ACCOUNT_KEY` en `.env.local` (JSON del service account en una línea).
 *
 * Uso: npm run seed
 */

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

loadEnv({ path: resolve(process.cwd(), '.env.local') });

const CATEGORIES = [
  { id: 'art', name: 'Arte', slug: 'arte', isActive: true },
  { id: 'cooking', name: 'Cocina', slug: 'cocina', isActive: true },
  { id: 'crafts', name: 'Manualidades', slug: 'manualidades', isActive: true },
  { id: 'music', name: 'Música', slug: 'musica', isActive: true },
];

async function main() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key || key.trim() === '') {
    console.error(
      'Falta FIREBASE_SERVICE_ACCOUNT_KEY en .env.local (JSON del service account, una sola línea).'
    );
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(key) as Record<string, unknown>),
    });
  }

  const db = getFirestore();
  const batch = db.batch();
  const now = Timestamp.now();

  for (const c of CATEGORIES) {
    const ref = db.collection('categories').doc(c.id);
    batch.set(
      ref,
      {
        name: c.name,
        slug: c.slug,
        isActive: c.isActive,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log(`Seed OK: ${CATEGORIES.length} categorías (merge) en la colección "categories".`);
  console.log('Para talleres de demo, creá un usuario profesor desde la app y publicá un taller.');
}

main().catch((err) => {
  console.error('Seed falló:', err);
  process.exit(1);
});
