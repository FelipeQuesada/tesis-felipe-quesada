'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';
import { RelatedWorkshopsSection } from '@/components/RelatedWorkshopsSection';
import { blogCoverSrc } from '@/lib/blogDisplay';
import { usePublishedBlogPost } from '@/hooks/useBlog';
import { useBlogEngagement } from '@/hooks/useBlogEngagement';
import { useAuth } from '@/contexts/AuthContext';
import { listPublishedWorkshopsByTeacherId } from '@/services/workshops.service';
import type { Workshop } from '@/types';

function BlogCoverImage({ src, alt }: { src: string; alt: string }) {
  const isLocal = src.startsWith('/');
  if (isLocal) {
    return (
      <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} sizes="(max-width: 800px) 100vw, 800px" />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- URLs externas (Storage) sin remotePatterns fijas
  return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}

export default function BlogPostPage({ id }: { id: string }) {
  
  const router = useRouter();
  const { user } = useAuth();
  const blogId = id;
  const { post: blog, loading, error } = usePublishedBlogPost(blogId);
  const { likesCount, likedByMe, comments, liking, commenting, loadError, toggleLike, addComment } =
    useBlogEngagement(blogId, user?.uid ?? null);
  const [related, setRelated] = useState<Workshop[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!blog?.authorId?.trim()) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    setRelatedLoading(true);
    listPublishedWorkshopsByTeacherId(blog.authorId, 8)
      .then((w) => {
        if (!cancelled) setRelated(w);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [blog?.authorId, blog?.id]);

  if (loading) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '220px' }}>
          <div className="loading">Cargando artículo...</div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (error) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '220px' }}>
          <p style={{ color: 'crimson' }}>{error.message}</p>
          <Link href="/" className="material-link">
            Volver al inicio
          </Link>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <HomeHeader />
        <main style={{ paddingTop: '1rem', paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '220px' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Artículo no encontrado</h1>
            <Link href="/" className="material-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Volver al inicio
            </Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const coverSrc = blogCoverSrc(blog.coverImageUrl);
  const authorLabel = blog.authorName?.trim() || 'Equipo MiTaller';
  const dateLabel =
    blog.publishedAt?.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) ?? blog.createdAt.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });

  const askForAuth = (actionLabel: 'dar like' | 'comentar') => {
    const goLogin = window.confirm(
      `Para ${actionLabel} necesitas iniciar sesión o registrarte.\n\n¿Quieres ir a Iniciar sesión?`
    );
    if (goLogin) {
      router.push('/auth/login');
      return;
    }
    const goRegister = window.confirm('¿Quieres ir a Registrarte?');
    if (goRegister) {
      router.push('/auth/register');
    }
  };

  const handleLikeClick = async () => {
    if (!user) {
      askForAuth('dar like');
      return;
    }
    try {
      await toggleLike();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo actualizar el me gusta.');
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      askForAuth('comentar');
      return;
    }
    const cleaned = commentText.trim();
    if (cleaned.length < 2) {
      alert('El comentario es demasiado corto.');
      return;
    }
    try {
      const displayName =
        user.displayName?.trim() ||
        `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
        user.email ||
        'Usuario';
      await addComment(cleaned, displayName);
      setCommentText('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el comentario.';
      alert(message);
    }
  };

  return (
    <>
      <HomeHeader />
      <main style={{ paddingBottom: '220px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--primary-green)',
              textDecoration: 'none',
              marginBottom: '1.5rem',
              fontWeight: 500,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </Link>

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '2rem',
            }}
          >
            <BlogCoverImage src={coverSrc} alt={blog.title} />
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '1rem',
              lineHeight: '1.3',
            }}
          >
            {blog.title}
          </h1>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '2rem',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
            }}
          >
            <span>Por {authorLabel}</span>
            <span>•</span>
            <span>{dateLabel}</span>
          </div>

          {blog.excerpt ? (
            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
                fontStyle: 'italic',
              }}
            >
              {blog.excerpt}
            </p>
          ) : null}

          <div
            style={{
              fontSize: '1.125rem',
              lineHeight: '1.8',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
              whiteSpace: 'pre-line',
            }}
          >
            {blog.content}
          </div>

          {loadError ? (
            <p
              style={{
                color: 'crimson',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#fff5f5',
                borderRadius: '8px',
                border: '1px solid #fecaca',
              }}
            >
              No se pudieron cargar likes ni comentarios: {loadError}
            </p>
          ) : null}

          <div className="material-card" style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={handleLikeClick}
                className="btn btn-primary"
                style={{ minWidth: '130px' }}
                disabled={liking}
              >
                {likedByMe ? '❤️ Me gusta' : '🤍 Me gusta'} ({likesCount})
              </button>
              {!user ? (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Inicia sesión o regístrate para dar like y comentar.
                </span>
              ) : null}
            </div>
          </div>

          <div className="material-card" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Comentarios ({comments.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                className="form-textarea"
                style={{ minHeight: '100px' }}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  user
                    ? 'Escribe tu comentario...'
                    : 'Inicia sesión para escribir un comentario'
                }
                onFocus={() => {
                  if (!user) askForAuth('comentar');
                }}
                disabled={!user || commenting}
              />
              <div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddComment}
                  disabled={commenting}
                >
                  {commenting ? 'Publicando...' : 'Publicar comentario'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Aún no hay comentarios. Sé el primero en comentar.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      border: '1px solid var(--divider)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      background: '#fff',
                    }}
                  >
                    <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                      {comment.userDisplayName}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {comment.createdAt.toLocaleString('es-AR')}
                    </p>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {relatedLoading ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando talleres relacionados…</p>
          ) : (
            <RelatedWorkshopsSection workshops={related} />
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
