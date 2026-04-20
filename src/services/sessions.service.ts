import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Session, SessionCreateInput } from '@/types';

const COLLECTION = 'sessions';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToSession(docId: string, data: any): Session {
  return {
    id: docId,
    workshopId: data.workshopId ?? '',
    startAt: timestampToDate(data.startAt),
    endAt: timestampToDate(data.endAt),
    status: data.status ?? 'scheduled',
    capacityOverride: data.capacityOverride,
    stats: data.stats ?? {
      enrolledCount: 0,
    },
  };
}

/**
 * Creates a new session for a workshop
 */
export async function createSession(
  input: SessionCreateInput
): Promise<Session> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);

  const docData = {
    ...input,
    status: 'scheduled' as const,
    stats: {
      enrolledCount: 0,
    },
  };

  const docRef = await addDoc(colRef, docData);
  const docSnap = await getDoc(docRef);
  return docToSession(docSnap.id, docSnap.data());
}

/**
 * Lists sessions by workshop ID
 */
export async function listSessionsByWorkshop(
  workshopId: string
): Promise<Session[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  // Evita índice compuesto (`workshopId + startAt`) y ordena en cliente.
  const q = query(colRef, where('workshopId', '==', workshopId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => docToSession(doc.id, doc.data()))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

/**
 * Gets session by ID
 */
export async function getSessionById(sessionId: string) {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, sessionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToSession(docSnap.id, docSnap.data());
}
