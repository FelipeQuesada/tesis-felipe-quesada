import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Favorite } from '../types';

const COLLECTION = 'favorites';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToFavorite(docId: string, data: Record<string, unknown>): Favorite {
  return {
    id: docId,
    userId: (data.userId as string) ?? '',
    workshopId: (data.workshopId as string) ?? '',
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
  };
}

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
  return docToFavorite(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function removeFavorite(
  userId: string,
  workshopId: string
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const fav = await getFavorite(userId, workshopId);
  if (fav) {
    await deleteDoc(doc(db, COLLECTION, fav.id));
  }
}

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
  return docToFavorite(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>);
}

export async function listUserFavorites(userId: string): Promise<Favorite[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToFavorite(d.id, d.data() as Record<string, unknown>));
}
