import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  GeoPoint,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFirestoreDb } from '../lib/firebase';
import type {
  Workshop,
  WorkshopCreateInput,
  WorkshopSearchFilters,
  WorkshopStatus,
} from '../types';

const COLLECTION = 'workshops';

function timestampToDate(timestamp: Timestamp | Date | null | undefined): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

function docToWorkshop(docId: string, data: Record<string, unknown>): Workshop {
  const location = (data.location as Workshop['location']) ?? {
    addressText: '',
  };
  const statsRaw = data.stats as Workshop['stats'] | undefined;

  return {
    id: docId,
    title: (data.title as string) ?? '',
    description: (data.description as string) ?? '',
    categoryId: (data.categoryId as string) ?? '',
    teacherId: (data.teacherId as string) ?? '',
    teacherName: data.teacherName as string | undefined,
    price: (data.price as number) ?? 0,
    currency: (data.currency as string) ?? 'ARS',
    capacity: (data.capacity as number) ?? 0,
    status: (data.status as WorkshopStatus) ?? 'draft',
    location,
    coverImageUrl: data.coverImageUrl as string | undefined,
    difficultyLevel: data.difficultyLevel as Workshop['difficultyLevel'],
    language: data.language as string | undefined,
    targetAgeMin: data.targetAgeMin as number | undefined,
    targetAgeMax: data.targetAgeMax as number | undefined,
    targetGender: data.targetGender as Workshop['targetGender'],
    createdAt: timestampToDate(data.createdAt as Timestamp | undefined),
    updatedAt: timestampToDate(data.updatedAt as Timestamp | undefined),
    publishedAt: data.publishedAt
      ? timestampToDate(data.publishedAt as Timestamp)
      : undefined,
    stats: statsRaw ?? {
      enrolledCount: 0,
      reviewsCount: 0,
      avgRating: 0,
    },
  };
}

export async function listPublishedWorkshops(): Promise<Workshop[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);
  const workshops = querySnapshot.docs.map((d) =>
    docToWorkshop(d.id, d.data() as Record<string, unknown>)
  );
  return workshops.sort((a, b) => {
    const dateA = a.publishedAt?.getTime() ?? 0;
    const dateB = b.publishedAt?.getTime() ?? 0;
    return dateB - dateA;
  });
}

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
    result = result.filter(
      (w) => (w.targetAgeMax ?? 999) >= filters.targetAgeMin!
    );
  }
  if (filters.targetAgeMax != null) {
    result = result.filter(
      (w) => (w.targetAgeMin ?? 0) <= filters.targetAgeMax!
    );
  }
  if (filters.targetGender) {
    result = result.filter(
      (w) => !w.targetGender || w.targetGender === filters.targetGender
    );
  }
  if (filters.minRating != null) {
    result = result.filter(
      (w) => (w.stats?.avgRating ?? 0) >= filters.minRating!
    );
  }

  return result;
}

export async function getWorkshopById(
  workshopId: string
): Promise<Workshop | null> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, workshopId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docToWorkshop(docSnap.id, docSnap.data() as Record<string, unknown>);
}

async function geocodeAddress(
  address: string,
  city?: string,
  country?: string
): Promise<GeoPoint | null> {
  try {
    let q = address;
    if (city) q += `, ${city}`;
    if (country) q += `, ${country}`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MiTallerMobile/1.0 (contact: app)',
        },
      }
    );

    if (!response.ok) return null;
    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (data?.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return new GeoPoint(lat, lng);
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function createWorkshop(
  teacherId: string,
  input: WorkshopCreateInput,
  teacherName?: string
): Promise<Workshop> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION);
  const now = serverTimestamp();

  let locationWithGeo = { ...input.location };
  if (!locationWithGeo.geo && locationWithGeo.addressText) {
    const geoPoint = await geocodeAddress(
      locationWithGeo.addressText,
      locationWithGeo.cityId,
      locationWithGeo.countryId
    );
    if (geoPoint) {
      locationWithGeo = { ...locationWithGeo, geo: geoPoint };
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
  return docToWorkshop(docSnap.id, docSnap.data() as Record<string, unknown>);
}

export async function publishWorkshop(workshopId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, workshopId);
  await updateDoc(docRef, {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function unpublishWorkshop(workshopId: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, workshopId);
  await updateDoc(docRef, {
    status: 'draft',
    updatedAt: serverTimestamp(),
  });
}

export async function listTeacherWorkshops(
  teacherId: string
): Promise<Workshop[]> {
  const db = getFirestoreDb();
  const colRef = collection(db, COLLECTION);
  const q = query(colRef, where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((d) => docToWorkshop(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Talleres publicados del profesor (p. ej. blog del mismo autor). */
export async function listPublishedWorkshopsByTeacherId(
  teacherId: string,
  maxResults = 8
): Promise<Workshop[]> {
  if (!teacherId?.trim()) return [];
  const list = await listTeacherWorkshops(teacherId);
  return list
    .filter((w) => w.status === 'published')
    .slice(0, maxResults);
}

export async function updateWorkshop(
  workshopId: string,
  input: Partial<WorkshopCreateInput>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, workshopId);

  let updatePayload: Record<string, unknown> = { ...input };

  if (input.location && !input.location.geo && input.location.addressText) {
    const geoPoint = await geocodeAddress(
      input.location.addressText,
      input.location.cityId,
      input.location.countryId
    );
    if (geoPoint) {
      updatePayload = {
        ...updatePayload,
        location: {
          ...input.location,
          geo: geoPoint,
        },
      };
    }
  }

  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [key, val] of Object.entries(updatePayload)) {
    if (val !== undefined) payload[key] = val;
  }

  await updateDoc(docRef, payload);
}
