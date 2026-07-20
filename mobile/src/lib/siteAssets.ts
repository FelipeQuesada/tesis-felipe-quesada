/**
 * Imágenes públicas de la web (`public/images/*`).
 * Configurá `EXPO_PUBLIC_WEB_ORIGIN` (ej. http://localhost:3000 o tu URL en Vercel)
 * para que la app pueda cargar `/images/...` en dispositivo/emulador.
 */
export function getWebOrigin(): string {
  const raw = process.env.EXPO_PUBLIC_WEB_ORIGIN?.trim() ?? '';
  return raw.replace(/\/$/, '');
}

/** Devuelve URI absoluta para assets `/images/...` o URLs https ya absolutas. */
export function resolvePublicAssetUri(pathOrUrl: string): string | null {
  const p = pathOrUrl.trim();
  if (!p) return null;
  if (p.startsWith('http://') || p.startsWith('https://')) {
    return p;
  }
  const origin = getWebOrigin();
  if (!origin) {
    return null;
  }
  const path = p.startsWith('/') ? p : `/${p}`;
  return `${origin}${path}`;
}
