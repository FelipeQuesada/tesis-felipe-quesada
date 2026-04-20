'use client';

import Image from 'next/image';
import Link from 'next/link';

export function LearnSection() {
  return (
    <section style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <h2 className="section-title">Aprendé arte donde y cuando quieras</h2>
      <div className="material-card learn-section-card">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '1.5rem',
            }}
          >
            Descubrí talleres presenciales cerca tuyo y anotate en minutos desde la app.
          </p>
          <Link href="/workshops" className="material-link" style={{ fontSize: '1rem' }}>
            Explorar talleres
          </Link>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              position: 'relative',
              width: '173px',
              height: '173px',
              minWidth: '173px',
            }}
          >
            <Image
              src="/images/promo.png"
              alt="Aprendé de expertos"
              fill
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
