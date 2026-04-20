import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/types';

const CATEGORIES_COLLECTION = 'categories';

/**
 * Obtiene todas las categorías activas ordenadas por nombre
 */
export async function getCategories(): Promise<Category[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, CATEGORIES_COLLECTION);
  
  console.log('🔍 Cargando categorías desde Firestore...');
  
  try {
    // Intentar primero con filtro de isActive y orderBy (requiere índice compuesto)
    const q = query(
      colRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    console.log('✅ Categorías encontradas con filtro isActive:', querySnapshot.size);
    
    if (querySnapshot.size > 0) {
      const categories = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? '',
          slug: data.slug ?? '',
          isActive: data.isActive ?? true,
        };
      });
      console.log('📋 Primeras 5 categorías:', categories.slice(0, 5));
      return categories;
    }
    
    // Si no hay resultados con el filtro, intentar sin filtro
    console.log('⚠️ No se encontraron categorías con filtro isActive, intentando sin filtro...');
    const qWithoutFilter = query(colRef, orderBy('name', 'asc'));
    const querySnapshot2 = await getDocs(qWithoutFilter);
    
    console.log('✅ Categorías encontradas sin filtro:', querySnapshot2.size);
    
    const allCategories = querySnapshot2.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? '',
        slug: data.slug ?? '',
        isActive: data.isActive ?? true,
      };
    });
    
    // Filtrar activas en el cliente si es necesario
    const activeCategories = allCategories.filter((cat) => cat.isActive !== false);
    console.log('📋 Categorías activas (filtradas en cliente):', activeCategories.length);
    return activeCategories;
    
  } catch (error: any) {
    console.error('❌ Error cargando categorías:', error);
    
    // Si el error es por índice faltante, intentar sin orderBy
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.log('⚠️ Error de índice, intentando sin orderBy...');
      try {
        const qSimple = query(colRef, where('isActive', '==', true));
        const querySnapshot = await getDocs(qSimple);
        const categories = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name ?? '',
            slug: data.slug ?? '',
            isActive: data.isActive ?? true,
          };
        });
        // Ordenar en el cliente
        categories.sort((a, b) => a.name.localeCompare(b.name));
        console.log('✅ Categorías cargadas sin orderBy:', categories.length);
        return categories;
      } catch (error2) {
        console.error('❌ Error también sin orderBy:', error2);
      }
    }
    
    // Último intento: traer todas sin filtros
    try {
      console.log('⚠️ Intentando cargar todas las categorías sin filtros...');
      const querySnapshot = await getDocs(colRef);
      const categories = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? '',
          slug: data.slug ?? '',
          isActive: data.isActive ?? true,
        };
      });
      categories.sort((a, b) => a.name.localeCompare(b.name));
      console.log('✅ Categorías cargadas (todas):', categories.length);
      return categories;
    } catch (finalError) {
      console.error('❌ Error final cargando categorías:', finalError);
      throw finalError;
    }
  }
}

/**
 * Obtiene una categoría por su ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name ?? '',
    slug: data.slug ?? '',
    isActive: data.isActive ?? true,
  };
}

/**
 * Busca categorías activas por nombre
 */
export async function searchCategories(searchQuery: string): Promise<Category[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, CATEGORIES_COLLECTION);
  
  let allCategories: Category[] = [];
  
  try {
    // Intentar con filtro de isActive primero
    const q = query(
      colRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);
    allCategories = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? '',
        slug: data.slug ?? '',
        isActive: data.isActive ?? true,
      };
    });
  } catch (error: any) {
    // Si falla (falta índice o campo), intentar sin filtro
    console.log('⚠️ Error con filtro isActive, intentando sin filtro...');
    try {
      const q = query(colRef, orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      allCategories = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name ?? '',
            slug: data.slug ?? '',
            isActive: data.isActive ?? true,
          };
        })
        .filter((cat) => cat.isActive !== false); // Filtrar activas en el cliente
    } catch (error2) {
      // Si también falla, traer todas sin orderBy
      const querySnapshot = await getDocs(colRef);
      allCategories = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? '',
          slug: data.slug ?? '',
          isActive: data.isActive ?? true,
        };
      });
      allCategories.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  
  if (!searchQuery || searchQuery.trim().length === 0) {
    return allCategories;
  }
  
  const queryLower = searchQuery.toLowerCase().trim();
  return allCategories.filter((category) =>
    category.name.toLowerCase().includes(queryLower) ||
    category.slug.toLowerCase().includes(queryLower)
  );
}
