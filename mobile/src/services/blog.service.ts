import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { getFirestoreDb } from '../lib/firebase';
import {
  getHardcodedPublishedBlogPostById,
  mergeFeaturedHardcodedWithRemote,
} from '../data/hardcodedBlogPosts';
import type { BlogPost, BlogPostStatus } from '../types';

const COLLECTION = 'blogs';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToBlogPost(docId: string, data: Record<string, unknown>): BlogPost {
  return {
    id: docId,
    title: (data.title as string) ?? '',
    slug: (data.slug as string) ?? '',
    content: (data.content as string) ?? '',
    excerpt: data.excerpt as string | undefined,
    coverImageUrl: data.coverImageUrl as string | undefined,
    authorId: (data.authorId as string) ?? '',
    authorName: data.authorName as string | undefined,
    status: (data.status as BlogPostStatus) ?? 'draft',
    categoryIds: (data.categoryIds as string[]) ?? [],
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
    updatedAt: data.updatedAt
      ? timestampToDate(data.updatedAt as Timestamp)
      : undefined,
    publishedAt: data.publishedAt
      ? timestampToDate(data.publishedAt as Timestamp)
      : undefined,
  };
}

async function getBlogPostById(blogId: string): Promise<BlogPost | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, blogId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToBlogPost(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function getPublishedBlogPostById(
  blogId: string
): Promise<BlogPost | null> {
  const hardcoded = getHardcodedPublishedBlogPostById(blogId);
  if (hardcoded) return hardcoded;
  const post = await getBlogPostById(blogId);
  if (!post || post.status !== 'published') return null;
  return post;
}

export async function listPublishedBlogPosts(): Promise<BlogPost[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);
  const remote = querySnapshot.docs
    .map((d) => docToBlogPost(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => {
      const tb = b.publishedAt?.getTime() ?? b.createdAt.getTime();
      const ta = a.publishedAt?.getTime() ?? a.createdAt.getTime();
      return tb - ta;
    });
  return mergeFeaturedHardcodedWithRemote(remote);
}
