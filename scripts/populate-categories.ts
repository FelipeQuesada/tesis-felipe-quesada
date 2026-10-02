/**
 * Script para poblar Firestore con categorías de talleres
 * Ejecutar con: npm run populate-categories
 * 
 * IMPORTANTE: Este script requiere que Firebase esté configurado y que tengas
 * permisos de escritura en Firestore.
 */

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

loadEnv({ path: resolve(process.cwd(), '.env.local') });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta ${name} en .env.local`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: required('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: required('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: required('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// Categorías principales de talleres
const CATEGORIES = [
  { id: 'pintura', name: 'Pintura', slug: 'pintura' },
  { id: 'ceramica', name: 'Cerámica', slug: 'ceramica' },
  { id: 'musica', name: 'Música', slug: 'musica' },
  { id: 'resina', name: 'Resina', slug: 'resina' },
  { id: 'manualidades', name: 'Manualidades', slug: 'manualidades' },
  { id: 'cocina', name: 'Cocina', slug: 'cocina' },
  { id: 'fotografia', name: 'Fotografía', slug: 'fotografia' },
  { id: 'dibujo', name: 'Dibujo', slug: 'dibujo' },
  { id: 'escultura', name: 'Escultura', slug: 'escultura' },
  { id: 'tejido', name: 'Tejido', slug: 'tejido' },
  { id: 'bordado', name: 'Bordado', slug: 'bordado' },
  { id: 'jardineria', name: 'Jardinería', slug: 'jardineria' },
  { id: 'carpinteria', name: 'Carpintería', slug: 'carpinteria' },
  { id: 'costura', name: 'Costura', slug: 'costura' },
  { id: 'origami', name: 'Origami', slug: 'origami' },
];

async function populateCategories() {
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('📚 Poblando categorías...');
    
    let categoryCount = 0;
    for (const category of CATEGORIES) {
      const categoryRef = doc(db, 'categories', category.id);
      await setDoc(categoryRef, {
        name: category.name,
        slug: category.slug,
        isActive: true,
      });
      categoryCount++;
      console.log(`✅ Categoría agregada: ${category.name}`);
    }

    console.log(`\n✨ ¡Completado! Se agregaron ${categoryCount} categorías.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando categorías:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  populateCategories();
}

export { populateCategories };
