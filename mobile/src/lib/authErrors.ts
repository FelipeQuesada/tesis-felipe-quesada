/** Mensajes claros para errores de Firebase Auth. */
export function mapAuthErrorMessage(err: unknown): string {
  const code =
    err !== null &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
      ? (err as { code: string }).code
      : '';

  const raw = err instanceof Error ? err.message : String(err);
  const normalized = code || raw;

  if (
    normalized.includes('auth/email-already-in-use') ||
    raw.includes('email-already-in-use')
  ) {
    return 'Ese correo ya tiene una cuenta. Probá iniciar sesión o usá otro email.';
  }
  if (
    normalized.includes('auth/invalid-email') ||
    raw.includes('invalid-email')
  ) {
    return 'El correo no es válido. Revisá que esté bien escrito.';
  }
  if (
    normalized.includes('auth/weak-password') ||
    raw.includes('weak-password')
  ) {
    return 'La contraseña es demasiado débil. Usá al menos 8 caracteres con mayúscula, minúscula y un símbolo.';
  }
  if (
    normalized.includes('auth/wrong-password') ||
    normalized.includes('auth/invalid-credential') ||
    raw.includes('wrong-password') ||
    raw.includes('invalid-credential')
  ) {
    return 'Correo o contraseña incorrectos.';
  }
  if (
    normalized.includes('auth/user-not-found') ||
    raw.includes('user-not-found')
  ) {
    return 'No encontramos una cuenta con ese correo.';
  }
  if (
    normalized.includes('auth/too-many-requests') ||
    raw.includes('too-many-requests')
  ) {
    return 'Demasiados intentos. Esperá un momento y volvé a probar.';
  }
  if (
    normalized.includes('auth/network-request-failed') ||
    raw.includes('network-request-failed')
  ) {
    return 'Sin conexión. Revisá tu internet e intentá de nuevo.';
  }

  // Si viene el string crudo de Firebase, no lo mostremos tal cual.
  if (raw.startsWith('Firebase:')) {
    return 'No se pudo completar la operación. Revisá los datos e intentá de nuevo.';
  }

  return raw || 'Ocurrió un error. Intentá de nuevo.';
}
