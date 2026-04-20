import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type AdminAggregateStats = {
  users: number;
  publishedWorkshops: number;
  enrollments: number;
};

/**
 * Conteos básicos para el panel admin (lecturas completas; válido para MVP).
 */
export async function getAdminAggregateStats(): Promise<AdminAggregateStats> {
  if (!db) throw new Error('Firestore no está inicializado');

  const [usersSnap, workshopsSnap, enrollmentsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(query(collection(db, 'workshops'), where('status', '==', 'published'))),
    getDocs(collection(db, 'enrollments')),
  ]);

  return {
    users: usersSnap.size,
    publishedWorkshops: workshopsSnap.size,
    enrollments: enrollmentsSnap.size,
  };
}
