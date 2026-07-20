import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Session, SessionCreateInput, SessionStatus } from '../types';

const COLLECTION = 'sessions';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToSession(
  docId: string,
  data: Record<string, unknown>
): Session {
  const statsRaw = data.stats as Session['stats'] | undefined;
  return {
    id: docId,
    workshopId: (data.workshopId as string) ?? '',
    startAt: timestampToDate(data.startAt as Timestamp | undefined),
    endAt: timestampToDate(data.endAt as Timestamp | undefined),
    status: (data.status as SessionStatus) ?? 'scheduled',
    capacityOverride: data.capacityOverride as number | undefined,
    stats: statsRaw ?? { enrolledCount: 0 },
  };
}

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
  return docToSession(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function listSessionsByWorkshop(
  workshopId: string
): Promise<Session[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('workshopId', '==', workshopId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((d) => docToSession(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export async function getSessionById(
  sessionId: string
): Promise<Session | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, sessionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToSession(docSnap.id, docSnap.data() as Record<string, unknown>);
}
