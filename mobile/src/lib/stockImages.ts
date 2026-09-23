import { resolvePublicAssetUri } from './siteAssets';

export const STOCK_IMAGES = {
  hero: '/images/stock-pintura.png',
  ceramica: '/images/stock-ceramica.png',
  pintura: '/images/stock-pintura.png',
  floral: '/images/stock-floral.png',
  plantas: '/images/stock-plantas.png',
} as const;

export const STOCK_COVER_FALLBACKS = [
  STOCK_IMAGES.ceramica,
  STOCK_IMAGES.pintura,
  STOCK_IMAGES.floral,
  STOCK_IMAGES.plantas,
] as const;

export function stockCoverByIndex(index = 0): string {
  return STOCK_COVER_FALLBACKS[index % STOCK_COVER_FALLBACKS.length];
}

export function stockCoverUriByIndex(index = 0): string | null {
  return resolvePublicAssetUri(stockCoverByIndex(index));
}

export function stockCoverByCategory(categoryIdOrName?: string): string | null {
  if (!categoryIdOrName) return null;
  const c = categoryIdOrName.toLowerCase();
  if (c.includes('cerám') || c.includes('ceram')) return STOCK_IMAGES.ceramica;
  if (c.includes('pint') || c.includes('acuarel') || c.includes('arte')) return STOCK_IMAGES.pintura;
  if (c.includes('floral') || c.includes('flor') || c.includes('bouquet')) return STOCK_IMAGES.floral;
  if (c.includes('plant') || c.includes('naturaleza') || c.includes('jard')) return STOCK_IMAGES.plantas;
  return null;
}
