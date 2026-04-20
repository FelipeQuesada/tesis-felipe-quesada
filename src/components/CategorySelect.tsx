'use client';

import { useState, useEffect, useRef } from 'react';
import { getCategories, searchCategories } from '@/services/category.service';
import type { Category } from '@/types';

interface CategorySelectProps {
  selectedCategoryIds: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  maxSelections?: number;
}

export function CategorySelect({
  selectedCategoryIds,
  onCategoriesChange,
  maxSelections,
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cargar categorías al montar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('📚 Cargando categorías en CategorySelect...');
        const categoriesData = await getCategories();
        console.log('✅ Categorías cargadas:', categoriesData.length, categoriesData);
        setCategories(categoriesData);
        // Filtrar categorías ya seleccionadas
        const available = categoriesData.filter(
          (cat) => !selectedCategoryIds.includes(cat.id)
        );
        setFilteredCategories(available);
        console.log('📋 Categorías disponibles (sin seleccionadas):', available.length);
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
        setCategories([]);
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Filtrar categorías cuando cambia el texto de búsqueda
  useEffect(() => {
    if (searchQuery.length >= 1) {
      const filter = async () => {
        try {
          const results = await searchCategories(searchQuery);
          // Excluir categorías ya seleccionadas
          const available = results.filter(
            (cat) => !selectedCategoryIds.includes(cat.id)
          );
          setFilteredCategories(available);
          setShowSuggestions(available.length > 0);
        } catch (error) {
          console.error('Error buscando categorías:', error);
          // Filtrar localmente como fallback
          const queryLower = searchQuery.toLowerCase();
          const filtered = categories.filter(
            (cat) =>
              cat.name.toLowerCase().includes(queryLower) &&
              !selectedCategoryIds.includes(cat.id)
          );
          setFilteredCategories(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      };
      filter();
    } else {
      // Si no hay texto, mostrar todas las categorías disponibles
      const available = categories.filter(
        (cat) => !selectedCategoryIds.includes(cat.id)
      );
      setFilteredCategories(available);
      setShowSuggestions(false);
    }
  }, [searchQuery, categories, selectedCategoryIds]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCategory = (category: Category) => {
    if (maxSelections && selectedCategoryIds.length >= maxSelections) {
      return;
    }
    if (!selectedCategoryIds.includes(category.id)) {
      onCategoriesChange([...selectedCategoryIds, category.id]);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onCategoriesChange(selectedCategoryIds.filter((id) => id !== categoryId));
  };

  const selectedCategories = categories.filter((cat) =>
    selectedCategoryIds.includes(cat.id)
  );

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <label htmlFor="interests" className="form-label">
        Intereses
      </label>
      
      {/* Categorías seleccionadas */}
      {selectedCategories.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {selectedCategories.map((category) => (
            <span
              key={category.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--primary-green)',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {category.icon && <span>{category.icon}</span>}
              {category.name}
              <button
                type="button"
                onClick={() => handleRemoveCategory(category.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0.25rem',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Campo de búsqueda */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          id="interests"
          type="text"
          className="form-input"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length >= 1) {
              setShowSuggestions(true);
            }
          }}
          onFocus={() => {
            if (filteredCategories.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={
            maxSelections && selectedCategoryIds.length >= maxSelections
              ? `Máximo ${maxSelections} categorías seleccionadas`
              : 'Buscar categorías de interés...'
          }
          disabled={loading || (maxSelections !== undefined && selectedCategoryIds.length >= maxSelections)}
          style={{
            width: '100%',
            padding: '0.75rem',
            paddingRight: searchQuery ? '2.5rem' : '0.75rem',
            border: '1px solid var(--divider)',
            borderRadius: '8px',
            fontSize: '1rem',
            background: 'white',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setShowSuggestions(false);
            }}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Sugerencias de categorías */}
      {showSuggestions && filteredCategories.length > 0 && !loading && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            background: 'white',
            border: '1px solid var(--divider)',
            borderRadius: '8px',
            boxShadow: 'var(--elevation-2)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {filteredCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleAddCategory(category)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--divider)',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-green-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
          Cargando categorías...
        </small>
      )}
      {!loading && categories.length === 0 && (
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
          No hay categorías disponibles
        </small>
      )}
      {maxSelections && selectedCategoryIds.length >= maxSelections && (
        <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
          Has alcanzado el máximo de {maxSelections} categorías
        </small>
      )}
    </div>
  );
}
