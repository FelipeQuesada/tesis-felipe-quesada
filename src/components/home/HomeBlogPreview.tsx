'use client';

import Link from 'next/link';
import { usePublishedBlogPosts } from '@/hooks/useBlog';
import { blogCoverSrc } from '@/lib/blogDisplay';

export function HomeBlogPreview() {
  const { posts, loading } = usePublishedBlogPosts();
  const list = posts.slice(0, 6);

  return (
    <section>
      <div className="home-section-head">
        <h3>Últimas publicaciones del blog</h3>
        <Link href="/blog">Ver todas →</Link>
      </div>

      {loading ? (
        <p className="home-empty">Cargando blog…</p>
      ) : list.length === 0 ? (
        <p className="home-empty">Pronto vas a ver artículos acá.</p>
      ) : (
        <div className="home-hscroll">
          {list.map((post, i) => {
            const src = blogCoverSrc(post.coverImageUrl, i);
            const dateLabel = (
              post.publishedAt ?? post.createdAt
            )?.toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            return (
              <Link key={post.id} href={`/blog/${post.id}`} className="home-blog-card">
                <div className="home-blog-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                </div>
                <div className="home-blog-body">
                  <h4>{post.title}</h4>
                  <span>{dateLabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
