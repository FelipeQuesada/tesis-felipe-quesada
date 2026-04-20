import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DocumentType, User, UserProfileUpdate, UserRole } from '@/types';
import { calculateAge } from '@/types/user';

const COLLECTION = 'users';

/**
 * Converts Firestore timestamp to Date
 */
function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

/**
 * Converts Firestore document to User type
 */
function docToUser(docId: string, data: any): User {
  // Calcular edad desde birthDate si está disponible
  let age = data.age;
  if (data.birthDate && !age) {
    age = calculateAge(data.birthDate);
  }
  
  return {
    uid: docId,
    displayName: data.displayName ?? null,
    email: data.email ?? '',
    photoURL: data.photoURL ?? null,
    role: data.role ?? 'student',
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    countryId: data.countryId,
    cityId: data.cityId,
    birthDate: data.birthDate,
    age,
    phoneNumber: data.phoneNumber,
    phoneCountryCode: data.phoneCountryCode,
    documentType: data.documentType,
    documentNumber: data.documentNumber,
    interests: data.interests ?? [],
    bio: data.bio,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    isActive: data.isActive ?? true,
  };
}

/**
 * Gets user document by UID
 */
export async function getUserDoc(uid: string): Promise<User | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToUser(docSnap.id, docSnap.data());
}

/**
 * Creates or updates user document
 */
export async function upsertUserDoc(
  uid: string,
  data: {
    email: string;
    displayName?: string | null;
    photoURL?: string | null;
    role?: UserRole;
    username?: string;
    firstName?: string;
    lastName?: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    documentType?: DocumentType;
    documentNumber?: string;
  }
): Promise<User> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  const now = serverTimestamp();
  const baseData = {
    email: data.email,
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    updatedAt: now,
  };

  if (docSnap.exists()) {
    // Update existing - incluir role si se proporciona
    const updateData: Record<string, unknown> = { ...baseData };
    if (data.role !== undefined) {
      updateData.role = data.role;
    }
    if (data.username !== undefined) updateData.username = data.username;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phoneCountryCode !== undefined)
      updateData.phoneCountryCode = data.phoneCountryCode;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.documentType !== undefined) updateData.documentType = data.documentType;
    if (data.documentNumber !== undefined)
      updateData.documentNumber = data.documentNumber;
    await updateDoc(docRef, updateData);
    const updated = await getDoc(docRef);
    return docToUser(updated.id, updated.data());
  } else {
    // Create new
    const newData: Record<string, unknown> = {
      ...baseData,
      role: data.role ?? 'student',
      isActive: true,
      createdAt: now,
    };
    if (data.username !== undefined) newData.username = data.username;
    if (data.firstName !== undefined) newData.firstName = data.firstName;
    if (data.lastName !== undefined) newData.lastName = data.lastName;
    if (data.phoneCountryCode !== undefined)
      newData.phoneCountryCode = data.phoneCountryCode;
    if (data.phoneNumber !== undefined) newData.phoneNumber = data.phoneNumber;
    if (data.documentType !== undefined) newData.documentType = data.documentType;
    if (data.documentNumber !== undefined)
      newData.documentNumber = data.documentNumber;
    await setDoc(docRef, newData);
    const created = await getDoc(docRef);
    return docToUser(created.id, created.data());
  }
}

/**
 * Updates only safe profile fields (displayName, photoURL, countryId, cityId)
 */
export async function updateProfileFields(
  uid: string,
  updates: UserProfileUpdate
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);
  
  // Preparar datos para actualizar
  const updateData: any = { ...updates };
  
  // Si se actualiza birthDate, calcular age automáticamente
  if (updates.birthDate) {
    updateData.age = calculateAge(updates.birthDate);
  }
  
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Lists users (admin only - for small datasets, limit 100)
 */
export async function listUsers(maxCount = 100): Promise<User[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToUser(d.id, d.data()));
}

/**
 * Updates user isActive (admin only)
 */
export async function updateUserIsActive(
  uid: string,
  isActive: boolean
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Updates user role (admin only)
 */
export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}
