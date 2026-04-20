'use client';

import { WorkshopList } from './WorkshopList';
import { MyEnrollments } from './MyEnrollments';
import { FavoritesList } from './FavoritesList';

export function StudentDashboard() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>Talleres Disponibles</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Explora los talleres disponibles
        </p>
      </div>
      <WorkshopList />
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Mis Intereses</h3>
        <FavoritesList />
      </div>
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Mis Inscripciones</h3>
        <MyEnrollments />
      </div>
    </div>
  );
}
