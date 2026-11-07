import { LogBox, Platform } from 'react-native';

/**
 * En Expo Go el SDK JS de Firestore spamea cientos de
 * "INTERNAL ASSERTION FAILED" / "Target ID already exists" por LogBox.
 * No son fallos de reglas ni de datos: es ruido interno del cliente RN.
 * Silenciamos ese spam para poder usar la app; el resto de errores sí se ven.
 */
const NOISE = [
  'FIRESTORE',
  'INTERNAL ASSERTION FAILED',
  'Target ID already exists',
  '@firebase/firestore',
  'Unexpected state',
  'WebChannelConnection',
];

function isFirestoreNoise(args: unknown[]): boolean {
  const text = args
    .map((a) => {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return a.message;
      try {
        return String(a);
      } catch {
        return '';
      }
    })
    .join(' ');
  return NOISE.some((n) => text.includes(n));
}

let installed = false;

export function silenceFirestoreNoise(): void {
  if (installed || Platform.OS === 'web') return;
  installed = true;

  LogBox.ignoreLogs([
    'FIRESTORE',
    'INTERNAL ASSERTION FAILED',
    'Target ID already exists',
    '@firebase/firestore',
    'Unexpected state',
  ]);

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  console.error = (...args: unknown[]) => {
    if (isFirestoreNoise(args)) return;
    originalError(...args);
  };

  console.warn = (...args: unknown[]) => {
    if (isFirestoreNoise(args)) return;
    originalWarn(...args);
  };
}
