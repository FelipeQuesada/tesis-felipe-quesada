'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import {
  getWorkshopById,
  updateWorkshop,
  publishWorkshop,
  unpublishWorkshop,
} from '@/services/workshops.service';
import type { WorkshopCreateInput } from '@/types';

export default function EditWorkshopPage({ id }: { id: string }) {
  const workshopId = id;
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkshopCreateInput | null>(null);

  useEffect(() => {
    async function load() {
      const workshop = await getWorkshopById(workshopId);
      if (!workshop) {
        setError('Taller no encontrado');
        setLoading(false);
        return;
      }
      if (workshop.teacherId !== user?.uid && user?.role !== 'admin') {
        setError('No tienes permiso para editar este taller');
        setLoading(false);
        return;
      }
      setFormData({
        title: workshop.title,
        description: workshop.description,
        categoryId: workshop.categoryId,
        price: workshop.price,
        currency: workshop.currency,
        capacity: workshop.capacity,
        location: {
          addressText: workshop.location.addressText || '',
          cityId: workshop.location.cityId || '',
          countryId: workshop.location.countryId || 'AR',
        },
        coverImageUrl: workshop.coverImageUrl,
        difficultyLevel: workshop.difficultyLevel,
        language: workshop.language,
      });
      setLoading(false);
    }
    if (user && workshopId) load();
  }, [user, workshopId]);

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="error-message">Solo los profesores pueden editar talleres.</div>
        </main>
      </>
    );
  }

  if (loading || !formData) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="container">
          <div className="error-message">{error}</div>
          <Link href="/teacher/home">Volver al inicio</Link>
        </main>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateWorkshop(workshopId, formData);
      router.push(`/workshops/${workshopId}`);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el taller');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateWorkshop(workshopId, formData);
      await publishWorkshop(workshopId);
      router.push(`/workshops/${workshopId}`);
    } catch (err: any) {
      setError(err.message || 'Error al publicar');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('¿Ocultar este taller? No aparecerá en la lista pública.')) return;
    setError(null);
    setSaving(true);
    try {
      await unpublishWorkshop(workshopId);
      router.push(`/workshops/${workshopId}`);
    } catch (err: any) {
      setError(err.message || 'Error al ocultar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '2rem' }}>Editar Taller</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Título *
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descripción *
            </label>
            <textarea
              id="description"
              className="form-textarea"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficultyLevel" className="form-label">
              Nivel de dificultad
            </label>
            <select
              id="difficultyLevel"
              className="form-select"
              value={formData.difficultyLevel || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  difficultyLevel: (e.target.value || undefined) as any,
                })
              }
            >
              <option value="">No especificado</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language" className="form-label">
              Idioma
            </label>
            <input
              id="language"
              type="text"
              className="form-input"
              value={formData.language || ''}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value || undefined })
              }
              placeholder="Ej: es, en"
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryId" className="form-label">
              Categoría *
            </label>
            <input
              id="categoryId"
              type="text"
              className="form-input"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              placeholder="Ej: Cocina, Arte, Tecnología"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Precio (ARS) *
              </label>
              <input
                id="price"
                type="number"
                className="form-input"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity" className="form-label">
                Capacidad *
              </label>
              <input
                id="capacity"
                type="number"
                className="form-input"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: Number(e.target.value) })
                }
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="addressText" className="form-label">
              Dirección *
            </label>
            <input
              id="addressText"
              type="text"
              className="form-input"
              value={formData.location.addressText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, addressText: e.target.value },
                })
              }
              placeholder="Ej: Av. Corrientes 1234, CABA"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="cityId" className="form-label">
                Ciudad
              </label>
              <input
                id="cityId"
                type="text"
                className="form-input"
                value={formData.location.cityId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, cityId: e.target.value },
                  })
                }
                placeholder="Ej: Buenos Aires"
              />
            </div>

            <div className="form-group">
              <label htmlFor="countryId" className="form-label">
                País
              </label>
              <input
                id="countryId"
                type="text"
                className="form-input"
                value={formData.location.countryId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, countryId: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="btn btn-secondary"
              disabled={saving}
            >
              Publicar
            </button>
            <button
              type="button"
              onClick={handleUnpublish}
              className="btn btn-outline"
              disabled={saving}
            >
              Ocultar
            </button>
            <Link href={`/workshops/${workshopId}`} className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
