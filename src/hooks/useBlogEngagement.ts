'use client';

import { useEffect, useState } from 'react';
import {
  addBlogComment,
  getBlogLikesCount,
  isBlogLikedByUser,
  listBlogComments,
  toggleBlogLike,
} from '@/services/blogEngagement.service';
import type { BlogComment } from '@/types';

export function useBlogEngagement(blogId: string, userId: string | null) {
  const [likesCount, setLikesCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);

  const load = async () => {
    if (!blogId) return;
    setLoading(true);
    try {
      const [likes, commentList, liked] = await Promise.all([
        getBlogLikesCount(blogId),
        listBlogComments(blogId),
        userId ? isBlogLikedByUser(blogId, userId) : Promise.resolve(false),
      ]);
      setLikesCount(likes);
      setComments(commentList);
      setLikedByMe(liked);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch((err) => {
      console.error('Error cargando engagement del blog:', err);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId, userId]);

  const onToggleLike = async () => {
    if (!userId || liking) return;
    setLiking(true);
    try {
      const isLikedNow = await toggleBlogLike(blogId, userId);
      setLikedByMe(isLikedNow);
      setLikesCount((prev) => (isLikedNow ? prev + 1 : Math.max(prev - 1, 0)));
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
    } finally {
      setCommenting(false);
    }
  };

  return {
    loading,
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

