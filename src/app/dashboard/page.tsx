'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { TeacherDashboard } from '@/components/TeacherDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="container">
        <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
        {user.role === 'teacher' && <TeacherDashboard />}
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </main>
    </>
  );
}
