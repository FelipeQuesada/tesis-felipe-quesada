'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface BenefitCard {
  id: string;
  title: string;
  description: string;
  image: string;
}

const benefits: BenefitCard[] = [
  {
    id: '1',
    title: 'Descubrí tu lado creativo con talleres presenciales',
    description: 'Animate a probar nuevas técnicas en compañía',
    image: '/images/creativo.png',
  },
  {
    id: '2',
    title: 'Aprendé en un ambiente',
    description: 'Conectá con otros artistas y compartí experiencias',
    image: '/images/manos.png',
  },
  {
    id: '3',
    title: 'Talleres cerca de tu ubicación',
    description: 'Encontrá talleres presenciales en tu zona',
    image: '/images/cerca.png',
  },
  {
    id: '4',
    title: 'Aprendé de expertos',
    description: 'Profesores certificados te guiarán en cada paso',
    image: '/images/promo.png',
  },
];

export function WhySection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Detectar gestos táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !scrollContainerRef.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Distancia mínima para considerar un swipe
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe izquierda - ir a la siguiente
        scroll('right');
      } else {
        // Swipe derecha - ir a la anterior
        scroll('left');
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Sincronizar el índice cuando el usuario hace scroll manualmente
  const handleScroll = () => {
    if (!scrollContainerRef.current || isScrolling) return;
    
    const container = scrollContainerRef.current;
    const cardWidth = 280 + 24;
    const scrollLeft = container.scrollLeft;
    const newIndex = Math.round(scrollLeft / cardWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < benefits.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || isScrolling) return;
    
    setIsScrolling(true);
    
    let newIndex: number;
    if (direction === 'right') {
      newIndex = (currentIndex + 1) % benefits.length;
    } else {
      newIndex = currentIndex === 0 ? benefits.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(newIndex);
    
    const container = scrollContainerRef.current;
    const cardWidth = 280 + 24; // ancho de la tarjeta + gap
    const targetScroll = newIndex * cardWidth;
    
    // Animación suave con easing mejorado
    const startScroll = container.scrollLeft;
    const distance = targetScroll - startScroll;
    const duration = 350; // duración más rápida para mejor respuesta
    let startTime: number | null = null;
    
    // Easing ease-out-expo para transición muy suave
    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };
    
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutExpo(progress);
      container.scrollLeft = startScroll + distance * easedProgress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsScrolling(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  return (
    <section style={{ padding: '1.5rem', marginBottom: '5rem', position: 'relative' }}>
      <h2 className="section-title">Por qué hacer un taller en MiTaller</h2>
      <div style={{ position: 'relative' }}>
        {/* Flecha izquierda - siempre visible */}
        <button
          type="button"
          className="why-carousel-arrow"
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-green-dark)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-green)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
          aria-label="Anterior"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Contenedor con scroll */}
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
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="material-card"
              style={{
                minWidth: '280px',
                width: '280px',
                flexShrink: 0,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '180px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={benefit.image}
                  alt={benefit.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                }}
              >
                {benefit.title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Flecha derecha - siempre visible */}
        <button
          type="button"
          className="why-carousel-arrow"
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
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-green-dark)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary-green)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
          aria-label="Siguiente"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </section>
  );
}
