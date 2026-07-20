import { GeoPoint } from 'firebase/firestore';

export type WorkshopStatus = 'draft' | 'published' | 'cancelled';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type TargetGender = 'all' | 'male' | 'female' | 'mixed';

export interface WorkshopLocation {
  addressText: string;
  cityId?: string;
  countryId?: string;
  geo?: GeoPoint;
  placeId?: string;
}

export interface WorkshopStats {
  enrolledCount: number;
  reviewsCount: number;
  avgRating: number;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  teacherId: string;
  teacherName?: string;
  price: number;
  currency: string;
  capacity: number;
  status: WorkshopStatus;
  location: WorkshopLocation;
  coverImageUrl?: string;
  difficultyLevel?: DifficultyLevel;
  language?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGender?: TargetGender;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  stats: WorkshopStats;
}

export interface WorkshopSearchFilters {
  searchText?: string;
  categoryId?: string;
  cityId?: string;
  countryId?: string;
  priceMin?: number;
  priceMax?: number;
  difficultyLevel?: DifficultyLevel;
  language?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGender?: TargetGender;
  minRating?: number;
}

/** Payload para crear / actualizar taller (Firestore). */
export interface WorkshopCreateInput {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  currency?: string;
  capacity: number;
  location: WorkshopLocation;
  coverImageUrl?: string;
  difficultyLevel?: DifficultyLevel;
  language?: string;
  targetAgeMin?: number;
  targetAgeMax?: number;
  targetGender?: TargetGender;
}
