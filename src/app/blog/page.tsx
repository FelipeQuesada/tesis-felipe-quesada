'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomeHeader } from '@/components/HomeHeader';
import { BottomNav } from '@/components/BottomNav';
import { usePublishedBlogPosts } from '@/hooks/useBlog';
import { blogCoverSrc } from '@/lib/blogDisplay';
import { getCategories } from '@/services/category.service';
import type { Category } from '@/types';

function BlogImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith('/')) {
    return <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}

export default function BlogListPage() {
  const { posts, loading, error } = usePublishedBlogPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const data = await getCategories();
        if (!cancelled) {
          setCategories(data.filter((category) => category.isActive !== false));
        }
      } catch (err) {
        console.error('Error cargando categorías del blog:', err);
        if (!cancelled) setCategories([]);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    result.sort((a, b) => {
      const tb = b.publishedAt?.getTime() ?? b.createdAt.getTime();
      const ta = a.publishedAt?.getTime() ?? a.createdAt.getTime();
      return tb - ta;
    });

    if (selectedCategory !== 'all') {
      result = result.filter((post) => post.categoryIds.includes(selectedCategory));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [posts, searchQuery, selectedCategory]);

  return (
    <>
      <HomeHeader />
      <main style={{ paddingBottom: '180px', padding: '1rem' }}>
        <section style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div className="material-card" style={{ marginBottom: '1rem' }}>
            <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
              Blog Advance
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Artículos del más nuevo al más viejo. Busca por título y filtra por categoría.
            </p>
          </div>

          <div className="material-card" style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem' }}>
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título o texto..."
              />
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Cargando artículos...</div>
          ) : error ? (
            <div className="material-card">
              <p style={{ color: 'crimson' }}>{error.message}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="material-card">
              <p style={{ color: 'var(--text-secondary)' }}>
                No se encontraron artículos con esos filtros.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {filteredPosts.map((post) => {
                const coverSrc = blogCoverSrc(post.coverImageUrl);
                const dateLabel = (
                  post.publishedAt ?? post.createdAt
                ).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
                return (
                  <Link key={post.id} href={`/blog/${post.id}`} style={{ textDecoration: 'none' }}>
                    <article className="material-card" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
                      <div style={{ position: 'relative', height: '170px', background: '#f5f5f5' }}>
                        <BlogImage src={coverSrc} alt={post.title} />
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                          {dateLabel}
                        </p>
                        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                          {post.title}
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {post.excerpt || 'Sin resumen disponible.'}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}

