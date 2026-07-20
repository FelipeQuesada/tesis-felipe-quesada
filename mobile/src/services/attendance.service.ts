import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Attendance } from '../types';

const COLLECTION = 'attendance';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToAttendance(docId: string, data: Record<string, unknown>): Attendance {
  return {
    id: docId,
    sessionId: (data.sessionId as string) ?? '',
    enrollmentId: (data.enrollmentId as string) ?? '',
    studentId: (data.studentId as string) ?? '',
    workshopId: (data.workshopId as string) ?? '',
    present: Boolean(data.present),
    markedAt: timestampToDate(data.markedAt as Timestamp | undefined),
    markedBy: (data.markedBy as string) ?? '',
  };
}

export async function getAttendanceBySession(
  sessionId: string
): Promise<Attendance[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('sessionId', '==', sessionId));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    docToAttendance(d.id, d.data() as Record<string, unknown>)
  );
}

export async function setAttendance(
  sessionId: string,
  enrollmentId: string,
  studentId: string,
  workshopId: string,
  teacherId: string,
  present: boolean
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const compositeId = `${sessionId}_${enrollmentId}`;
  const docRef = doc(db, COLLECTION, compositeId);
  const docSnap = await getDoc(docRef);

  const data = {
    sessionId,
    enrollmentId,
    studentId,
    workshopId,
    present,
    markedAt: serverTimestamp(),
    markedBy: teacherId,
  };

  if (docSnap.exists()) {
    await updateDoc(docRef, data);
  } else {
    await setDoc(docRef, data);
  }
}
