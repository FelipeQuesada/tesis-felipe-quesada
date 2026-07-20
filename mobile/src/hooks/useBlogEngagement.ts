import { useCallback, useEffect, useState } from 'react';
import {
  formatFirestoreLoadError,
  runWithFirestoreRetry,
} from '../lib/firestoreRetry';
import {
  addBlogComment,
  getBlogLikesCount,
  isBlogLikedByUser,
  listBlogComments,
  toggleBlogLike,
} from '../services/blogEngagement.service';
import type { BlogComment } from '../types';

export function useBlogEngagement(blogId: string, userId: string | null) {
  const [likesCount, setLikesCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const load = useCallback(async () => {
    if (!blogId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [likes, commentList] = await runWithFirestoreRetry(() =>
        Promise.all([getBlogLikesCount(blogId), listBlogComments(blogId)])
      );
      let liked = false;
      if (userId) {
        try {
          liked = await runWithFirestoreRetry(() =>
            isBlogLikedByUser(blogId, userId)
          );
        } catch (likeErr) {
          console.warn('No se pudo verificar me gusta del usuario:', likeErr);
        }
      }
      setLikesCount(likes);
      setComments(commentList);
      setLikedByMe(liked);
    } catch (err) {
      const formatted = formatFirestoreLoadError(err);
      console.error('Error cargando engagement del blog:', err);
      setLoadError(formatted.message);
      setLikesCount(0);
      setComments([]);
      setLikedByMe(false);
    } finally {
      setLoading(false);
    }
  }, [blogId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onToggleLike = async () => {
    if (!userId || liking) return;
    setLiking(true);
    try {
      const isLikedNow = await toggleBlogLike(blogId, userId);
      setLikedByMe(isLikedNow);
      setLikesCount((prev) => (isLikedNow ? prev + 1 : Math.max(prev - 1, 0)));
    } catch (err) {
      console.error('toggleBlogLike:', err);
      throw err;
    } finally {
      setLiking(false);
    }
  };

  const onAddComment = async (text: string, displayName: string) => {
    if (!userId || commenting) return;
    setCommenting(true);
    try {
      await addBlogComment({
        blogId,
        userId,
        userDisplayName: displayName,
        text,
      });
      const updated = await listBlogComments(blogId);
      setComments(updated);
    } catch (err) {
      console.error('addBlogComment:', err);
      throw err;
    } finally {
      setCommenting(false);
    }
  };

  return {
    loading,
    loadError,
    likesCount,
    likedByMe,
    comments,
    liking,
    commenting,
    toggleLike: onToggleLike,
    addComment: onAddComment,
    refreshEngagement: load,
  };
}
