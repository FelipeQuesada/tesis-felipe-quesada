import { resolvePublicAssetUri } from './siteAssets';
import { stockCoverByIndex } from './stockImages';

export function blogCoverUri(coverImageUrl?: string, index = 0): string | null {
  const path =
    coverImageUrl && coverImageUrl.trim() !== ''
      ? coverImageUrl.trim()
      : stockCoverByIndex(index);
  return resolvePublicAssetUri(path);
}
