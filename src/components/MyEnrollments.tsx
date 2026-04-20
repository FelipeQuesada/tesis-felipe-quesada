'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentEnrollments } from '@/hooks/useEnrollments';
import { cancelEnrollment } from '@/services/enrollments.service';
import { getWorkshopById } from '@/services/workshops.service';
import { getSessionById } from '@/services/sessions.service';
import type { Enrollment } from '@/types';

export function MyEnrollments() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const { enrollments, loading, error } = useStudentEnrollments(user?.uid || null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [workshopSessionMap, setWorkshopSessionMap] = useState<
    Record<string, { workshop: any; session: any }>
  >({});

  useEffect(() => {
    const fetchDetails = async () => {
      const map: Record<string, { workshop: any; session: any }> = {};
      for (const e of enrollments) {
        const workshop = await getWorkshopById(e.workshopId);
        const session = await getSessionById(e.sessionId);
        map[e.id] = { workshop, session };
      }
      setWorkshopSessionMap(map);
    };
    if (enrollments.length > 0) fetchDetails();
  }, [enrollments]);

  const handlePay = async (enrollmentId: string) => {
    if (!user || !firebaseUser) return;
    setActionLoading(enrollmentId);
    setPayError(null);
    try {
      const token = await firebaseUser.getIdToken();
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${baseUrl}/api/payments/mercadopago/preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enrollmentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear pago');
      if (data.initPoint) window.location.href = data.initPoint;
      else throw new Error('No se recibió URL de pago');
    } catch (err: any) {
      setPayError(err.message || 'Error al procesar pago');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (enrollmentId: string) => {
    if (!user) return;
    if (!confirm('¿Cancelar esta inscripción?')) return;
    setActionLoading(enrollmentId);
    setCancelError(null);
    try {
      await cancelEnrollment(enrollmentId, user.uid);
      router.refresh();
    } catch (err: any) {
      setCancelError(err.message || 'Error al cancelar');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(date);

  const canCancel = (e: Enrollment, sessionStart?: Date) => {
    if (e.status !== 'pending_payment' && e.status !== 'paid') return false;
    if (!sessionStart) return true;
    const hoursUntil = (sessionStart.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil >= 48;
  };

  if (!user) return null;

  if (loading) {
    return <div className="loading">Cargando inscripciones...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  if (enrollments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>No tienes inscripciones.</p>
        <Link href="/" style={{ color: '#0070f3', marginTop: '1rem', display: 'inline-block' }}>
          Explorar talleres
        </Link>
      </div>
    );
  }

  return (
    <div>
      {(cancelError || payError) && (
        <div className="error-message">{cancelError || payError}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {enrollments.map((e) => {
          const details = workshopSessionMap[e.id];
          const sessionStart = details?.session?.startAt;
          const showCancel = canCancel(e, sessionStart);

          return (
            <div key={e.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    {details?.workshop?.title ?? 'Cargando...'}
                  </h3>
                  {details?.session && (
                    <p style={{ color: '#666', fontSize: '0.875rem' }}>
                      {formatDate(details.session.startAt)}
                    </p>
                  )}
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem',
                      background:
                        e.status === 'paid'
                          ? '#28a745'
                          : e.status === 'pending_payment'
                          ? '#ffc107'
                          : '#6c757d',
                      color: 'white',
                    }}
                  >
                    {e.status === 'paid'
                      ? 'Pagado'
                      : e.status === 'pending_payment'
                      ? 'Pendiente de pago'
                      : e.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link
                    href={`/workshops/${e.workshopId}`}
                    className="btn btn-outline"
                  >
                    Ver taller
                  </Link>
                  {e.status === 'pending_payment' && (
                    <button
                      onClick={() => handlePay(e.id)}
                      className="btn btn-primary"
                      disabled={actionLoading === e.id}
                    >
                      {actionLoading === e.id ? '...' : 'Pagar'}
                    </button>
                  )}
                  {showCancel && (
                    <button
                      onClick={() => handleCancel(e.id)}
                      className="btn btn-outline"
                      style={{ color: '#dc3545', borderColor: '#dc3545' }}
                      disabled={actionLoading === e.id}
                    >
                      {actionLoading === e.id ? '...' : 'Cancelar inscripción'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
