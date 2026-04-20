'use client';

import { useState } from 'react';
import type { WorkshopSearchFilters, DifficultyLevel, TargetGender } from '@/types';

interface Props {
  filters: WorkshopSearchFilters;
  onChange: (filters: WorkshopSearchFilters) => void;
}

export function WorkshopFilters({ filters, onChange }: Props) {
  const [searchText, setSearchText] = useState(filters.searchText || '');
  const [categoryId, setCategoryId] = useState(filters.categoryId || '');
  const [cityId, setCityId] = useState(filters.cityId || '');
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() || '');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | ''>(
    filters.difficultyLevel || ''
  );
  const [language, setLanguage] = useState(filters.language || '');
  const [minRating, setMinRating] = useState(filters.minRating?.toString() || '');

  const applyFilters = () => {
    onChange({
      searchText: searchText || undefined,
      categoryId: categoryId || undefined,
      cityId: cityId || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      difficultyLevel: difficultyLevel || undefined,
      language: language || undefined,
      minRating: minRating ? Number(minRating) : undefined,
    });
  };

  const clearFilters = () => {
    setSearchText('');
    setCategoryId('');
    setCityId('');
    setPriceMin('');
    setPriceMax('');
    setDifficultyLevel('');
    setLanguage('');
    setMinRating('');
    onChange({});
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Filtros</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Buscar</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nombre, categoría..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej: Cocina"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Ciudad</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej: Buenos Aires"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Precio mínimo (ARS)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Precio máximo (ARS)</label>
          <input
            type="number"
            className="form-input"
            placeholder="100000"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nivel</label>
          <select
            className="form-select"
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value as DifficultyLevel | '')}
          >
            <option value="">Todos</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Idioma</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ej: es, en"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Rating mínimo</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            max="5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button onClick={applyFilters} className="btn btn-primary">
          Buscar
        </button>
        <button onClick={clearFilters} className="btn btn-secondary">
          Limpiar
        </button>
      </div>
    </div>
  );
}
