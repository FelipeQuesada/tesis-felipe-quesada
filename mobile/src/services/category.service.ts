import {
  collection,
  getDocs,
  orderBy,
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

  try {
    const q = query(
      colRef,
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      mapDoc(d.id, d.data() as Record<string, unknown>)
    );
  } catch {
    try {
      const q2 = query(colRef, where('isActive', '==', true));
      const snap2 = await getDocs(q2);
      const list = snap2.docs.map((d) =>
        mapDoc(d.id, d.data() as Record<string, unknown>)
      );
      list.sort((a, b) => a.name.localeCompare(b.name));
      return list;
    } catch {
      const snap3 = await getDocs(colRef);
      const all = snap3.docs.map((d) =>
        mapDoc(d.id, d.data() as Record<string, unknown>)
      );
      return all
        .filter((c) => c.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }
}
