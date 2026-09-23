'use client';

import Link from 'next/link';
import { usePublishedWorkshops } from '@/hooks/useWorkshops';
import { stockCoverByCategory, stockCoverByIndex } from '@/lib/stockImages';
import { getCategoryChipStyle } from '@/lib/categoryColors';

function coverOf(url?: string, categoryId?: string, index = 0): string {
  if (url && url.trim()) return url;
  return stockCoverByCategory(categoryId) || stockCoverByIndex(index);
}

export function HomeRecommendedWorkshops() {
  const { workshops, loading } = usePublishedWorkshops();
  const list = [...workshops]
    .sort((a, b) => {
      const sa =
        (a.stats?.avgRating ?? 0) * 1000 +
        (a.stats?.reviewsCount ?? 0) * 50 +
        (a.stats?.enrolledCount ?? 0);
      const sb =
        (b.stats?.avgRating ?? 0) * 1000 +
        (b.stats?.reviewsCount ?? 0) * 50 +
        (b.stats?.enrolledCount ?? 0);
      return sb - sa;
    })
    .slice(0, 8);

  return (
    <section>
      <div className="home-section-head">
        <h3>Talleres recomendados</h3>
        <Link href="/workshops">Ver todos →</Link>
      </div>

      {loading ? (
        <p className="home-empty">Cargando talleres…</p>
      ) : list.length === 0 ? (
        <p className="home-empty">Todavía no hay talleres publicados. ¡Explorá más adelante!</p>
      ) : (
        <div className="home-hscroll">
          {list.map((w, i) => {
            const chip = getCategoryChipStyle(w.categoryId);
            return (
              <Link key={w.id} href={`/workshops/${w.id}`} className="home-workshop-card">
                <div className="home-workshop-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverOf(w.coverImageUrl, w.categoryId, i)}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.35';
                    }}
                  />
                  <span className="home-heart" aria-hidden>
                    ♡
                  </span>
                </div>
                <div className="home-workshop-body">
                  <span className="home-chip" style={{ background: chip.bg, color: chip.color }}>
                    {w.categoryId || 'Taller'}
                  </span>
                  <h4>{w.title}</h4>
                  <div className="home-meta">
                    <span>
                      {w.location?.addressText?.split(',')[0] ||
                        w.location?.cityId ||
                        'Presencial'}
                    </span>
                  </div>
                  <div className="home-meta">
                    <span>
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: w.currency || 'ARS',
                        maximumFractionDigits: 0,
                      }).format(w.price)}
                    </span>
                  </div>
                  <div className="home-enrolled">
                    <span>
                      {Math.max(0, (w.capacity ?? 0) - (w.stats?.enrolledCount ?? 0))}{' '}
                      lugares disponibles
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
