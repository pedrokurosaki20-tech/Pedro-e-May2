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

const getGenericProviderUrl = (baseUrl: string, item: MediaItem, season = 1, episode = 1): string => {
  const path = getMediaPath(item);
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const params = getPlayerParams(season, episode);
    return `${baseUrl}${path}/${params.season}/${params.episode}`;
  }
  return `${baseUrl}${path}`;
};

const getAnimeSmashyStreamUrl = (item: MediaItem, season = 1, episode = 1): string => {
  const cleanId = String(item.id).replace(/^\//, '');
  const params = getPlayerParams(season, episode);
  return `https://smashystream.com/${cleanId}&season=${params.season}&episode=${params.episode}`;
};

export const MOVIE_SERVER_QUEUE: EmbedServer[] = [
  createServer('rive-stream-movie', 'Rive Stream', 1, 'Especialista em filmes', (item) => getGenericProviderUrl('https://rive.stream', item)),
  createServer('vidsrc-to-movie', 'VidSrc To', 2, 'Maior acervo de filmes', (item) => getGenericProviderUrl('https://vidsrc.to', item)),
  createServer('vidlink-movie', 'VidLink Pro', 3, 'Velocidade em filmes', (item) => getGenericProviderUrl('https://vidlink.pro', item)),
  createServer('2embed-movie', '2Embed', 4, 'Fallback de filmes', (item) => getGenericProviderUrl('https://2embed.cc', item)),
];

export const TV_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidlink-tv', 'VidLink Pro', 1, 'Especialista em séries', getVidLinkUrl),
  createServer('vidsrc-to-tv', 'VidSrc To', 2, 'Maior acervo de séries', (item, season = 1, episode = 1) => getGenericProviderUrl('https://vidsrc.to', item, season, episode)),
  createServer('vidsrc-cc-tv', 'Vidsrc CC', 3, 'Fallback de séries', getVidsrcCcUrl),
  createServer('autoembed-tv', 'AutoEmbed', 4, 'Fallback clássico de séries', (item, season = 1, episode = 1) => getGenericProviderUrl('https://autoembed.cc', item, season, episode)),
];

export const ANIME_SERVER_QUEUE: EmbedServer[] = [
  createServer('anivexa-vidsrc', 'Anivexa / AniMovie', 1, 'Especialista em animes', (item, season = 1, episode = 1) => getGenericProviderUrl('https://vidsrc.to', item, season, episode)),
  createServer('vidlink-anime', 'VidLink Anime', 2, 'Bypass para animes', getVidLinkUrl),
  createServer('vidsrc-xyz-anime', 'VidSrc XYZ', 3, 'Acervo de animação', (item, season = 1, episode = 1) => getGenericProviderUrl('https://vidsrc.xyz', item, season, episode)),
  createServer('smashystream-anime', 'SmashYStream', 4, 'Fallback de anime', getAnimeSmashyStreamUrl),
];

export const getPlayerQueue = (item: MediaItem): EmbedServer[] => {
  if (item.media_type === 'movie') return MOVIE_SERVER_QUEUE;
  if (item.media_type === 'anime') return ANIME_SERVER_QUEUE;
  return TV_SERVER_QUEUE;
};

export const PLAYER_SERVER_QUEUE: EmbedServer[] = [
  ...MOVIE_SERVER_QUEUE,
  ...TV_SERVER_QUEUE,
  ...ANIME_SERVER_QUEUE,
];

export const EMBED_SERVERS: EmbedServer[] = [
  ...PLAYER_SERVER_QUEUE,
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

