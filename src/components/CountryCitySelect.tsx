'use client';

import { useState, useEffect, useRef } from 'react';
import { getCountries, getCitiesByCountry, searchCities, type Country, type City } from '@/services/location.service';

interface CountryCitySelectProps {
  selectedCountryId?: string;
  selectedCityId?: string;
  onCountryChange: (countryId: string, countryName: string) => void;
  onCityChange: (cityId: string, cityName: string) => void;
}

export function CountryCitySelect({
  selectedCountryId,
  selectedCityId,
  onCountryChange,
  onCityChange,
}: CountryCitySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Cargar países al montar
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await getCountries();
        setCountries(countriesData);
        // Si hay un país seleccionado pero no está en la lista, intentar encontrarlo
        if (selectedCountryId && countriesData.length > 0) {
          const foundCountry = countriesData.find((c) => c.id === selectedCountryId);
          if (!foundCountry) {
            console.warn(`País con ID "${selectedCountryId}" no encontrado en la lista`);
          }
        }
      } catch (error) {
        console.error('Error cargando países:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Cargar ciudades cuando se selecciona un país
  useEffect(() => {
    if (selectedCountryId) {
      setLoadingCities(true);
      setCitySearchQuery(''); // Limpiar búsqueda al cambiar país
      const loadCities = async () => {
        try {
          console.log('Cargando ciudades para país:', selectedCountryId);
          const citiesData = await getCitiesByCountry(selectedCountryId);
          console.log('Ciudades cargadas:', citiesData.length, citiesData);
          setCities(citiesData);
          setFilteredCities(citiesData);
          // Mostrar sugerencias si hay ciudades disponibles
          if (citiesData.length > 0) {
            setShowCitySuggestions(true);
            console.log('Mostrando sugerencias de ciudades');
          } else {
            console.warn('No se encontraron ciudades para el país:', selectedCountryId);
            setShowCitySuggestions(false);
          }
        } catch (error) {
          console.error('Error cargando ciudades:', error);
          setCities([]);
          setFilteredCities([]);
          setShowCitySuggestions(false);
        } finally {
          setLoadingCities(false);
        }
      };
      loadCities();
    } else {
      setCities([]);
      setFilteredCities([]);
      setCitySearchQuery('');
      setShowCitySuggestions(false);
    }
  }, [selectedCountryId]);

  // Buscar ciudades cuando cambia el texto de búsqueda
  useEffect(() => {
    if (!selectedCountryId) {
      setFilteredCities([]);
      setShowCitySuggestions(false);
      return;
    }

    console.log('🔍 Búsqueda de ciudades:', {
      citySearchQuery,
      selectedCountryId,
      citiesCount: cities.length,
    });

    // Si hay texto de búsqueda, buscar ciudades
    if (citySearchQuery.length >= 1) {
      // Filtrar localmente primero (más rápido)
      const queryLower = citySearchQuery.toLowerCase().trim();
      const localFiltered = cities.filter((city) =>
        city.name.toLowerCase().includes(queryLower)
      );
      
      console.log('📋 Filtrado local:', localFiltered.length, 'ciudades');
      setFilteredCities(localFiltered);
      setShowCitySuggestions(localFiltered.length > 0);
      
      // También buscar en Firestore con debounce (para ciudades que puedan no estar cargadas)
      const timeoutId = setTimeout(async () => {
        try {
          const results = await searchCities(citySearchQuery, selectedCountryId);
          console.log('📋 Resultados de Firestore:', results.length, 'ciudades');
          if (results.length > localFiltered.length) {
            // Si Firestore tiene más resultados, usar esos
            setFilteredCities(results);
            setShowCitySuggestions(true);
          }
        } catch (error) {
          console.error('Error buscando ciudades en Firestore:', error);
          // Mantener el filtrado local
        }
      }, 300); // Esperar 300ms antes de buscar

      return () => clearTimeout(timeoutId);
    } else {
      // Si no hay texto, mostrar todas las ciudades del país
      console.log('📋 Mostrando todas las ciudades:', cities.length);
      setFilteredCities(cities);
      setShowCitySuggestions(cities.length > 0);
    }
  }, [citySearchQuery, selectedCountryId, cities]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCitySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    onCityChange(city.id, city.name);
    setCitySearchQuery(city.name);
    setShowCitySuggestions(false);
  };

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);
  const selectedCity = cities.find((c) => c.id === selectedCityId);

  // Inicializar el texto de búsqueda cuando se carga una ciudad seleccionada
  useEffect(() => {
    if (selectedCity && !citySearchQuery) {
      setCitySearchQuery(selectedCity.name);
    }
  }, [selectedCity]);

  // Si hay un cityId seleccionado pero no está en la lista cargada, intentar cargarlo
  useEffect(() => {
    if (selectedCityId && !selectedCity && selectedCountryId && cities.length > 0) {
      // El cityId podría ser un texto antiguo, intentar buscarlo
      const searchForCity = async () => {
        try {
          const results = await searchCities(selectedCityId, selectedCountryId);
          if (results.length > 0) {
            // Si encontramos una coincidencia, seleccionarla
            onCityChange(results[0].id, results[0].name);
            setCitySearchQuery(results[0].name);
          } else {
            // Si no encontramos, mostrar el texto como placeholder
            setCitySearchQuery(selectedCityId);
          }
        } catch (error) {
          console.error('Error buscando ciudad:', error);
          // Si falla, mostrar el ID como texto
          setCitySearchQuery(selectedCityId);
        }
      };
      searchForCity();
    }
  }, [selectedCityId, selectedCity, selectedCountryId, cities.length]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      {/* Selector de País */}
      <div className="form-group">
        <label htmlFor="countryId" className="form-label">
          País *
        </label>
        <select
          id="countryId"
          className="form-input"
          value={selectedCountryId || ''}
            onChange={(e) => {
              const selectedValue = e.target.value;
              console.log('🌍 País seleccionado:', selectedValue);
              console.log('📋 Países disponibles:', countries.map(c => ({ id: c.id, name: c.name })));
              if (selectedValue) {
                const country = countries.find((c) => c.id === selectedValue);
                if (country) {
                  console.log('✅ País encontrado, llamando onCountryChange:', country);
                  onCountryChange(country.id, country.name);
                  onCityChange('', ''); // Limpiar ciudad al cambiar país
                  setCitySearchQuery('');
                } else {
                  console.warn('⚠️ País no encontrado para ID:', selectedValue);
                }
              } else {
                // Si se selecciona la opción vacía, limpiar todo
                onCountryChange('', '');
                onCityChange('', '');
                setCitySearchQuery('');
              }
            }}
          required
          disabled={loadingCountries}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--divider)',
            borderRadius: '8px',
            fontSize: '1rem',
            background: loadingCountries ? '#f5f5f5' : 'white',
            cursor: loadingCountries ? 'not-allowed' : 'pointer',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          }}
        >
          <option value="">Selecciona un país</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
        {loadingCountries && (
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Cargando países...
          </small>
        )}
      </div>

      {/* Selector de Ciudad con búsqueda */}
      <div className="form-group" style={{ position: 'relative' }}>
        <label htmlFor="cityId" className="form-label">
          Ciudad *
        </label>
        <div style={{ position: 'relative' }}>
          <input
            ref={cityInputRef}
            id="cityId"
            type="text"
            className="form-input"
            value={citySearchQuery || selectedCity?.name || ''}
            onChange={(e) => {
              const value = e.target.value;
              setCitySearchQuery(value);
              // Las sugerencias se mostrarán automáticamente en el useEffect
            }}
            onFocus={() => {
              console.log('🔍 Focus en campo de ciudad');
              console.log('  - selectedCountryId:', selectedCountryId);
              console.log('  - cities.length:', cities.length);
              console.log('  - filteredCities.length:', filteredCities.length);
              console.log('  - citySearchQuery:', citySearchQuery);
              
              // Al hacer focus, mostrar todas las ciudades si no hay texto, o las filtradas si hay texto
              if (selectedCountryId && cities.length > 0) {
                if (citySearchQuery.length === 0) {
                  console.log('  - Mostrando todas las ciudades:', cities.length);
                  setFilteredCities(cities);
                  setShowCitySuggestions(true);
                } else {
                  console.log('  - Mostrando ciudades filtradas:', filteredCities.length);
                  setShowCitySuggestions(filteredCities.length > 0);
                }
              } else if (selectedCountryId && cities.length === 0 && !loadingCities) {
                console.log('  - No hay ciudades cargadas, intentando cargar...');
                // Si no hay ciudades pero hay país seleccionado, intentar cargar
                const loadCities = async () => {
                  try {
                    const citiesData = await getCitiesByCountry(selectedCountryId);
                    setCities(citiesData);
                    setFilteredCities(citiesData);
                    setShowCitySuggestions(citiesData.length > 0);
                  } catch (error) {
                    console.error('Error cargando ciudades en focus:', error);
                  }
                };
                loadCities();
              }
            }}
            placeholder={selectedCountryId ? 'Buscar ciudad...' : 'Primero selecciona un país'}
            disabled={!selectedCountryId || loadingCities}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              paddingRight: selectedCityId ? '2.5rem' : '0.75rem',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'white',
              cursor: !selectedCountryId || loadingCities ? 'not-allowed' : 'text',
            }}
          />
          {selectedCityId && (
            <button
              type="button"
              onClick={() => {
                onCityChange('', '');
                setCitySearchQuery('');
                setShowCitySuggestions(false);
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
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Sugerencias de ciudades */}
        {showCitySuggestions && filteredCities.length > 0 && selectedCountryId && !loadingCities && (
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
            {filteredCities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleCitySelect(city)}
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-green-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                📍 {city.name}
              </button>
            ))}
          </div>
        )}

        {loadingCities && (
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
            Cargando ciudades...
          </small>
        )}
        {!selectedCountryId && (
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
            Primero selecciona un país
          </small>
        )}
        {selectedCountryId && !loadingCities && cities.length === 0 && (
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
            No hay ciudades disponibles para este país
          </small>
        )}
        {selectedCountryId && !loadingCities && citySearchQuery.length > 0 && filteredCities.length === 0 && (
          <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'block', marginTop: '0.5rem' }}>
            No se encontraron ciudades con "{citySearchQuery}"
          </small>
        )}
      </div>
    </div>
  );
}
