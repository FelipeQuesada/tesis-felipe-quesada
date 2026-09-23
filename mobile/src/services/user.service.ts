import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { DocumentType, User, UserProfileUpdate, UserRole } from '../types';
import { calculateAge } from '../types/user';

const COLLECTION = 'users';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToUser(docId: string, data: Record<string, unknown>): User {
  let age = data.age as number | undefined;
  const birthDate = data.birthDate as string | undefined;
  if (birthDate && age === undefined) {
    age = calculateAge(birthDate);
  }

  return {
    uid: docId,
    displayName: (data.displayName as string | null) ?? null,
    email: (data.email as string) ?? '',
    photoURL: (data.photoURL as string | null) ?? null,
    role: (data.role as UserRole) ?? 'student',
    username: data.username as string | undefined,
    firstName: data.firstName as string | undefined,
    lastName: data.lastName as string | undefined,
    gender: data.gender as User['gender'],
    countryId: data.countryId as string | undefined,
    cityId: data.cityId as string | undefined,
    birthDate,
    age,
    phoneNumber: data.phoneNumber as string | undefined,
    phoneCountryCode: data.phoneCountryCode as string | undefined,
    documentType: data.documentType as DocumentType | undefined,
    documentNumber: data.documentNumber as string | undefined,
    interests: (data.interests as string[]) ?? [],
    bio: data.bio as string | undefined,
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
    updatedAt: timestampToDate(data.updatedAt as Timestamp | undefined),
    isActive: (data.isActive as boolean) ?? true,
  };
}

export async function getUserDoc(uid: string): Promise<User | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToUser(docSnap.id, docSnap.data() as Record<string, unknown>);
}

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
    const updateData: Record<string, unknown> = { ...baseData };
    if (data.role !== undefined) updateData.role = data.role;
    if (data.username !== undefined) updateData.username = data.username;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phoneCountryCode !== undefined) {
      updateData.phoneCountryCode = data.phoneCountryCode;
    }
    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber;
    }
    if (data.documentType !== undefined) {
      updateData.documentType = data.documentType;
    }
    if (data.documentNumber !== undefined) {
      updateData.documentNumber = data.documentNumber;
    }
    await updateDoc(docRef, updateData);
    const updated = await getDoc(docRef);
    return docToUser(updated.id, updated.data() as Record<string, unknown>);
  }

  const newData: Record<string, unknown> = {
    ...baseData,
    role: data.role ?? 'student',
    isActive: true,
    createdAt: now,
  };
  if (data.username !== undefined) newData.username = data.username;
  if (data.firstName !== undefined) newData.firstName = data.firstName;
  if (data.lastName !== undefined) newData.lastName = data.lastName;
  if (data.phoneCountryCode !== undefined) {
    newData.phoneCountryCode = data.phoneCountryCode;
  }
  if (data.phoneNumber !== undefined) newData.phoneNumber = data.phoneNumber;
  if (data.documentType !== undefined) {
    newData.documentType = data.documentType;
  }
  if (data.documentNumber !== undefined) {
    newData.documentNumber = data.documentNumber;
  }
  await setDoc(docRef, newData);
  const created = await getDoc(docRef);
  return docToUser(created.id, created.data() as Record<string, unknown>);
}

export async function updateProfileFields(
  uid: string,
  updates: UserProfileUpdate
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, uid);

  const payload: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined) {
      payload[key] = val;
    }
  }

  if (updates.gender === null) {
    payload.gender = deleteField();
  }

  if (updates.birthDate?.trim()) {
    const age = calculateAge(updates.birthDate.trim());
    if (Number.isFinite(age)) {
      payload.age = age;
    }
  }

  await updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function listUsers(maxCount = 100): Promise<User[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    docToUser(d.id, d.data() as Record<string, unknown>)
  );
}
