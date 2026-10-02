/**
 * Script para poblar Firestore con países y ciudades
 * Ejecutar con: npm run populate-locations
 * 
 * IMPORTANTE: Este script requiere que Firebase esté configurado y que tengas
 * permisos de escritura en Firestore.
 */

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

loadEnv({ path: resolve(process.cwd(), '.env.local') });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta ${name} en .env.local`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: required('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: required('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: required('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

// Países principales (empezamos con Argentina)
const COUNTRIES = [
  { id: 'AR', name: 'Argentina', code: 'AR' },
  // Puedes agregar más países aquí
];

// Provincias y ciudades principales de Argentina
const ARGENTINA_CITIES = [
  // Buenos Aires (CABA y GBA)
  { name: 'Buenos Aires', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'La Plata', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'Mar del Plata', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'Bahía Blanca', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'Quilmes', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'Lanús', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'San Isidro', province: 'Buenos Aires', countryCode: 'AR' },
  { name: 'Tigre', province: 'Buenos Aires', countryCode: 'AR' },
  
  // Córdoba
  { name: 'Córdoba', province: 'Córdoba', countryCode: 'AR' },
  { name: 'Villa María', province: 'Córdoba', countryCode: 'AR' },
  { name: 'Río Cuarto', province: 'Córdoba', countryCode: 'AR' },
  
  // Santa Fe
  { name: 'Rosario', province: 'Santa Fe', countryCode: 'AR' },
  { name: 'Santa Fe', province: 'Santa Fe', countryCode: 'AR' },
  { name: 'Rafaela', province: 'Santa Fe', countryCode: 'AR' },
  
  // Mendoza
  { name: 'Mendoza', province: 'Mendoza', countryCode: 'AR' },
  { name: 'San Rafael', province: 'Mendoza', countryCode: 'AR' },
  { name: 'Godoy Cruz', province: 'Mendoza', countryCode: 'AR' },
  
  // Tucumán
  { name: 'San Miguel de Tucumán', province: 'Tucumán', countryCode: 'AR' },
  { name: 'Yerba Buena', province: 'Tucumán', countryCode: 'AR' },
  
  // Salta
  { name: 'Salta', province: 'Salta', countryCode: 'AR' },
  { name: 'San Salvador de Jujuy', province: 'Jujuy', countryCode: 'AR' },
  
  // Otras provincias
  { name: 'San Juan', province: 'San Juan', countryCode: 'AR' },
  { name: 'Resistencia', province: 'Chaco', countryCode: 'AR' },
  { name: 'Corrientes', province: 'Corrientes', countryCode: 'AR' },
  { name: 'Posadas', province: 'Misiones', countryCode: 'AR' },
  { name: 'Paraná', province: 'Entre Ríos', countryCode: 'AR' },
  { name: 'Neuquén', province: 'Neuquén', countryCode: 'AR' },
  { name: 'Comodoro Rivadavia', province: 'Chubut', countryCode: 'AR' },
  { name: 'Río Gallegos', province: 'Santa Cruz', countryCode: 'AR' },
  { name: 'Ushuaia', province: 'Tierra del Fuego', countryCode: 'AR' },
  { name: 'La Rioja', province: 'La Rioja', countryCode: 'AR' },
  { name: 'Catamarca', province: 'Catamarca', countryCode: 'AR' },
  { name: 'Santiago del Estero', province: 'Santiago del Estero', countryCode: 'AR' },
  { name: 'Formosa', province: 'Formosa', countryCode: 'AR' },
  { name: 'Rawson', province: 'Chubut', countryCode: 'AR' },
  { name: 'Viedma', province: 'Río Negro', countryCode: 'AR' },
];

async function populateLocations() {
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🌍 Poblando países...');
    
    // Poblar países
    for (const country of COUNTRIES) {
      const countryRef = doc(db, 'countries', country.id);
      await setDoc(countryRef, {
        name: country.name,
        code: country.code,
      });
      console.log(`✅ País agregado: ${country.name}`);
    }

    console.log('\n🏙️  Poblando ciudades...');
    
    // Poblar ciudades
    let cityCount = 0;
    for (const city of ARGENTINA_CITIES) {
      const cityId = `${city.countryCode}_${city.name.replace(/\s+/g, '_').toLowerCase()}`;
      const cityRef = doc(db, 'cities', cityId);
      await setDoc(cityRef, {
        name: city.name,
        province: city.province,
        countryId: 'AR', // ID del país Argentina
        countryCode: city.countryCode,
      });
      cityCount++;
      console.log(`✅ Ciudad agregada: ${city.name}, ${city.province}`);
    }

    console.log(`\n✨ ¡Completado! Se agregaron ${COUNTRIES.length} países y ${cityCount} ciudades.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error poblando ubicaciones:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  populateLocations();
}

export { populateLocations };
