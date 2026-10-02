'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Workshop } from '@/types';
import { stockCoverByCategory, stockCoverByIndex } from '@/lib/stockImages';

function formatPrice(workshop: Workshop): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: workshop.currency || 'ARS',
    maximumFractionDigits: 0,
  }).format(workshop.price);
}

function descriptionPreview(text: string, max = 90): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function ExploreWorkshopCard({
  workshop,
  index = 0,
  favorited,
  onToggleFavorite,
}: {
  workshop: Workshop;
  index?: number;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  const imageSrc =
    workshop.coverImageUrl?.trim() ||
    stockCoverByCategory(workshop.categoryId) ||
    stockCoverByIndex(index);

  const reviewsLabel =
    workshop.stats?.reviewsCount && workshop.stats.reviewsCount > 0
      ? `★ ${workshop.stats.avgRating?.toFixed(1) ?? '–'} · ${workshop.stats.reviewsCount} reseñas`
      : 'Sin reseñas';

  return (
    <article className="explore-card">
      <Link href={`/workshops/${workshop.id}`} className="explore-card-link">
        <div className="explore-card-cover">
          <Image
            src={imageSrc}
            alt={workshop.title}
            fill
            sizes="(max-width: 767px) 104px, 280px"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="explore-card-body">
          <div className="explore-card-main">
            <h3 className="explore-card-title">
              {workshop.title}
              {workshop.teacherName ? (
                <span className="explore-card-teacher">
                  {' '}
                  · {workshop.teacherName}
                </span>
              ) : null}
            </h3>
            {workshop.description?.trim() ? (
              <p className="explore-card-desc">
                {descriptionPreview(workshop.description)}
              </p>
            ) : null}
            <div className="explore-card-footer">
              <span className="explore-card-price">{formatPrice(workshop)}</span>
              <span className="explore-card-reviews">{reviewsLabel}</span>
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`explore-card-fav${favorited ? ' is-on' : ''}`}
        aria-label={favorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          {favorited ? (
            <path
              fill="currentColor"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          ) : (
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          )}
        </svg>
      </button>
    </article>
  );
}
