'use client';

import { useEffect, useRef } from 'react';
import type { Workshop } from '@/types';
import { GeoPoint } from 'firebase/firestore';

interface WorkshopsMapProps {
  workshops: Workshop[];
  onWorkshopClick?: (workshop: Workshop) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export function WorkshopsMap({ workshops, onWorkshopClick }: WorkshopsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadLeaflet = () => {
      // Cargar CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Cargar JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = () => {
          initializeMap();
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;

      // Inicializar mapa centrado en Argentina
      const map = window.L.map(mapRef.current).setView([-34.6037, -58.3816], 6); // Buenos Aires

      // Agregar tiles de OpenStreetMap
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Agregar marcadores para cada taller
      updateMarkers();
    };

    const updateMarkers = () => {
      if (!window.L || !mapInstanceRef.current) return;

      // Limpiar marcadores anteriores
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = [];

      // Filtrar talleres con coordenadas
      const workshopsWithGeo = workshops.filter((w) => w.location.geo);

      // Agregar marcadores
      workshopsWithGeo.forEach((workshop) => {
        const geo = workshop.location.geo as GeoPoint;
        const lat = geo.latitude;
        const lng = geo.longitude;

        // Crear marcador personalizado verde
        const customIcon = window.L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background: #4CAF50;
              width: 32px;
              height: 32px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-size: 16px;
              ">📍</div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(mapInstanceRef.current);

        // Agregar popup con información del taller
        const popupContent = `
          <div style="min-width: 220px; padding: 0.75rem;">
            <h3 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #333;">
              ${workshop.title}
            </h3>
            <p style="margin: 0 0 0.25rem 0; font-size: 0.875rem; color: #666;">
              📍 ${workshop.location.addressText || 'Sin dirección'}
            </p>
            <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #4CAF50; font-weight: 500;">
              ${workshop.categoryId}
            </p>
            <p style="margin: 0; font-size: 0.875rem; color: #333; font-weight: 600;">
              $${workshop.price} ${workshop.currency || 'ARS'}
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Agregar evento de clic para navegar al taller
        if (onWorkshopClick) {
          marker.on('click', () => {
            onWorkshopClick(workshop);
          });
        }

        markersRef.current.push(marker);
      });

      // Ajustar vista para mostrar todos los marcadores
      if (markersRef.current.length > 0) {
        const group = new window.L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      } else {
        // Si no hay marcadores, mantener vista centrada en Argentina
        mapInstanceRef.current.setView([-34.6037, -58.3816], 6);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [workshops, onWorkshopClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--divider)',
        zIndex: 0,
        background: '#f5f5f5',
      }}
    />
  );
}
