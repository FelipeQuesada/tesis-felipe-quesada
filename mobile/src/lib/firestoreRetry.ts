import { enableNetwork } from 'firebase/firestore';
import { Platform } from 'react-native';
import { getFirestoreDb } from './firebase';

/** Código/mensaje legible de errores Firebase en UI y logs. */
export function getFirestoreErrorDetails(err: unknown): {
  code: string;
  message: string;
} {
  if (err !== null && typeof err === 'object') {
    const code =
      'code' in err && typeof (err as { code: unknown }).code === 'string'
        ? (err as { code: string }).code
        : '';
    const message =
      err instanceof Error ? err.message : String(err);
    return { code, message };
  }
  return { code: '', message: String(err) };
}

const NATIVE_WARMUP_MS = 600;

async function ensureFirestoreOnline(): Promise<void> {
  if (Platform.OS === 'web') return;
  await new Promise((r) => setTimeout(r, NATIVE_WARMUP_MS));
  try {
    await enableNetwork(getFirestoreDb());
  } catch {
    // Ya en línea o init pendiente
  }
}

/** Errores de red / timeout de Firestore (no son reglas "permission-denied"). */
export function isTransientFirestoreError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const code =
    err !== null &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
      ? (err as { code: string }).code
      : '';

  return (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'resource-exhausted' ||
    msg.includes('could not reach') ||
    msg.includes('backend didn') ||
    msg.includes('unavailable') ||
    msg.includes('deadline-exceeded') ||
    msg.includes('timed out') ||
    msg.includes('network') ||
    msg.includes('Failed to get document') ||
    msg.includes('client is offline')
  );
}

export function isFirestorePermissionError(err: unknown): boolean {
  const code =
    err !== null &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as { code: unknown }).code === 'string'
      ? (err as { code: string }).code
      : '';
  const msg = err instanceof Error ? err.message : String(err);
  return code === 'permission-denied' || msg.includes('permission');
}

export interface FirestoreRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, maxAttempts: number) => void;
}

export function getDefaultFirestoreRetryOptions(): Required<
  Omit<FirestoreRetryOptions, 'onRetry'>
> {
  if (Platform.OS === 'web') {
    return { maxAttempts: 5, baseDelayMs: 2500, maxDelayMs: 10000 };
  }
  /** Celular: más intentos y pausas más largas (el SDK suele cortar ~10s por intento). */
  return { maxAttempts: 10, baseDelayMs: 4000, maxDelayMs: 18000 };
}

/**
 * Reintenta operaciones de Firestore ante timeouts / red inestable.
 * En móvil puede tardar ~1–2 min en total antes de fallar.
 */
export async function runWithFirestoreRetry<T>(
  operation: () => Promise<T>,
  options: FirestoreRetryOptions = {}
): Promise<T> {
  const defaults = getDefaultFirestoreRetryOptions();
  const maxAttempts = options.maxAttempts ?? defaults.maxAttempts;
  const baseDelayMs = options.baseDelayMs ?? defaults.baseDelayMs;
  const maxDelayMs = options.maxDelayMs ?? defaults.maxDelayMs;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await ensureFirestoreOnline();
      return await operation();
    } catch (err) {
      lastError = err;
      if (!isTransientFirestoreError(err) || attempt === maxAttempts) {
        throw err;
      }
      options.onRetry?.(attempt, maxAttempts);
      const delay = Math.min(baseDelayMs * attempt, maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export function formatFirestoreLoadError(err: unknown): Error {
  const { code, message } = getFirestoreErrorDetails(err);
  const codeLabel = code ? ` (${code})` : '';

  if (isFirestorePermissionError(err)) {
    return new Error(
      `Sin permiso para leer estos datos${codeLabel}. Publicá las reglas del archivo firestore.rules del proyecto: firebase deploy --only firestore:rules`
    );
  }
  if (isTransientFirestoreError(err)) {
    return new Error(
      `${message}${codeLabel}\n\nSe reintentó varias veces. Si en la PC funciona y en el celular no, probá datos móviles o reiniciá Expo Go.`
    );
  }
  return new Error(`${message}${codeLabel}`);
}
