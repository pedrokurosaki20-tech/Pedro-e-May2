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

export const EMBED_SERVERS: EmbedServer[] = [
  {
    id: 'vidlink-pro',
    name: 'Canal 1 (VidLink)',
    serverNumber: 1,
    description: 'Servidor VidLink oficial com rotas diretas /movie/ e /tv/',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidLinkUrl(item, season, episode);
    }
  },
  {
    id: 'vidsrc-cc',
    name: 'Canal 2 (Vidsrc CC)',
    serverNumber: 2,
    description: 'Agregador Vidsrc CC para séries, animes e filmes',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidsrcCcUrl(item, season, episode);
    }
  },
  {
    id: 'vidsrc-pro',
    name: 'Canal 3 (Vidsrc Pro)',
    serverNumber: 3,
    description: 'Servidor alternativo Vidsrc Pro',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidsrcProUrl(item, season, episode);
    }
  },
  {
    id: 'superembed-eu',
    name: 'Canal 4 (SuperEmbed)',
    serverNumber: 4,
    description: 'SuperEmbed Real com integração TMDB',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getSuperEmbedUrl(item, season, episode);
    }
  },
  {
    id: 'trailer-hd',
    name: 'Canal 5 (Trailer HD Oficial)',
    serverNumber: 5,
    description: 'Trailer oficial em alta definição direto do YouTube',
    getUrl: (item: MediaItem) => {
      const trailerKey = item.trailer_youtube_id || '73_1biulkYk';
      return `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;
    }
  }
];

