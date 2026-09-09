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

const getTvEpisodeUrl = (baseUrl: string, item: MediaItem, season = 1, episode = 1): string => {
  const cleanId = String(item.id).replace(/^\//, '');
  const params = getPlayerParams(season, episode);
  return `${baseUrl}/tv/${cleanId}/${params.season}/${params.episode}`;
};

export const MOVIE_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidsrc-to-movie', 'VidSrc To', 1, 'Especialista em filmes', (item) => getGenericProviderUrl('https://vidsrc.to', item)),
  createServer('vidsrc-me-movie', 'VidSrc ME', 2, 'Fallback de filmes', (item) => getGenericProviderUrl('https://vidsrc.me', item)),
  createServer('vidsrc-cc-movie', 'VidSrc CC', 3, 'Fallback de filmes', (item) => getGenericProviderUrl('https://vidsrc.cc', item)),
  createServer('vidsrc-xyz-movie', 'VidSrc XYZ', 4, 'Fallback de filmes', (item) => getGenericProviderUrl('https://vidsrc.xyz', item)),
];

export const TV_ANIME_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidsrc-to-tv', 'VidSrc To', 1, 'Especialista em séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://vidsrc.to', item, season, episode)),
  createServer('vidsrc-me-tv', 'VidSrc ME', 2, 'Fallback de séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://vidsrc.me', item, season, episode)),
  createServer('vidsrc-cc-tv', 'VidSrc CC', 3, 'Fallback de séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://vidsrc.cc', item, season, episode)),
  createServer('vidsrc-xyz-tv', 'VidSrc XYZ', 4, 'Fallback de séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://vidsrc.xyz', item, season, episode)),
];

export const getPlayerQueue = (item: MediaItem): EmbedServer[] => {
  if (item.media_type === 'movie') return MOVIE_SERVER_QUEUE;
  return TV_ANIME_SERVER_QUEUE;
};

export const PLAYER_SERVER_QUEUE: EmbedServer[] = [
  ...MOVIE_SERVER_QUEUE,
  ...TV_ANIME_SERVER_QUEUE,
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

