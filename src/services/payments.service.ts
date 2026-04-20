import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Payment } from '@/types';

const COLLECTION = 'payments';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToPayment(docId: string, data: any): Payment {
  return {
    id: docId,
    enrollmentId: data.enrollmentId ?? '',
    studentId: data.studentId ?? '',
    teacherId: data.teacherId ?? '',
    workshopId: data.workshopId ?? '',
    sessionId: data.sessionId ?? '',
    provider: data.provider ?? 'mercadopago',
    amount: data.amount ?? 0,
    currency: data.currency ?? 'ARS',
    status: data.status ?? 'created',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}

/**
 * Gets payment by ID (readable by student, teacher, admin)
 */
export async function getPaymentById(paymentId: string): Promise<Payment | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, paymentId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToPayment(docSnap.id, docSnap.data());
}

/**
 * Gets payment by enrollment ID
 */
export async function getPaymentByEnrollmentId(
  enrollmentId: string
): Promise<Payment | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('enrollmentId', '==', enrollmentId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return docToPayment(snap.docs[0].id, snap.docs[0].data());
}
