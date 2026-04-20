'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { validatePassword, PASSWORD_REQUIREMENTS } from '@/lib/passwordValidation';
import type { DocumentType, UserRole } from '@/types';

const PHONE_COUNTRY_CODES = [
  { label: 'Argentina (+54)', value: '+54' },
  { label: 'Chile (+56)', value: '+56' },
  { label: 'Uruguay (+598)', value: '+598' },
  { label: 'Paraguay (+595)', value: '+595' },
  { label: 'Brasil (+55)', value: '+55' },
  { label: 'Perú (+51)', value: '+51' },
  { label: 'Colombia (+57)', value: '+57' },
  { label: 'México (+52)', value: '+52' },
  { label: 'España (+34)', value: '+34' },
  { label: 'Estados Unidos (+1)', value: '+1' },
];

const DOCUMENT_TYPES: Array<{ label: string; value: DocumentType }> = [
  { label: 'DNI', value: 'dni' },
  { label: 'Pasaporte', value: 'pasaporte' },
  { label: 'Cédula', value: 'cedula' },
  { label: 'Otro', value: 'otro' },
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+54');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('dni');
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirigir cuando el usuario esté cargado (evita race condition)
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanUsername = username.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const cleanDocumentNumber = documentNumber.trim();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (!cleanFirstName || !cleanLastName) {
      setError('Completa nombre y apellido.');
      return;
    }
    if (!cleanPhoneNumber) {
      setError('Ingresa un teléfono válido.');
      return;
    }
    if (!cleanDocumentNumber) {
      setError('Ingresa el número de documento.');
      return;
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      setError(pwValidation.message ?? 'La contraseña no cumple los requisitos.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, role, {
        username: cleanUsername,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phoneCountryCode,
        phoneNumber: cleanPhoneNumber,
        documentType,
        documentNumber: cleanDocumentNumber,
      });
      // No redirigir aquí: useEffect se encarga cuando user esté disponible
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container" style={{ maxWidth: '500px', margin: '3rem auto 0', paddingBottom: '140px' }}>
        <h1 style={{ marginBottom: '2rem' }}>Registrarse</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              autoComplete="username"
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="given-name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                autoComplete="family-name"
                required
              />
            </div>
          </div>

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
              placeholder="ingrese su email"
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40% 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label htmlFor="phoneCountryCode" className="form-label">
                Código de área
              </label>
              <select
                id="phoneCountryCode"
                className="form-select"
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                required
              >
                {PHONE_COUNTRY_CODES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                Teléfono
              </label>
              <input
                id="phoneNumber"
                type="tel"
                className="form-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="1122334455"
                autoComplete="tel-national"
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40% 1fr',
              gap: '0.75rem',
            }}
          >
            <div className="form-group">
              <label htmlFor="documentType" className="form-label">
                Tipo de documento
              </label>
              <select
                id="documentType"
                className="form-select"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                required
              >
                {DOCUMENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="documentNumber" className="form-label">
                Número de documento
              </label>
              <input
                id="documentNumber"
                type="text"
                className="form-input"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Ej: 12345678"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <ul style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.5rem' }}>
              {PASSWORD_REQUIREMENTS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ingrese una contraseña"
                required
                minLength={8}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Tipo de cuenta
            </label>
            <select
              id="role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
            >
              <option value="student">Estudiante</option>
              <option value="teacher">Profesor</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: '#666' }}>¿Ya tienes cuenta? </span>
          <Link href="/auth/login" style={{ color: '#0070f3' }}>
            Inicia sesión
          </Link>
        </div>
      </main>
    </>
  );
}
