'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { HomeTopBar } from '@/components/home/HomeTopBar';
import { HomeAmbientBg } from '@/components/home/HomeAmbientBg';
import { HomeWelcomeHero } from '@/components/home/HomeWelcomeHero';
import { HomeSearchBar } from '@/components/home/HomeSearchBar';
import { HomeQuickLinks } from '@/components/home/HomeQuickLinks';
import { HomeRecommendedWorkshops } from '@/components/home/HomeRecommendedWorkshops';
import { HomePromoBanner } from '@/components/home/HomePromoBanner';
import { HomeBlogPreview } from '@/components/home/HomeBlogPreview';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role === 'teacher') {
      router.push('/teacher/home');
    }
  }, [user, loading, router]);

  if (user?.role === 'teacher') {
    return null;
  }

  return (
    <>
      <div className="home-page">
        <HomeAmbientBg />
        <HomeTopBar />
        <div className="home-shell">
          <HomeWelcomeHero />
          <HomeSearchBar />
          <HomeQuickLinks />
          <HomeRecommendedWorkshops />
          <HomePromoBanner />
          <HomeBlogPreview />
        </div>
      </div>
      <BottomNav />
    </>
  );
}

