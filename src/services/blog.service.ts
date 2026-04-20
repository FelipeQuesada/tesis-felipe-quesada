import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  getHardcodedPublishedBlogPostById,
  mergeFeaturedHardcodedWithRemote,
} from '@/data/hardcodedBlogPosts';
import type { BlogPost, BlogPostCreateInput, BlogPostStatus } from '@/types';

const COLLECTION = 'blogs';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToBlogPost(docId: string, data: any): BlogPost {
  return {
    id: docId,
    title: data.title ?? '',
    slug: data.slug ?? '',
    content: data.content ?? '',
    excerpt: data.excerpt,
    coverImageUrl: data.coverImageUrl,
    authorId: data.authorId ?? '',
    authorName: data.authorName,
    status: data.status ?? 'draft',
    categoryIds: data.categoryIds ?? [],
    createdAt: timestampToDate(data.createdAt),
    updatedAt: data.updatedAt ? timestampToDate(data.updatedAt) : undefined,
    publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : undefined,
  };
}

/**
 * Creates a new blog post
 */
export async function createBlogPost(
  authorId: string,
  input: BlogPostCreateInput
): Promise<BlogPost> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const now = serverTimestamp();

  const status = input.status ?? 'draft';
  const docData: Record<string, unknown> = {
    ...input,
    authorId,
    authorName: input.authorName,
    status,
    categoryIds: input.categoryIds ?? [],
    createdAt: now,
    updatedAt: now,
  };
  if (status === 'published') {
    docData.publishedAt = now;
  }

  const docRef = await addDoc(colRef, docData);
  const docSnap = await getDoc(docRef);
  return docToBlogPost(docSnap.id, docSnap.data());
}

/**
 * Updates a blog post
 */
export async function updateBlogPost(
  blogId: string,
  input: Partial<BlogPostCreateInput>
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, blogId);
  const now = serverTimestamp();
  const payload: Record<string, unknown> = {
    ...input,
    updatedAt: now,
  };
  if (input.status === 'published') {
    payload.publishedAt = now;
  }
  await updateDoc(docRef, payload);
}

/**
 * Publishes a blog post
 */
export async function publishBlogPost(blogId: string): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, blogId);
  await updateDoc(docRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Unpublishes a blog post
 */
export async function unpublishBlogPost(blogId: string): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, blogId);
  await updateDoc(docRef, {
    status: 'draft',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a blog post
 */
export async function deleteBlogPost(blogId: string): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, blogId);
  await deleteDoc(docRef);
}

/**
 * Gets blog post by ID
 */
export async function getBlogPostById(blogId: string): Promise<BlogPost | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, blogId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToBlogPost(docSnap.id, docSnap.data());
}

/**
 * Solo posts publicados (para rutas públicas).
 */
export async function getPublishedBlogPostById(blogId: string): Promise<BlogPost | null> {
  const hardcoded = getHardcodedPublishedBlogPostById(blogId);
  if (hardcoded) {
    return hardcoded;
  }
  const post = await getBlogPostById(blogId);
  if (!post || post.status !== 'published') {
    return null;
  }
  return post;
}

/**
 * Gets blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('slug', '==', slug));

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const published = querySnapshot.docs
    .map((d) => docToBlogPost(d.id, d.data()))
    .find((post) => post.status === 'published');
  return published ?? null;
}

/**
 * Lists all published blog posts
 */
export async function listPublishedBlogPosts(): Promise<BlogPost[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  // Sin orderBy compuesto: evita índice `status + publishedAt` y ordena en cliente
  const q = query(colRef, where('status', '==', 'published'));

  const querySnapshot = await getDocs(q);
  const remote = querySnapshot.docs
    .map((docSnap) => docToBlogPost(docSnap.id, docSnap.data()))
    .sort((a, b) => {
      const tb = b.publishedAt?.getTime() ?? b.createdAt.getTime();
      const ta = a.publishedAt?.getTime() ?? a.createdAt.getTime();
      return tb - ta;
    });
  return mergeFeaturedHardcodedWithRemote(remote);
}

/**
 * Lists all blog posts (for admin)
 */
export async function listAllBlogPosts(): Promise<BlogPost[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => docToBlogPost(doc.id, doc.data()));
}

/**
 * Lists blog posts by category IDs
 */
export async function listBlogPostsByCategories(
  categoryIds: string[]
): Promise<BlogPost[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  if (categoryIds.length === 0) return [];

  const colRef = collection(db, COLLECTION);
  // Firestore no soporta array-contains-any directamente, así que hacemos múltiples queries
  // Para simplificar, usamos array-contains con el primer categoryId
  // En producción, se podría usar un índice compuesto o una estructura diferente
  const q = query(
    colRef,
    where('categoryIds', 'array-contains', categoryIds[0]),
    where('status', '==', 'published')
  );

  const querySnapshot = await getDocs(q);
  const allPosts = querySnapshot.docs.map((doc) => docToBlogPost(doc.id, doc.data()));

  return allPosts
    .filter((post) => post.categoryIds.some((id) => categoryIds.includes(id)))
    .sort((a, b) => {
      const tb = b.publishedAt?.getTime() ?? b.createdAt.getTime();
      const ta = a.publishedAt?.getTime() ?? a.createdAt.getTime();
      return tb - ta;
    });
}
