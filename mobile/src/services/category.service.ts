import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Category } from '../types';

const COLLECTION = 'categories';

function mapDoc(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: (data.name as string) ?? '',
    slug: (data.slug as string) ?? '',
    isActive: (data.isActive as boolean) ?? true,
  };
}

export async function getCategories(): Promise<Category[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  // Solo isActive (sin orderBy): cumple reglas y no pide índice compuesto
  const q = query(colRef, where('isActive', '==', true));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) =>
    mapDoc(d.id, d.data() as Record<string, unknown>)
  );
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}
