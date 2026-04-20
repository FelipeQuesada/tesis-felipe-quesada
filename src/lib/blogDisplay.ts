const DEFAULT_BLOG_COVER = '/images/resina.png';

export function blogCoverSrc(coverImageUrl?: string): string {
  if (coverImageUrl && coverImageUrl.trim() !== '') return coverImageUrl;
  return DEFAULT_BLOG_COVER;
}
