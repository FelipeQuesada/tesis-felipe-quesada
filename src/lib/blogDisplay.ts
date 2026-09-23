const DEFAULT_BLOG_COVER = '/images/stock-floral.png';

export function blogCoverSrc(coverImageUrl?: string, index = 0): string {
  if (coverImageUrl && coverImageUrl.trim() !== '') return coverImageUrl;
  const fallbacks = [
    '/images/stock-floral.png',
    '/images/stock-pintura.png',
    '/images/stock-ceramica.png',
    '/images/stock-plantas.png',
  ];
  return fallbacks[index % fallbacks.length];
}
