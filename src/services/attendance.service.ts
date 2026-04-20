import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Attendance } from '@/types';

const COLLECTION = 'attendance';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToAttendance(docId: string, data: any): Attendance {
  return {
    id: docId,
    sessionId: data.sessionId ?? '',
    enrollmentId: data.enrollmentId ?? '',
    studentId: data.studentId ?? '',
    workshopId: data.workshopId ?? '',
    present: data.present ?? false,
    markedAt: timestampToDate(data.markedAt),
    markedBy: data.markedBy ?? '',
  };
}

/**
 * Get attendance for a session
 */
export async function getAttendanceBySession(
  sessionId: string
): Promise<Attendance[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('sessionId', '==', sessionId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToAttendance(d.id, d.data()));
}

/**
 * Set attendance for an enrollment (teacher only)
 */
export async function setAttendance(
  sessionId: string,
  enrollmentId: string,
  studentId: string,
  workshopId: string,
  teacherId: string,
  present: boolean
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const id = `${sessionId}_${enrollmentId}`;
  const docRef = doc(db, COLLECTION, id);
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
