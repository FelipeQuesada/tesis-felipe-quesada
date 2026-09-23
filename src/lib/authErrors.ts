/**
 * Traduce códigos de error de Firebase Auth a mensajes claros en español.
 */
export function getAuthErrorMessage(
  err: unknown,
  fallback = 'Error al iniciar sesión'
): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: string }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.';
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Revisá tu internet.';
    case 'auth/popup-closed-by-user':
      return 'Cerraste la ventana de Google antes de completar el inicio de sesión.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana de Google. Permití popups e intentá de nuevo.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil.';
    case 'auth/api-key-not-valid':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Error de configuración de Firebase (API key). Revisá las variables de entorno.';
    default: {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        const msg = String((err as { message?: string }).message || '');
        if (msg.toLowerCase().includes('password') || msg.includes('credential')) {
          return 'Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.';
        }
      }
      return fallback;
    }
  }
}
