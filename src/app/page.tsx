'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HomeHeader } from '@/components/HomeHeader';
import { BlogSection } from '@/components/BlogSection';
import { LearnSection } from '@/components/LearnSection';
import { WhySection } from '@/components/WhySection';
import { BottomNav } from '@/components/BottomNav';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirigir profesores a su página de inicio
    if (!loading && user?.role === 'teacher') {
      router.push('/teacher/home');
    }
  }, [user, loading, router]);

  // Si es profesor, no renderizar nada (se redirige)
  if (user?.role === 'teacher') {
    return null;
  }

  return (
    <>
      <HomeHeader />
      <main style={{ paddingBottom: '80px', paddingTop: 0 }}>
        <BlogSection />
        <LearnSection />
        <WhySection />
      </main>
      <BottomNav />
    </>
  );
}
