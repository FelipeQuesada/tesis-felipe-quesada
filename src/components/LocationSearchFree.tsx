'use client';

import { useState, useEffect, useRef } from 'react';

interface LocationSearchFreeProps {
  onLocationSelect: (location: {
    address: string;
    cityId?: string;
    countryId?: string;
    lat?: number;
    lng?: number;
  }) => void;
  placeholder?: string;
}

// Ciudades principales de Argentina para autocompletado rápido
const ARGENTINA_CITIES = [
  'Buenos Aires',
  'Córdoba',
  'Rosario',
  'Mendoza',
  'Tucumán',
  'La Plata',
  'Mar del Plata',
  'Salta',
  'Santa Fe',
  'San Juan',
  'Resistencia',
  'Santiago del Estero',
  'Corrientes',
  'Bahía Blanca',
  'Posadas',
  'Paraná',
  'Neuquén',
  'Formosa',
  'San Salvador de Jujuy',
  'La Rioja',
  'Catamarca',
  'Río Gallegos',
  'Rawson',
  'Viedma',
  'Ushuaia',
];

export function LocationSearchFree({ onLocationSelect, placeholder = 'Buscar ciudad o ubicación...' }: LocationSearchFreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Buscar ciudades locales primero (rápido)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const queryLower = searchQuery.toLowerCase();
    const localMatches = ARGENTINA_CITIES.filter((city) =>
      city.toLowerCase().includes(queryLower)
    ).slice(0, 5);

    setSuggestions(localMatches);
  }, [searchQuery]);

  // Buscar en OpenStreetMap Nominatim (gratuito)
  const searchNominatim = async (query: string) => {
    if (query.length < 3) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ar&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MiTaller App', // Requerido por Nominatim
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const nominatimResults = data.map((item: any) => item.display_name);
          const queryLower = query.toLowerCase();
          const localMatches = ARGENTINA_CITIES.filter((city) =>
            city.toLowerCase().includes(queryLower)
          );
          const combined = [...localMatches, ...nominatimResults].slice(0, 8);
          setSuggestions(combined);
        }
      }
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      // Si falla, usar solo ciudades locales
      const queryLower = query.toLowerCase();
      const localMatches = ARGENTINA_CITIES.filter((city) =>
        city.toLowerCase().includes(queryLower)
      ).slice(0, 5);
      setSuggestions(localMatches);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para búsqueda en Nominatim
  useEffect(() => {
    if (searchQuery.length < 3) return;
    const timeoutId = setTimeout(() => {
      searchNominatim(searchQuery);
    }, 500); // Esperar 500ms después de que el usuario deje de escribir
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectLocation = async (locationName: string) => {
    setSelectedLocation(locationName);
    setSearchQuery(locationName);
    setSuggestions([]);

    // Si es una ciudad local, usar datos básicos
    if (ARGENTINA_CITIES.includes(locationName)) {
      onLocationSelect({
        address: locationName,
        cityId: locationName,
        countryId: 'AR',
      });
      return;
    }

    // Si no, buscar detalles en Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1&countrycodes=ar&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MiTaller App',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const item = data[0];
          const city = item.address?.city || item.address?.town || item.address?.village || locationName;
          
          onLocationSelect({
            address: item.display_name || locationName,
            cityId: city,
            countryId: item.address?.country_code?.toUpperCase() || 'AR',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          });
        } else {
          // Fallback si no encuentra resultados
          onLocationSelect({
            address: locationName,
            cityId: locationName,
            countryId: 'AR',
          });
        }
      }
    } catch (error) {
      console.error('Error obteniendo detalles de ubicación:', error);
      onLocationSelect({
        address: locationName,
        cityId: locationName,
        countryId: 'AR',
      });
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSuggestions([]);
    onLocationSelect({
      address: '',
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
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
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem 0.75rem 3rem',
          border: '1px solid var(--divider)',
          borderRadius: '12px',
          fontSize: '1rem',
          background: 'white',
          paddingRight: selectedLocation ? '3rem' : '1rem',
        }}
      />
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            right: selectedLocation ? '3rem' : '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          Buscando...
        </div>
      )}
      {selectedLocation && !isLoading && (
        <button
          type="button"
          onClick={handleClear}
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
            color: 'var(--text-secondary)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
      
      {/* Lista de sugerencias */}
      {suggestions.length > 0 && (
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
            borderRadius: '12px',
            boxShadow: 'var(--elevation-2)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectLocation(suggestion)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                borderBottom: index < suggestions.length - 1 ? '1px solid var(--divider)' : 'none',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-green-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              📍 {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
