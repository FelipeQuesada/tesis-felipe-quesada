import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/** Ancho máximo del cuerpo del home (debajo del hero) en tablet / web */
export const HOME_MAX_CONTENT_WIDTH = 1040;

/** Lado corto mínimo para padding / tipografía “tablet” */
export const TABLET_MIN_SHORT_SIDE = 600;

/** Grilla talleres destacados: mismo gap que en la vista */
export const FEATURED_GRID_GAP = 14;

/** Ancho mínimo razonable por tarjeta al validar si entra otra columna */
export const FEATURED_MIN_CARD_WIDTH = 140;

/**
 * Columnas según dispositivo + orientación (móvil 2 · tablet vertical 3 · horizontal 4),
 * acotado por el ancho real del contenedor de la grilla.
 */
export function featuredColumnCount(
  gridInnerWidth: number,
  windowWidth: number,
  windowHeight: number
): number {
  const inner = Math.max(0, gridInnerWidth);
  const shortSide = Math.min(windowWidth, windowHeight);
  let targetCols = 2;
  if (shortSide >= TABLET_MIN_SHORT_SIDE) {
    targetCols = windowWidth >= windowHeight ? 4 : 3;
  }

  for (let cols = targetCols; cols >= 2; cols -= 1) {
    const cardW = (inner - (cols - 1) * FEATURED_GRID_GAP) / cols;
    if (cardW >= FEATURED_MIN_CARD_WIDTH) return cols;
  }
  return 2;
}

/** Ancho de cada tarjeta para llenar el contenedor sin hueco a la derecha */
export function featuredCardWidth(
  gridInnerWidth: number,
  columns: number
): number {
  if (gridInnerWidth <= 0 || columns < 1) return 0;
  const gaps = FEATURED_GRID_GAP * (columns - 1);
  return Math.max(1, (gridInnerWidth - gaps) / columns);
}

export function useHomeLayout() {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(width, height);
    const isTablet = shortSide >= TABLET_MIN_SHORT_SIDE;
    const horizontalPadding = isTablet ? 24 : 16;
    const boundedWidth = Math.min(width, HOME_MAX_CONTENT_WIDTH);
    const contentInnerWidth = Math.max(0, boundedWidth - 2 * horizontalPadding);

    return {
      windowWidth: width,
      windowHeight: height,
      isTablet,
      horizontalPadding,
      contentInnerWidth,
    };
  }, [width, height]);
}
