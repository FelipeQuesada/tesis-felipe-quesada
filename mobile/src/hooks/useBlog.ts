import { useEffect, useState } from 'react';
import { listHardcodedPublishedBlogPosts } from '../data/hardcodedBlogPosts';
import { runWithFirestoreRetry } from '../lib/firestoreRetry';
import {
  getPublishedBlogPostById,
  listPublishedBlogPosts,
} from '../services/blog.service';
import type { BlogPost } from '../types';

export function usePublishedBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        const data = await runWithFirestoreRetry(() => listPublishedBlogPosts());
        if (!cancelled) {
          setPosts(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setPosts(listHardcodedPublishedBlogPosts());
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading, error };
}

export function usePublishedBlogPost(blogId: string | null | undefined) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!blogId) {
      setPost(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        setLoading(true);
        const data = await runWithFirestoreRetry(() =>
          getPublishedBlogPostById(blogId)
        );
        if (!cancelled) {
          setPost(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e : new Error('Error al cargar el artículo')
          );
          setPost(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blogId]);

  return { post, loading, error };
}
