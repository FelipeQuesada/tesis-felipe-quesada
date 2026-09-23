'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminNav } from '@/components/AdminNav';
import { HomeHeader } from '@/components/HomeHeader';
import { createBlogPost } from '@/services/blog.service';
import { getCategories } from '@/services/category.service';
import { slugifyTitle } from '@/lib/slugify';
import type { BlogPostStatus, Category } from '@/types';

export default function AdminNewBlogPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [status, setStatus] = useState<BlogPostStatus>('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(slugifyTitle(title));
    }
  }, [title, slugTouched]);

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setError(null);
    const s = slug.trim() || slugifyTitle(title);
    if (!title.trim() || !s || !content.trim()) {
      setError('Completá título, slug y contenido.');
      return;
    }
    setSaving(true);
    try {
      const authorName = user.displayName?.trim() || user.email || 'Administrador';
      await createBlogPost(user.uid, {
        title: title.trim(),
        slug: s,
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        authorName,
        categoryIds,
        status,
      });
      router.push('/admin/blogs');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el blog');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <>
        <HomeHeader />
        <AdminNav />
        <main style={{ padding: '1.5rem' }}>
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <HomeHeader />
      <AdminNav />
      <main style={{ padding: '1.5rem', maxWidth: '720px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/admin/blogs" className="material-link">
            ← Volver a blogs
          </Link>
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Nuevo artículo</h1>
        {error ? <p style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p> : null}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            Título
            <input
              className="input"
              style={{ width: '100%', marginTop: '0.35rem' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            Slug (URL)
            <input
              className="input"
              style={{ width: '100%', marginTop: '0.35rem' }}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
            />
          </label>
          <label>
            Resumen (opcional)
            <textarea
              className="input"
              style={{ width: '100%', marginTop: '0.35rem', minHeight: '72px' }}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </label>
          <label>
            URL de imagen de portada (opcional)
            <input
              className="input"
              style={{ width: '100%', marginTop: '0.35rem' }}
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label>
            Contenido
            <textarea
              className="input"
              style={{ width: '100%', marginTop: '0.35rem', minHeight: '220px' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>
          <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1rem' }}>
            <legend>Categorías</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.map((c) => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                  {c.name}
                </label>
              ))}
              {categories.length === 0 ? <span style={{ color: '#666' }}>No hay categorías en Firestore.</span> : null}
            </div>
          </fieldset>
          <label>
            Estado
            <select
              className="input"
              style={{ width: '100%', marginTop: '0.35rem' }}
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </label>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </main>
    </>
  );
}

