'use client';

import Link from 'next/link';
import { STOCK_IMAGES } from '@/lib/stockImages';

export function HomePromoBanner() {
  return (
    <section
      className="home-promo home-promo--photo"
      style={{ backgroundImage: `url(${STOCK_IMAGES.plantas})` }}
    >
      <div className="home-promo-overlay">
        <div className="eyebrow">UNA COMUNIDAD CREATIVA</div>
        <h3>Aprendé arte donde y cuando quieras</h3>
        <p className="home-promo-lead">
          Descubrí talleres presenciales cerca tuyo y conectá con personas que
          comparten tu pasión.
        </p>
        <Link href="/workshops" className="home-cta">
          Explorar talleres →
        </Link>
      </div>
    </section>
  );
}
