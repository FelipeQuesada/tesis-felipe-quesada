'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserRole } from '@/services/user.service';
import type { UserRole } from '@/types';

export default function UpdateRolePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateRole = async (newRole: UserRole) => {
    if (!user) {
      setMessage('Debes estar logueado');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await updateUserRole(user.uid, newRole);
      setMessage(`Rol actualizado a: ${newRole}. Por favor, recarga la página.`);
      // Recargar después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Debes estar logueado para usar esta página.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Actualizar Rol de Usuario</h1>
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <p><strong>Usuario actual:</strong> {user.email}</p>
        <p><strong>Rol actual:</strong> {user.role}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          onClick={() => handleUpdateRole('student')}
          disabled={loading || user.role === 'student'}
          style={{
            padding: '1rem',
            background: user.role === 'student' ? '#ccc' : 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: user.role === 'student' ? 'not-allowed' : 'pointer',
          }}
        >
          Cambiar a Estudiante
        </button>
        <button
          onClick={() => handleUpdateRole('teacher')}
          disabled={loading || user.role === 'teacher'}
          style={{
            padding: '1rem',
            background: user.role === 'teacher' ? '#ccc' : 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: user.role === 'teacher' ? 'not-allowed' : 'pointer',
          }}
        >
          Cambiar a Profesor
        </button>
        <button
          onClick={() => handleUpdateRole('admin')}
          disabled={loading || user.role === 'admin'}
          style={{
            padding: '1rem',
            background: user.role === 'admin' ? '#ccc' : 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: user.role === 'admin' ? 'not-allowed' : 'pointer',
          }}
        >
          Cambiar a Administrador
        </button>
      </div>

      {message && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: message.includes('Error') ? '#fee' : '#efe',
            borderRadius: '8px',
            color: message.includes('Error') ? '#c00' : '#060',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

