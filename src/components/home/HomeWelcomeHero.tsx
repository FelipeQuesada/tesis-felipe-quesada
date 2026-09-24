'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { welcomeAdjective } from '@/types/user';

export function HomeWelcomeHero() {
  const { user } = useAuth();
  const firstName =
    user?.firstName ||
    user?.displayName?.split(' ')[0] ||
    null;
  const welcome = welcomeAdjective(user?.gender);

  const title = firstName
    ? `Hola ${firstName},\n${welcome} a\nMiTaller`
    : `${welcome.charAt(0).toUpperCase()}${welcome.slice(1)} a\nMiTaller`;

  return (
    <section className="home-hero">
      <div className="home-hero-media" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home-hero.jpg"
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <div className="home-hero-copy">
        <h2>
          {title.split('\n').map((line, i) => (
            <span key={`${line}-${i}`}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </h2>
        <p>Aprendé, compartí y disfrutá del arte en comunidad.</p>
        <Link href="/workshops" className="home-cta">
          Explorar talleres →
        </Link>
      </div>
    </section>
  );
}
