import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Favorite } from '@/types';

const COLLECTION = 'favorites';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToFavorite(docId: string, data: any): Favorite {
  return {
    id: docId,
    userId: data.userId ?? '',
    workshopId: data.workshopId ?? '',
    createdAt: timestampToDate(data.createdAt),
  };
}

/**
 * Adds a workshop to user favorites
 */
export async function addFavorite(
  userId: string,
  workshopId: string
): Promise<Favorite> {
  if (!db) throw new Error('Firestore no está inicializado');

  const existing = await getFavorite(userId, workshopId);
  if (existing) return existing;

  const colRef = collection(db, COLLECTION);
  const docRef = await addDoc(colRef, {
    userId,
    workshopId,
    createdAt: serverTimestamp(),
  });
  const docSnap = await getDoc(docRef);
  return docToFavorite(docSnap.id, docSnap.data());
}

/**
 * Removes a workshop from user favorites
 */
export async function removeFavorite(
  userId: string,
  workshopId: string
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const fav = await getFavorite(userId, workshopId);
  if (fav) {
    const docRef = doc(db, COLLECTION, fav.id);
    await deleteDoc(docRef);
  }
}

/**
 * Checks if user has favorited a workshop
 */
export async function getFavorite(
  userId: string,
  workshopId: string
): Promise<Favorite | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(
    colRef,
    where('userId', '==', userId),
    where('workshopId', '==', workshopId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return docToFavorite(snap.docs[0].id, snap.docs[0].data());
}

/**
 * Lists all favorites for a user (returns Favorite objects with workshopIds)
 */
export async function listUserFavorites(userId: string): Promise<Favorite[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToFavorite(d.id, d.data()));
}
