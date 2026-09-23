export type UserRole = 'student' | 'teacher' | 'admin';
export type DocumentType = 'dni' | 'pasaporte' | 'cedula' | 'otro';
/** Género para saludos; sin valor → se usa forma universal "bienvenido". */
export type UserGender = 'female' | 'male' | 'other';

export interface User {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  role: UserRole;
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: UserGender;
  countryId?: string;
  cityId?: string;
  birthDate?: string;
  age?: number;
  phoneNumber?: string;
  phoneCountryCode?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  interests?: string[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserRegistrationProfile {
  username: string;
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  documentType: DocumentType;
  documentNumber: string;
}

/** Campos editables del perfil (Firestore / Auth); sin `role` ni pagos. */
export interface UserProfileUpdate {
  displayName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: UserGender | null;
  photoURL?: string;
  countryId?: string;
  cityId?: string;
  birthDate?: string;
  age?: number;
  phoneNumber?: string;
  phoneCountryCode?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  interests?: string[];
  bio?: string;
}

/**
 * Forma del saludo. Default universal: "bienvenido".
 * Solo "bienvenida" si el perfil indica género femenino.
 */
export function welcomeAdjective(gender?: UserGender | null): 'bienvenida' | 'bienvenido' {
  return gender === 'female' ? 'bienvenida' : 'bienvenido';
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}
