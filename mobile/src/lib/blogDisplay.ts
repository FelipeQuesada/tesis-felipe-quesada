import { resolvePublicAssetUri } from './siteAssets';

const DEFAULT_COVER = '/images/resina.png';

export function blogCoverUri(coverImageUrl?: string): string | null {
  const raw =
    coverImageUrl && coverImageUrl.trim() !== ''
      ? coverImageUrl.trim()
      : DEFAULT_COVER;
  return resolvePublicAssetUri(raw);
}
