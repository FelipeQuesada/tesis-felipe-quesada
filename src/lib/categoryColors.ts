export type CategoryChipStyle = { bg: string; color: string };

/** Paleta fija por categoría conocida (clave = nombre normalizado). */
const CATEGORY_COLORS: Record<string, CategoryChipStyle> = {
  resina: { bg: '#f3e4d7', color: '#8a5a3b' },
  'resina epoxi': { bg: '#f3e4d7', color: '#8a5a3b' },
  ceramica: { bg: '#e8d5c4', color: '#6b4423' },
  cerámica: { bg: '#e8d5c4', color: '#6b4423' },
  pintura: { bg: '#dde9f5', color: '#2f4d6a' },
  arte: { bg: '#ebe6f2', color: '#5b4b7a' },
  acuarela: { bg: '#dceef5', color: '#2a5f73' },
  cocina: { bg: '#f5e0d8', color: '#8a4530' },
  floral: { bg: '#f5e6ee', color: '#7a3d5c' },
  flores: { bg: '#f5e6ee', color: '#7a3d5c' },
  musica: { bg: '#e7f0ea', color: '#1b4332' },
  música: { bg: '#e7f0ea', color: '#1b4332' },
  yoga: { bg: '#e6f2ec', color: '#2d6a4f' },
  fotografia: { bg: '#e8e8ec', color: '#3d3d4a' },
  fotografía: { bg: '#e8e8ec', color: '#3d3d4a' },
  costura: { bg: '#f0e6f5', color: '#6b4a7a' },
  madera: { bg: '#ebe0d4', color: '#5c4030' },
  joyeria: { bg: '#f5ecd8', color: '#7a6230' },
  joyería: { bg: '#f5ecd8', color: '#7a6230' },
  prueba: { bg: '#e7f0ea', color: '#1b4332' },
  taller: { bg: '#eef0ee', color: '#4a554e' },
};

/** Fallback estable: misma categoría → mismo color (no aleatorio por card). */
const STABLE_PALETTE: CategoryChipStyle[] = [
  { bg: '#e7f0ea', color: '#1b4332' },
  { bg: '#f3e4d7', color: '#8a5a3b' },
  { bg: '#ebe6f2', color: '#5b4b7a' },
  { bg: '#dde9f5', color: '#2f4d6a' },
  { bg: '#f5e6ee', color: '#7a3d5c' },
  { bg: '#e8d5c4', color: '#6b4423' },
  { bg: '#dceef5', color: '#2a5f73' },
  { bg: '#f5ecd8', color: '#7a6230' },
];

function normalizeCategoryKey(name?: string | null): string {
  return (name || 'taller')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function stableIndex(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h % STABLE_PALETTE.length;
}

/**
 * Color de chip según el nombre/id de categoría.
 * Misma categoría → siempre el mismo color.
 */
export function getCategoryChipStyle(categoryNameOrId?: string | null): CategoryChipStyle {
  const raw = (categoryNameOrId || 'Taller').trim();
  const key = normalizeCategoryKey(raw);

  if (CATEGORY_COLORS[key]) return CATEGORY_COLORS[key];

  // Match parcial (ej. "resina epoxi artesanal")
  for (const [known, style] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(known) || known.includes(key)) return style;
  }

  return STABLE_PALETTE[stableIndex(key)];
}
