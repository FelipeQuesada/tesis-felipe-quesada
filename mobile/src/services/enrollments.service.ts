import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Enrollment, EnrollmentCreateInput } from '../types';
import { getSessionById } from './sessions.service';

const COLLECTION = 'enrollments';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToEnrollment(
  docId: string,
  data: Record<string, unknown>
): Enrollment {
  return {
    id: docId,
    sessionId: (data.sessionId as string) ?? '',
    workshopId: (data.workshopId as string) ?? '',
    studentId: (data.studentId as string) ?? '',
    teacherId: (data.teacherId as string) ?? '',
    status: (data.status as Enrollment['status']) ?? 'pending_payment',
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
    paymentId: data.paymentId as string | undefined,
    calendarEventId: data.calendarEventId as string | undefined,
  };
}

async function hasDuplicateEnrollment(
  studentId: string,
  sessionId: string,
  workshopId: string,
  sessionStartAt: Date
): Promise<boolean> {
  const existing = await listStudentEnrollments(studentId);
  const targetDate = sessionStartAt.toDateString();

  for (const e of existing) {
    if (e.status === 'cancelled' || e.status === 'refunded') continue;
    if (e.sessionId === sessionId) return true;
    if (e.workshopId === workshopId) {
      const sess = await getSessionById(e.sessionId);
      if (sess && sess.startAt.toDateString() === targetDate) return true;
    }
  }
  return false;
}

export async function createEnrollment(
  input: EnrollmentCreateInput
): Promise<Enrollment> {
  if (!db) throw new Error('Firestore no está inicializado');

  const session = await getSessionById(input.sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  if (session.workshopId !== input.workshopId) {
    throw new Error('La sesión no pertenece a ese taller');
  }

  const isDuplicate = await hasDuplicateEnrollment(
    input.studentId,
    input.sessionId,
    input.workshopId,
    session.startAt
  );
  if (isDuplicate) {
    throw new Error(
      'Ya estás inscrito en este taller para esta fecha. Revisa tus inscripciones.'
    );
  }

  const colRef = collection(db, COLLECTION);
  const docData = {
    ...input,
    status: 'pending_payment' as const,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(colRef, docData);
  const docSnap = await getDoc(docRef);
  return docToEnrollment(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function listStudentEnrollments(
  studentId: string
): Promise<Enrollment[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('studentId', '==', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((d) => docToEnrollment(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listTeacherEnrollmentsByWorkshop(
  teacherId: string,
  workshopId?: string
): Promise<Enrollment[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  let q = query(colRef, where('teacherId', '==', teacherId));
  if (workshopId) {
    q = query(q, where('workshopId', '==', workshopId));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((d) => docToEnrollment(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
