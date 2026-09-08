import { EmbedServer, MediaItem } from '../types';

const getMediaPath = (item: MediaItem): string => {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).replace(/^\//, '');
  return `/${isSeriesOrAnime ? 'tv' : 'movie'}/${cleanId}`;
};

const getPlayerParams = (season: number, episode: number): { season: number; episode: number } => ({
  season: Math.max(1, season || 1),
  episode: Math.max(1, episode || 1),
});

/** Canal 1: VidLink Pro. */
export function getVidLinkUrl(item: MediaItem, season = 1, episode = 1): string {
  const path = getMediaPath(item);
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const params = getPlayerParams(season, episode);
    return `https://vidlink.pro${path}/${params.season}/${params.episode}`;
  }
  return `https://vidlink.pro${path}`;
}

/** Canal 2: Vidsrc CC. */
export function getVidsrcCcUrl(item: MediaItem, season = 1, episode = 1): string {
  const path = getMediaPath(item);
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const params = getPlayerParams(season, episode);
    return `https://vidsrc.cc${path}/${params.season}/${params.episode}`;
  }
  return `https://vidsrc.cc${path}`;
}

/** Canal 3: Vidsrc Pro. */
export function getVidsrcProUrl(item: MediaItem, season = 1, episode = 1): string {
  const path = getMediaPath(item);
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const params = getPlayerParams(season, episode);
    return `https://vidsrc.pro${path}/${params.season}/${params.episode}`;
  }
  return `https://vidsrc.pro${path}`;
}

/** Canal 4: SuperEmbed Real. */
export function getSuperEmbedUrl(item: MediaItem, season = 1, episode = 1): string {
  const cleanId = String(item.id).replace(/^\//, '');
  const path = `/?video_id=${cleanId}`;
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const params = getPlayerParams(season, episode);
    return `https://multiembed.eu${path}&tmdb=1&s=${params.season}&e=${params.episode}`;
  }
  return `https://multiembed.eu${path}&tmdb=1`;
}

// Alias de compatibilidade
export const getVidSrcUrl = getVidsrcProUrl;

const createServer = (
  id: string,
  name: string,
  serverNumber: number,
  description: string,
  getUrl: EmbedServer['getUrl']
): EmbedServer => ({ id, name, serverNumber, description, getUrl });

export const PLAYER_SERVER_GROUPS: EmbedServer[][] = [
  [
    createServer('vidlink-pro', 'VidLink Pro', 1, 'Prioridade máxima', getVidLinkUrl),
    createServer('vidsrc-to', 'VidSrc To', 2, 'Prioridade máxima', (item, season = 1, episode = 1) => {
      const path = getMediaPath(item);
      if (item.media_type === 'tv' || item.media_type === 'anime') {
        const params = getPlayerParams(season, episode);
        return `https://vidsrc.to${path}/${params.season}/${params.episode}`;
      }
      return `https://vidsrc.to${path}`;
    }),
    createServer('vidsrc-cc', 'Vidsrc CC', 3, 'Prioridade máxima', getVidsrcCcUrl),
  ],
];

export const EMBED_SERVERS: EmbedServer[] = [
  ...PLAYER_SERVER_GROUPS.flat(),
  {
    id: 'trailer-hd',
    name: 'Trailer HD Oficial',
    serverNumber: 7,
    description: 'Trailer oficial em alta definição direto do YouTube',
    getUrl: (item: MediaItem) => {
      const trailerKey = item.trailer_youtube_id || '73_1biulkYk';
      return `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;
    }
  }
];

