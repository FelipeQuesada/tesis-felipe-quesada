'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  listUsers,
  updateUserRole,
  updateUserIsActive,
} from '@/services/user.service';
import type { User, UserRole } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    listUsers(200)
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid: string, role: UserRole) => {
    setActionLoading(uid);
    try {
      await updateUserRole(uid, role);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role } : u))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (uid: string, isActive: boolean) => {
    setActionLoading(uid);
    try {
      await updateUserIsActive(uid, !isActive);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isActive: !isActive } : u))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Usuarios</h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Nombre</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Rol</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '0.75rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>{u.displayName || '-'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                    disabled={actionLoading === u.uid}
                    style={{ padding: '0.25rem' }}
                  >
                    <option value="student">Estudiante</option>
                    <option value="teacher">Profesor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {u.isActive ? 'Activo' : 'Pausado'}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleActive(u.uid, u.isActive)}
                    className="btn btn-outline"
                    style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    disabled={actionLoading === u.uid}
                  >
                    {u.isActive ? 'Pausar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
