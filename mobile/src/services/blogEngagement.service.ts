import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BlogComment } from '../types';

const LIKES_COLLECTION = 'blogLikes';
const COMMENTS_COLLECTION = 'blogComments';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function makeLikeDocId(blogId: string, userId: string): string {
  return `${blogId}_${userId}`;
}

function docToComment(docId: string, data: Record<string, unknown>): BlogComment {
  return {
    id: docId,
    blogId: (data.blogId as string) ?? '',
    userId: (data.userId as string) ?? '',
    userDisplayName: (data.userDisplayName as string) ?? 'Usuario',
    text: (data.text as string) ?? '',
    createdAt: timestampToDate(data.createdAt as Timestamp | Date | null | undefined),
  };
}

export async function getBlogLikesCount(blogId: string): Promise<number> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, LIKES_COLLECTION);
  const q = query(colRef, where('blogId', '==', blogId));
  const snap = await getDocs(q);
  return snap.size;
}

export async function isBlogLikedByUser(
  blogId: string,
  userId: string
): Promise<boolean> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, LIKES_COLLECTION);
  const q = query(
    colRef,
    where('blogId', '==', blogId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function toggleBlogLike(
  blogId: string,
  userId: string
): Promise<boolean> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, LIKES_COLLECTION);
  const existing = await getDocs(
    query(colRef, where('blogId', '==', blogId), where('userId', '==', userId))
  );
  if (!existing.empty) {
    await deleteDoc(existing.docs[0].ref);
    return false;
  }
  const likeRef = doc(db, LIKES_COLLECTION, makeLikeDocId(blogId, userId));
  await setDoc(likeRef, {
    blogId,
    userId,
    createdAt: serverTimestamp(),
  });
  return true;
}

export async function listBlogComments(blogId: string): Promise<BlogComment[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COMMENTS_COLLECTION);
  const q = query(colRef, where('blogId', '==', blogId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => docToComment(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function addBlogComment(input: {
  blogId: string;
  userId: string;
  userDisplayName: string;
  text: string;
}): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const cleanedText = input.text.trim();
  if (cleanedText.length < 2) {
    throw new Error('El comentario es demasiado corto.');
  }
  if (cleanedText.length > 1000) {
    throw new Error('El comentario es demasiado largo.');
  }

  const colRef = collection(db, COMMENTS_COLLECTION);
  await addDoc(colRef, {
    blogId: input.blogId,
    userId: input.userId,
    userDisplayName: input.userDisplayName.trim() || 'Usuario',
    text: cleanedText,
    createdAt: serverTimestamp(),
  });
}
