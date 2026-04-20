import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Country {
  id: string;
  name: string;
  code: string; // Código ISO (ej: AR, US, MX)
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  countryCode: string;
}

const COUNTRIES_COLLECTION = 'countries';
const CITIES_COLLECTION = 'cities';

/**
 * Obtiene todos los países ordenados por nombre
 */
export async function getCountries(): Promise<Country[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COUNTRIES_COLLECTION);
  const q = query(colRef, orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name ?? '',
    code: doc.data().code ?? '',
  }));
}

/**
 * Obtiene todas las ciudades de un país específico
 */
export async function getCitiesByCountry(countryId: string): Promise<City[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, CITIES_COLLECTION);
  
  console.log('🔍 Buscando ciudades con countryId:', countryId);
  
  try {
    // Primero intentar con orderBy (requiere índice compuesto)
    const q = query(
      colRef,
      where('countryId', '==', countryId),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log('✅ Documentos encontrados con orderBy:', querySnapshot.size);
    
    if (querySnapshot.size > 0) {
      const cities = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? '',
          countryId: data.countryId ?? '',
          countryCode: data.countryCode ?? '',
        };
      });
      console.log('📋 Primeras 5 ciudades:', cities.slice(0, 5));
      return cities;
    }
    
    // Si no hay resultados, intentar sin orderBy y ordenar en el cliente
    console.log('⚠️ No se encontraron resultados con orderBy, intentando sin orderBy...');
    const qWithoutOrder = query(
      colRef,
      where('countryId', '==', countryId)
    );
    
    const querySnapshot2 = await getDocs(qWithoutOrder);
    console.log('✅ Documentos encontrados sin orderBy:', querySnapshot2.size);
    
    const cities = querySnapshot2.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name ?? '',
        countryId: data.countryId ?? '',
        countryCode: data.countryCode ?? '',
      };
    });
    
    // Ordenar en el cliente
    cities.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log('📋 Primeras 5 ciudades (ordenadas en cliente):', cities.slice(0, 5));
    return cities;
    
  } catch (error: any) {
    console.error('❌ Error en getCitiesByCountry:', error);
    
    // Si el error es por índice faltante, intentar sin orderBy
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.log('⚠️ Error de índice, intentando sin orderBy...');
      try {
        const qWithoutOrder = query(
          colRef,
          where('countryId', '==', countryId)
        );
        const querySnapshot = await getDocs(qWithoutOrder);
        const cities = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name ?? '',
            countryId: data.countryId ?? '',
            countryCode: data.countryCode ?? '',
          };
        });
        cities.sort((a, b) => a.name.localeCompare(b.name));
        return cities;
      } catch (error2) {
        console.error('❌ Error también sin orderBy:', error2);
        throw error2;
      }
    }
    
    throw error;
  }
}

/**
 * Busca ciudades por nombre (con filtro opcional de país)
 */
export async function searchCities(searchQuery: string, countryId?: string): Promise<City[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, CITIES_COLLECTION);
  
  // Firestore no soporta búsqueda de texto completo, así que traemos todas y filtramos en el cliente
  // En producción, podrías usar Algolia o similar para búsqueda mejorada
  const constraints: any[] = [];
  if (countryId) {
    constraints.push(where('countryId', '==', countryId));
  }
  constraints.push(orderBy('name', 'asc'));
  
  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);
  
  const allCities = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name ?? '',
    countryId: doc.data().countryId ?? '',
    countryCode: doc.data().countryCode ?? '',
  }));
  
  // Si no hay query, retornar todas las ciudades (limitadas a 50)
  if (!searchQuery || searchQuery.trim().length === 0) {
    return allCities.slice(0, 50);
  }
  
  // Filtrar por nombre en el cliente (búsqueda case-insensitive)
  const queryLower = searchQuery.toLowerCase().trim();
  
  // Priorizar ciudades que empiezan con el query
  const startsWith = allCities.filter((city) =>
    city.name.toLowerCase().startsWith(queryLower)
  );
  
  // Ciudades que contienen el query pero no empiezan con él
  const contains = allCities.filter((city) =>
    city.name.toLowerCase().includes(queryLower) &&
    !city.name.toLowerCase().startsWith(queryLower)
  );
  
  // Combinar resultados (primero las que empiezan, luego las que contienen)
  return [...startsWith, ...contains].slice(0, 20);
}

/**
 * Obtiene un país por su código
 */
export async function getCountryByCode(code: string): Promise<Country | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COUNTRIES_COLLECTION);
  const q = query(colRef, where('code', '==', code));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    name: doc.data().name ?? '',
    code: doc.data().code ?? '',
  };
}

/**
 * Obtiene una ciudad por su ID
 */
export async function getCityById(cityId: string): Promise<City | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, CITIES_COLLECTION, cityId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name ?? '',
    countryId: data.countryId ?? '',
    countryCode: data.countryCode ?? '',
  };
}
