'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container" style={{ maxWidth: '500px', marginTop: '3rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Recuperar contraseña</h1>

        {success ? (
          <div className="card">
            <p style={{ marginBottom: '1rem' }}>
              Te enviamos un correo a <strong>{email}</strong> con un enlace para restablecer tu contraseña.
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
            <Link href="/auth/login" style={{ color: '#0070f3' }}>
              Volver a Iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu email"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/auth/login" style={{ color: '#0070f3' }}>
            Volver a Iniciar sesión
          </Link>
        </div>
      </main>
    </>
  );
}
