'use client';

import { useState, useEffect } from 'react';
import { listHardcodedPublishedBlogPosts } from '@/data/hardcodedBlogPosts';
import { getPublishedBlogPostById, listPublishedBlogPosts } from '@/services/blog.service';
import type { BlogPost } from '@/types';

export function usePublishedBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await listPublishedBlogPosts();
        if (!cancelled) {
          setPosts(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setPosts(listHardcodedPublishedBlogPosts());
          setError(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, loading, error };
}

export function usePublishedBlogPost(blogId: string | null) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!blogId) {
      setPost(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      if (!blogId) return;
      try {
        setLoading(true);
        const data = await getPublishedBlogPostById(blogId);
        if (!cancelled) {
          setPost(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('Error al cargar el artículo'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [blogId]);

  return { post, loading, error };
}
