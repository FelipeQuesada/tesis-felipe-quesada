import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  Workshop,
  WorkshopCreateInput,
  WorkshopStatus,
  WorkshopSearchFilters,
} from '@/types';

const COLLECTION = 'workshops';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

/**
 * Geocodifica una dirección usando OpenStreetMap Nominatim (gratuito)
 * Convierte una dirección de texto a coordenadas lat/lng
 */
async function geocodeAddress(address: string, city?: string, country?: string): Promise<GeoPoint | null> {
  try {
    // Construir query de búsqueda
    let query = address;
    if (city) query += `, ${city}`;
    if (country) query += `, ${country}`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MiTaller App',
        },
      }
    );

    if (!response.ok) {
      console.warn('Error en geocodificación:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return new GeoPoint(lat, lng);
      }
    }

    return null;
  } catch (error) {
    console.error('Error geocodificando dirección:', error);
    return null;
  }
}

function docToWorkshop(docId: string, data: any): Workshop {
  return {
    id: docId,
    title: data.title ?? '',
    description: data.description ?? '',
    categoryId: data.categoryId ?? '',
    teacherId: data.teacherId ?? '',
    teacherName: data.teacherName,
    price: data.price ?? 0,
    currency: data.currency ?? 'ARS',
    capacity: data.capacity ?? 0,
    status: data.status ?? 'draft',
    location: data.location ?? { addressText: '' },
    coverImageUrl: data.coverImageUrl,
    difficultyLevel: data.difficultyLevel,
    language: data.language,
    targetAgeMin: data.targetAgeMin,
    targetAgeMax: data.targetAgeMax,
    targetGender: data.targetGender,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    publishedAt: data.publishedAt ? timestampToDate(data.publishedAt) : undefined,
    stats: data.stats ?? {
      enrolledCount: 0,
      reviewsCount: 0,
      avgRating: 0,
    },
  };
}

/**
 * Creates a new workshop in draft status
 */
export async function createWorkshop(
  teacherId: string,
  input: WorkshopCreateInput,
  teacherName?: string
): Promise<Workshop> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const now = serverTimestamp();

  // Geocodificar la dirección si no tiene coordenadas
  let locationWithGeo = { ...input.location };
  if (!locationWithGeo.geo && locationWithGeo.addressText) {
    const geoPoint = await geocodeAddress(
      locationWithGeo.addressText,
      locationWithGeo.cityId,
      locationWithGeo.countryId
    );
    if (geoPoint) {
      locationWithGeo.geo = geoPoint;
    }
  }

  const docData = {
    ...input,
    location: locationWithGeo,
    teacherId,
    teacherName: teacherName ?? '',
    status: 'draft' as WorkshopStatus,
    currency: input.currency ?? 'ARS',
    createdAt: now,
    updatedAt: now,
    stats: {
      enrolledCount: 0,
      reviewsCount: 0,
      avgRating: 0,
    },
  };

  const docRef = await addDoc(colRef, docData);
  const docSnap = await getDoc(docRef);
  return docToWorkshop(docSnap.id, docSnap.data());
}

/**
 * Publishes a workshop (changes status to published and sets publishedAt)
 */
