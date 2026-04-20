/**
 * Script para poblar Firestore con categorías de talleres
 * Ejecutar con: npm run populate-categories
 * 
 * IMPORTANTE: Este script requiere que Firebase esté configurado y que tengas
 * permisos de escritura en Firestore.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuración de Firebase (usa las mismas variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB7wIdK2_jWHGO8jxqZ1dKU_PWcLC_ej-E',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mitaller-app.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mitaller-app',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mitaller-app.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '109270054352',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:109270054352:web:0e6c1bc8e2b537c41135d5',
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
