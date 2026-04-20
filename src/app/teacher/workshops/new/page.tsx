'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { getCategories } from '@/services/category.service';
import { createWorkshop, publishWorkshop } from '@/services/workshops.service';
import type { Category, WorkshopCreateInput } from '@/types';

export default function NewWorkshopPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkshopCreateInput>({
    title: '',
    description: '',
    categoryId: '',
    price: 0,
    currency: 'ARS',
    capacity: 0,
    location: {
      addressText: '',
      cityId: '',
      countryId: 'AR',
    },
  });

  const resolvedTeacherName =
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    'Profesor';

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        if (!cancelled) {
          setCategories(data.filter((c) => c.isActive !== false));
        }
      } catch (err) {
        console.error('Error cargando categorías:', err);
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user || user.role !== 'teacher') {
    return (
      <>
        <Navbar mode="brandOnly" />
        <main className="container" style={{ padding: '1rem 1rem 140px' }}>
          <div className="error-message">
            Solo los profesores pueden crear talleres.
          </div>
        </main>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const workshop = await createWorkshop(user.uid, formData, resolvedTeacherName);
      router.push(`/workshops/${workshop.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear el taller');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const workshop = await createWorkshop(user.uid, formData, resolvedTeacherName);
      await publishWorkshop(workshop.id);
      router.push(`/workshops/${workshop.id}`);
    } catch (err: any) {
      setError(err.message || 'Error al crear y publicar el taller');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar mode="brandOnly" />
      <main
        className="container"
        style={{ maxWidth: '860px', padding: '0 1rem 220px' }}
      >
        <div
          className="material-card"
          style={{ marginBottom: '1.25rem', background: 'var(--surface)' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  marginBottom: '0.35rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                MODO CREADOR
              </p>
              <h1 style={{ margin: 0, fontSize: '1.7rem' }}>Crear nuevo taller</h1>
            </div>
            <Link href="/teacher/workshops" className="material-link">
              Volver a mis talleres
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="material-card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Información principal</h2>
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
            <label htmlFor="categoryId" className="form-label">
              Categoría *
            </label>
            <select
              id="categoryId"
              className="form-select"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              disabled={categoriesLoading}
              required
            >
              <option value="">
                {categoriesLoading ? 'Cargando categorías...' : 'Selecciona una categoría'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
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
                  difficultyLevel: (e.target.value || undefined) as
                    | 'beginner'
                    | 'intermediate'
                    | 'advanced'
                    | undefined,
                })
              }
            >
              <option value="">No especificado</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="language" className="form-label">
              Idioma
            </label>
            <select
              id="language"
              className="form-select"
              value={formData.language || ''}
              onChange={(e) =>
                setFormData({ ...formData, language: e.target.value || undefined })
              }
            >
              <option value="">Selecciona un idioma</option>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
            </select>
            </div>
          </div>

          <div className="material-card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Precio y cupos</h2>
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
          </div>

          <div className="material-card" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Ubicación</h2>
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
                value={formData.location.cityId}
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
                value={formData.location.countryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, countryId: e.target.value },
                  })
                }
              />
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div
            className="material-card"
            style={{
              position: 'sticky',
              bottom: '1rem',
              zIndex: 20,
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar como Borrador'}
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? 'Publicando...' : 'Crear y Publicar'}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
