import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Enrollment, EnrollmentCreateInput } from '@/types';
import { getSessionById } from './sessions.service';

const COLLECTION = 'enrollments';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToEnrollment(docId: string, data: any): Enrollment {
  return {
    id: docId,
    sessionId: data.sessionId ?? '',
    workshopId: data.workshopId ?? '',
    studentId: data.studentId ?? '',
    teacherId: data.teacherId ?? '',
    status: data.status ?? 'pending_payment',
    createdAt: timestampToDate(data.createdAt),
    paymentId: data.paymentId,
    calendarEventId: data.calendarEventId,
  };
}

/**
 * Check if student already has enrollment for same session or same workshop on same date
 */
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
    if (e.sessionId === sessionId) return true; // Same session
    if (e.workshopId === workshopId) {
      const sess = await getSessionById(e.sessionId);
      if (sess && sess.startAt.toDateString() === targetDate) return true;
    }
  }
  return false;
}

/**
 * Creates a new enrollment with status "pending_payment"
 */
export async function createEnrollment(
  input: EnrollmentCreateInput
): Promise<Enrollment> {
  if (!db) throw new Error('Firestore no está inicializado');

  const session = await getSessionById(input.sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  if (session.workshopId !== input.workshopId)
    throw new Error('La sesión no pertenece a ese taller');

  const isDuplicate = await hasDuplicateEnrollment(
    input.studentId,
    input.sessionId,
    input.workshopId,
    session.startAt
  );
  if (isDuplicate)
    throw new Error(
      'Ya estás inscrito en este taller para esta fecha. Revisa tus inscripciones.'
    );

  const colRef = collection(db, COLLECTION);
  const docData = {
    ...input,
    status: 'pending_payment' as const,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(colRef, docData);
  const docSnap = await getDoc(docRef);
  return docToEnrollment(docSnap.id, docSnap.data());
}

/**
 * Cancels an enrollment (student only, if >= 48h before session)
 */
export async function cancelEnrollment(
  enrollmentId: string,
  studentId: string
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, enrollmentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Inscripción no encontrada');
  const data = docSnap.data();
  if (data.studentId !== studentId) throw new Error('No puedes cancelar esta inscripción');

  const session = await getSessionById(data.sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  const hoursUntil = (session.startAt.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 48)
    throw new Error(
      'Solo puedes cancelar con al menos 48 horas de anticipación'
    );

  await updateDoc(docRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates enrollment to a different session of the same workshop
 */
export async function updateEnrollmentSession(
  enrollmentId: string,
  studentId: string,
  newSessionId: string
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, enrollmentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error('Inscripción no encontrada');
  const data = docSnap.data();
  if (data.studentId !== studentId) throw new Error('No puedes editar esta inscripción');

  const newSession = await getSessionById(newSessionId);
  if (!newSession) throw new Error('Sesión no encontrada');
  if (newSession.workshopId !== data.workshopId)
    throw new Error('La nueva sesión debe ser del mismo taller');

  const isDuplicate = await hasDuplicateEnrollment(
    studentId,
    newSessionId,
    data.workshopId,
    newSession.startAt
  );
  if (isDuplicate)
    throw new Error('Ya tienes una inscripción para esa fecha en este taller');

  await updateDoc(docRef, {
    sessionId: newSessionId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Lists enrollments by student ID
 */
export async function listStudentEnrollments(
  studentId: string
): Promise<Enrollment[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  // Evita índice compuesto (`studentId + createdAt`) y ordena en cliente.
  const q = query(colRef, where('studentId', '==', studentId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => docToEnrollment(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Lists enrollments by teacher ID and workshop ID (optional)
 */
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
    .map((doc) => docToEnrollment(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
