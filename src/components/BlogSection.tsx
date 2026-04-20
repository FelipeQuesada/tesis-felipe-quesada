'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePublishedBlogPosts } from '@/hooks/useBlog';
import { blogCoverSrc } from '@/lib/blogDisplay';

function BlogCardImage({ src, alt }: { src: string; alt: string }) {
  if (src.startsWith('/')) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        sizes="(max-width: 768px) 100vw, 280px"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />;
}

export function BlogSection() {
  const { posts, loading, error } = usePublishedBlogPosts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // En home mostramos solo tutoriales fijos de la app.
  const blogPosts = posts.slice(0, 4);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !scrollContainerRef.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        scroll('right');
      } else {
        scroll('left');
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrolling) return;

    const container = scrollContainerRef.current;
    const cardWidth = 280 + 24;
    const scrollLeft = container.scrollLeft;
    const newIndex = Math.round(scrollLeft / cardWidth);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < blogPosts.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || isScrolling || blogPosts.length === 0) return;

    setIsScrolling(true);

    let newIndex: number;
    if (direction === 'right') {
      newIndex = (currentIndex + 1) % blogPosts.length;
    } else {
      newIndex = currentIndex === 0 ? blogPosts.length - 1 : currentIndex - 1;
    }

    setCurrentIndex(newIndex);

    const container = scrollContainerRef.current;
    const cardWidth = 280 + 24;
    const targetScroll = newIndex * cardWidth;

    const startScroll = container.scrollLeft;
    const dist = targetScroll - startScroll;
    const duration = 350;
    let startTime: number | null = null;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeOutExpo(progress);
      container.scrollLeft = startScroll + dist * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsScrolling(false);
      }
    };

    requestAnimationFrame(animate);
  };

  if (loading) {
    return (
      <section style={{ padding: '0.75rem 1.5rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Blog Advance
          </h2>
          <Link href="/blog" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Ver más
          </Link>
        </div>
        <div className="loading">Cargando blog…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '0.75rem 1.5rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Blog Advance
          </h2>
          <Link href="/blog" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Ver más
          </Link>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>No se pudo cargar el blog.</p>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <section style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Blog Advance
          </h2>
          <Link href="/blog" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Ver más
          </Link>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Pronto habrá novedades en el blog.</p>
      </section>
    );
  }

  return (
    <section
      style={{
        padding: '0.75rem 1.5rem 1.5rem',
        marginBottom: '2rem',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
        <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
          Blog Advance
        </h2>
        <Link href="/blog" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Ver más
        </Link>
      </div>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className="blog-carousel-arrow"
          onClick={() => scroll('left')}
          disabled={isScrolling}
          style={{
            position: 'absolute',
            left: '-0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--elevation-2)',
            transition: 'background 0.2s, transform 0.2s',
          }}
          aria-label="Anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="carousel-container"
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '0.5rem 0',
            position: 'relative',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
        >
          {blogPosts.map((post) => {
            const imgSrc = blogCoverSrc(post.coverImageUrl);
            return (
              <Link key={post.id} href={`/blog/${post.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div
                  className="material-card"
                  style={{
                    minWidth: '280px',
                    width: '280px',
                    height: '100%',
                    padding: 0,
                    overflow: 'hidden',
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '180px',
                      minHeight: '180px',
                      background: '#f5f5f5',
                      overflow: 'hidden',
                    }}
                  >
                    <BlogCardImage src={imgSrc} alt={post.title} />
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.75rem',
                        lineHeight: '1.4',
                      }}
                    >
                      {post.title}
                    </h3>
                    <span className="material-link" style={{ fontSize: '0.875rem' }}>
                      Leer más →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="blog-carousel-arrow"
          onClick={() => scroll('right')}
          disabled={isScrolling}
          style={{
            position: 'absolute',
            right: '-0.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--elevation-2)',
            transition: 'background 0.2s, transform 0.2s',
          }}
          aria-label="Siguiente"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
