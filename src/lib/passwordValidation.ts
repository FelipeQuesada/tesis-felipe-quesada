/**
 * Validates password meets requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una mayúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos una minúscula' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir al menos un carácter especial' };
  }
  return { valid: true };
}

export const PASSWORD_REQUIREMENTS = [
  'Mínimo 8 caracteres',
  'Al menos una mayúscula',
  'Al menos una minúscula',
  'Al menos un carácter especial (!@#$%^&* etc.)',
];