export async function publishWorkshop(workshopId: string): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, workshopId);
  await updateDoc(docRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Unpublishes a workshop (changes status to draft)
 */
export async function unpublishWorkshop(workshopId: string): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, workshopId);
  await updateDoc(docRef, {
    status: 'draft',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Search published workshops with filters
 */
export async function searchWorkshops(
  filters: WorkshopSearchFilters = {}
): Promise<Workshop[]> {
  const all = await listPublishedWorkshops();
  let result = all;

  if (filters.searchText) {
    const q = filters.searchText.toLowerCase();
    result = result.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.categoryId.toLowerCase().includes(q)
    );
  }
  if (filters.categoryId) {
    result = result.filter((w) => w.categoryId === filters.categoryId);
  }
  if (filters.cityId) {
    result = result.filter((w) => w.location?.cityId === filters.cityId);
  }
  if (filters.countryId) {
    result = result.filter((w) => w.location?.countryId === filters.countryId);
  }
  if (filters.priceMin != null) {
    result = result.filter((w) => w.price >= filters.priceMin!);
  }
  if (filters.priceMax != null) {
    result = result.filter((w) => w.price <= filters.priceMax!);
  }
  if (filters.difficultyLevel) {
    result = result.filter((w) => w.difficultyLevel === filters.difficultyLevel);
  }
  if (filters.language) {
    result = result.filter((w) => w.language === filters.language);
  }
  if (filters.targetAgeMin != null) {
    result = result.filter((w) => (w.targetAgeMax ?? 999) >= filters.targetAgeMin!);
  }
  if (filters.targetAgeMax != null) {
    result = result.filter((w) => (w.targetAgeMin ?? 0) <= filters.targetAgeMax!);
  }
  if (filters.targetGender) {
    result = result.filter((w) => !w.targetGender || w.targetGender === filters.targetGender);
  }
  if (filters.minRating != null) {
    result = result.filter((w) => (w.stats?.avgRating ?? 0) >= filters.minRating!);
  }

  return result;
}

/**
 * Lists all published workshops
 */
export async function listPublishedWorkshops(): Promise<Workshop[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  // Solo usar where para evitar necesidad de índice compuesto
  // Ordenaremos en el cliente
  const q = query(
    colRef,
    where('status', '==', 'published')
  );

  const querySnapshot = await getDocs(q);
  const workshops = querySnapshot.docs.map((doc) => docToWorkshop(doc.id, doc.data()));
  
  // Ordenar por publishedAt en el cliente (más recientes primero)
  return workshops.sort((a, b) => {
    const dateA = a.publishedAt?.getTime() || 0;
    const dateB = b.publishedAt?.getTime() || 0;
    return dateB - dateA; // Descendente
  });
}

/**
 * Talleres publicados cuya categoría está en `categoryIds` (filtro en cliente).
 */
export async function listPublishedWorkshopsByCategoryIds(
  categoryIds: string[],
  maxResults = 8
): Promise<Workshop[]> {
  if (categoryIds.length === 0) return [];
  const all = await listPublishedWorkshops();
  return all.filter((w) => categoryIds.includes(w.categoryId)).slice(0, maxResults);
}

/**
 * Lista talleres para administración (requiere rol admin en reglas).
 */
export async function listAllWorkshopsAdmin(maxResults = 100): Promise<Workshop[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxResults));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => docToWorkshop(d.id, d.data()));
}

/**
 * Lists workshops by teacher
 */
export async function listTeacherWorkshops(
  teacherId: string
): Promise<Workshop[]> {
  if (!db) throw new Error('Firestore no está inicializado');
  const colRef = collection(db, COLLECTION);
  // Evita índice compuesto (`teacherId + createdAt`) y ordena en cliente.
  const q = query(colRef, where('teacherId', '==', teacherId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => docToWorkshop(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Gets workshop by ID
 */
export async function getWorkshopById(workshopId: string): Promise<Workshop | null> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, workshopId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToWorkshop(docSnap.id, docSnap.data());
}

/**
 * Updates a workshop
 */
export async function updateWorkshop(
  workshopId: string,
  input: Partial<WorkshopCreateInput>
): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, workshopId);
  
  // Si se actualiza la ubicación y no tiene coordenadas, geocodificar
  let updateData: any = { ...input };
  if (input.location && !input.location.geo && input.location.addressText) {
    const geoPoint = await geocodeAddress(
      input.location.addressText,
      input.location.cityId,
      input.location.countryId
    );
    if (geoPoint) {
      updateData.location = {
        ...input.location,
        geo: geoPoint,
      };
    }
  }
  
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Deletes a workshop (teacher can delete only their own, admin can delete any)
 */
export async function deleteWorkshop(workshopId: string): Promise<void> {
  if (!db) throw new Error('Firestore no está inicializado');
  const docRef = doc(db, COLLECTION, workshopId);
  await deleteDoc(docRef);
}
