'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePublishedWorkshops } from '@/hooks/useWorkshops';
import { PageHeader } from '@/components/PageHeader';
import { BottomNav } from '@/components/BottomNav';
import { LocationSearchFree } from '@/components/LocationSearchFree';
import { WorkshopsMap } from '@/components/WorkshopsMap';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCategories } from '@/services/category.service';
import type { Category, Workshop } from '@/types';
import { stockCoverByCategory, stockCoverByIndex } from '@/lib/stockImages';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  Argentina: 'AR',
  Chile: 'CL',
  Uruguay: 'UY',
  Brasil: 'BR',
};

function formatPrice(workshop: Workshop): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: workshop.currency || 'ARS',
    maximumFractionDigits: 0,
  }).format(workshop.price);
}

function descriptionPreview(text: string, max = 90): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export default function ExploreWorkshopsPage() {
  const { workshops, loading, error } = usePublishedWorkshops();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(user?.uid || null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [allCategoriesExpanded, setAllCategoriesExpanded] = useState(false);
  const [catalogCategories, setCatalogCategories] = useState<Category[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('Argentina');
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    cityId?: string;
    countryId?: string;
    lat?: number;
    lng?: number;
  } | null>(null);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const data = await getCategories();
        if (!cancelled) setCatalogCategories(data);
      } catch (err) {
        console.error('Error cargando categorías para explorar:', err);
        if (!cancelled) setCatalogCategories([]);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryButtons = useMemo(() => {
    const options = [{ id: 'Todos', label: 'Todos' }];
    const seen = new Set<string>(['Todos']);
    const catalogById = new Map<string, string>();

    for (const category of catalogCategories) {
      if (!category.id) continue;
      catalogById.set(category.id, category.name || category.id);
      if (!seen.has(category.id)) {
        options.push({ id: category.id, label: category.name || category.id });
        seen.add(category.id);
      }
    }

    for (const workshop of workshops) {
      const id = workshop.categoryId;
      if (!id || seen.has(id)) continue;
      options.push({ id, label: catalogById.get(id) || id });
      seen.add(id);
    }

    const sorted = options.slice(1).sort((a, b) => a.label.localeCompare(b.label, 'es'));
    return [options[0], ...sorted];
  }, [catalogCategories, workshops]);

  const collapsedCategoryCount = 6;
  const visibleCategories = allCategoriesExpanded
    ? categoryButtons
    : categoryButtons.slice(0, collapsedCategoryCount);

  const filteredWorkshops = useMemo(() => {
    let filtered = workshops;

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (w) =>
          w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          w.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter((w) => w.categoryId === selectedCategory);
    }

    // Filtrar por país (código ISO alineado al selector)
    if (selectedCountry) {
      const code = COUNTRY_NAME_TO_CODE[selectedCountry];
      if (code) {
        filtered = filtered.filter(
          (w) => (w.location?.countryId || '').toUpperCase() === code
        );
      }
    }

    // Filtrar por ubicación seleccionada
    if (selectedLocation && selectedLocation.address) {
      filtered = filtered.filter((w) => {
        if (selectedLocation!.cityId && w.location?.cityId) {
          return w.location.cityId.toLowerCase().includes(selectedLocation!.cityId!.toLowerCase()) ||
                 w.location.addressText?.toLowerCase().includes(selectedLocation!.cityId!.toLowerCase());
        }
        if (selectedLocation!.countryId && w.location?.countryId) {
          return w.location.countryId === selectedLocation!.countryId;
        }
        if (w.location?.addressText) {
          const addressLower = w.location.addressText.toLowerCase();
          const searchAddressLower = selectedLocation!.address.toLowerCase();
          return addressLower.includes(searchAddressLower) || searchAddressLower.includes(addressLower);
        }
        return false;
      });
    }

    // Filtros avanzados
    if (priceMin) {
      const min = Number(priceMin);
      if (!isNaN(min)) filtered = filtered.filter((w) => w.price >= min);
    }
    if (priceMax) {
      const max = Number(priceMax);
      if (!isNaN(max)) filtered = filtered.filter((w) => w.price <= max);
    }
    if (difficultyLevel) {
      filtered = filtered.filter((w) => w.difficultyLevel === difficultyLevel);
    }
    if (language) {
      filtered = filtered.filter((w) => w.language === language);
    }
    if (minRating) {
      const rating = Number(minRating);
      if (!isNaN(rating)) filtered = filtered.filter((w) => (w.stats?.avgRating ?? 0) >= rating);
    }

    return filtered;
  }, [workshops, searchQuery, selectedCategory, selectedCountry, selectedLocation, priceMin, priceMax, difficultyLevel, language, minRating]);

  return (
    <>
      <PageHeader title="Explorar Talleres" />
      <main style={{ paddingBottom: '120px' }}>
        <div style={{ padding: '1rem' }}>
          {/* Selector de país */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Selecciona país:
            </span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--divider)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'white',
              }}
            >
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Brasil">Brasil</option>
            </select>
          </div>

          {/* Barra de búsqueda */}
          <div
            style={{
              position: 'relative',
              marginBottom: '1rem',
            }}
          >
            <svg
              width="20"
              height="20"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                zIndex: 1,
              }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Buscar talleres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid var(--divider)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'white',
              }}
            />
          </div>

          {/* Botones de vista y búsqueda por ubicación */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', width: '100%' }}>
            {/* Botón de vista: Lista o Mapa */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                border: '1px solid var(--divider)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                background: viewMode === 'list' ? 'var(--primary-green)' : 'white',
                color: viewMode === 'list' ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              {viewMode === 'list' ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Lista
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Mapa
                </>
              )}
            </button>

            {/* Botón de búsqueda por ubicación */}
            {!showLocationSearch ? (
              <button
                type="button"
                onClick={() => setShowLocationSearch(true)}
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  border: '2px solid var(--primary-green)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  background: 'white',
                  color: 'var(--primary-green)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-green-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Buscar
              </button>
            ) : (
              <div style={{ flex: 1 }}>
                <LocationSearchFree
                  onLocationSelect={(location) => {
                    setSelectedLocation(location.address ? location : null);
                    if (!location.address) {
                      setShowLocationSearch(false);
                    }
                  }}
                  placeholder="Buscar ciudad..."
                />
              </div>
            )}
          </div>

          {/* Mostrar ubicación seleccionada */}
          {selectedLocation && selectedLocation.address && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.5rem',
                background: 'var(--primary-green-light)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: 'var(--primary-green-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                📍 {selectedLocation.address}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation(null);
                  setShowLocationSearch(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary-green-dark)',
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Vista de Mapa */}
          {viewMode === 'map' && !loading && !error && (
            <div style={{ marginBottom: '1.5rem' }}>
              <WorkshopsMap
                workshops={filteredWorkshops.filter((w) => w.location.geo)}
                onWorkshopClick={(workshop) => {
                  router.push(`/workshops/${workshop.id}`);
                }}
              />
              {filteredWorkshops.filter((w) => w.location.geo).length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    marginTop: '1rem',
                  }}
                >
                  <p style={{ marginBottom: '0.5rem' }}>No hay talleres con ubicación en el mapa.</p>
                  <p style={{ fontSize: '0.875rem' }}>
                    Los talleres necesitan tener coordenadas geográficas para aparecer en el mapa.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vista de Lista */}
          {viewMode === 'list' && (
            <>
              {/* Filtros avanzados (colapsable) */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-green)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    padding: 0,
                  }}
                >
                  {showAdvancedFilters ? '− Ocultar filtros avanzados' : '+ Filtros avanzados'}
                </button>
                {showAdvancedFilters && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Precio mín</label>
                      <input type="number" placeholder="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--divider)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Precio máx</label>
                      <input type="number" placeholder="100000" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--divider)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel</label>
                      <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--divider)' }}>
                        <option value="">Todos</option>
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermedio</option>
                        <option value="advanced">Avanzado</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Idioma</label>
                      <input type="text" placeholder="es, en" value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--divider)' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rating mín</label>
                      <input type="number" placeholder="0" min="0" max="5" step="0.5" value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--divider)' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Filtros de categoría */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  overflowX: 'visible',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.5rem',
                }}
              >
                {visibleCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: 'none',
                      background:
                        selectedCategory === category.id
                          ? 'var(--primary-green)'
                          : 'var(--surface)',
                      color:
                        selectedCategory === category.id
                          ? 'white'
                          : 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow:
                        selectedCategory === category.id
                          ? 'var(--elevation-1)'
                          : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {category.label}
                  </button>
                ))}
                {categoryButtons.length > collapsedCategoryCount && (
                  <button
                    type="button"
                    onClick={() => setAllCategoriesExpanded((prev) => !prev)}
                    className="btn"
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      background: 'white',
                      color: 'var(--primary-green)',
                      border: '1px solid var(--primary-green)',
                      boxShadow: 'none',
                    }}
                  >
                    {allCategoriesExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                )}
              </div>

              {/* Grid de talleres */}
              {loading && (
                <div className="loading" style={{ padding: '2rem' }}>
                  Cargando talleres...
                </div>
              )}

              {error && (
                <div className="error-message" style={{ padding: '1rem' }}>
                  Error al cargar talleres: {error.message}
                </div>
              )}

              {!loading && !error && filteredWorkshops.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <p>No se encontraron talleres con los filtros seleccionados.</p>
                </div>
              )}

              {!loading && !error && filteredWorkshops.length > 0 && (
                <div className="explore-grid">
                  {filteredWorkshops.map((workshop, i) => (
                    <WorkshopCard
                      key={workshop.id}
                      workshop={workshop}
                      index={i}
                      favorited={isFavorite(workshop.id)}
                      onToggleFavorite={() => {
                        if (!user) {
                          router.push('/auth/login');
                          return;
                        }
                        void toggleFavorite(workshop.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function WorkshopCard({
  workshop,
  index = 0,
  favorited,
  onToggleFavorite,
}: {
  workshop: Workshop;
  index?: number;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  const imageSrc =
    workshop.coverImageUrl?.trim() ||
    stockCoverByCategory(workshop.categoryId) ||
    stockCoverByIndex(index);

  const reviewsLabel =
    workshop.stats?.reviewsCount && workshop.stats.reviewsCount > 0
      ? `★ ${workshop.stats.avgRating?.toFixed(1) ?? '–'} · ${workshop.stats.reviewsCount} reseñas`
      : 'Sin reseñas';

  return (
    <article className="explore-card">
      <Link href={`/workshops/${workshop.id}`} className="explore-card-link">
        <div className="explore-card-cover">
          <Image
            src={imageSrc}
            alt={workshop.title}
            fill
            sizes="(max-width: 767px) 104px, 280px"
            style={{ objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="explore-card-body">
          <div className="explore-card-main">
            <h3 className="explore-card-title">
              {workshop.title}
              {workshop.teacherName ? (
                <span className="explore-card-teacher">
                  {' '}
                  · {workshop.teacherName}
                </span>
              ) : null}
            </h3>
            {workshop.description?.trim() ? (
              <p className="explore-card-desc">
                {descriptionPreview(workshop.description)}
              </p>
            ) : null}
            <div className="explore-card-footer">
              <span className="explore-card-price">{formatPrice(workshop)}</span>
              <span className="explore-card-reviews">{reviewsLabel}</span>
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className={`explore-card-fav${favorited ? ' is-on' : ''}`}
        aria-label={favorited ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          {favorited ? (
            <path
              fill="currentColor"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          ) : (
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          )}
        </svg>
      </button>
    </article>
  );
}

