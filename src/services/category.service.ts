import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/types';

const CATEGORIES_COLLECTION = 'categories';

function mapCategoryDoc(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: (data.name as string) ?? '',
    slug: (data.slug as string) ?? '',
    isActive: (data.isActive as boolean | undefined) ?? true,
  };
}

/**
 * Obtiene categorías activas. Filtra con where (compatible con reglas de Firestore)
 * y ordena en el cliente para no requerir índice compuesto isActive+name.
 */
export async function getCategories(): Promise<Category[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, CATEGORIES_COLLECTION);
  const q = query(colRef, where('isActive', '==', true));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map((d) => mapCategoryDoc(d.id, d.data()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtiene una categoría por ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return mapCategoryDoc(docSnap.id, docSnap.data());
}

/**
 * Busca categorías activas por nombre
 */
export async function searchCategories(searchQuery: string): Promise<Category[]> {
  const allCategories = await getCategories();

  if (!searchQuery || searchQuery.trim().length === 0) {
    return allCategories;
  }

  const queryLower = searchQuery.toLowerCase().trim();
  return allCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(queryLower) ||
      category.slug.toLowerCase().includes(queryLower)
  );
}
