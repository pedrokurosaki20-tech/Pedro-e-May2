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

const getMultiEmbedUrl = (item: MediaItem, season = 1, episode = 1): string => {
  const cleanId = String(item.id).replace(/^\//, '');
  if (item.media_type === 'tv' || item.media_type === 'anime') {
    const params = getPlayerParams(season, episode);
    return `https://multiembed.eu/?video_id=${cleanId}&tmdb=1&s=${params.season}&e=${params.episode}`;
  }
  return `https://multiembed.eu/?video_id=${cleanId}&tmdb=1`;
};

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

const get2EmbedTvUrl = (item: MediaItem, season = 1, episode = 1): string => {
  const cleanId = String(item.id).replace(/^\//, '');
  const params = getPlayerParams(season, episode);
  return `https://2embed.cc/tv/${cleanId}-${params.season}-${params.episode}`;
};

export const MOVIE_SERVER_QUEUE: EmbedServer[] = [
  createServer('2embed-movie', '2Embed Movie', 1, 'Especialista em filmes', (item) => getGenericProviderUrl('https://2embed.cc', item)),
  createServer('multiembed-movie', 'SuperEmbed / MultiEmbed', 2, 'Fallback de filmes', getMultiEmbedUrl),
  createServer('vidcore-movie', 'VidCore API', 3, 'Fallback de filmes', (item) => getGenericProviderUrl('https://vidcore.org', item)),
  createServer('autoembed-movie', 'AutoEmbed CC', 4, 'Fallback de filmes', (item) => getGenericProviderUrl('https://autoembed.cc', item)),
];

export const TV_ANIME_SERVER_QUEUE: EmbedServer[] = [
  createServer('multiembed-tv', 'SuperEmbed / MultiEmbed', 1, 'Especialista em séries e animes', getMultiEmbedUrl),
  createServer('2embed-tv', '2Embed TV', 2, 'Fallback de séries e animes', get2EmbedTvUrl),
  createServer('vidcore-tv', 'VidCore API', 3, 'Fallback de séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://vidcore.org', item, season, episode)),
  createServer('autoembed-tv', 'AutoEmbed CC', 4, 'Fallback de séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://autoembed.cc', item, season, episode)),
  createServer('vidlink-tv', 'VidLink Pro', 5, 'Fallback final de séries e animes', (item, season = 1, episode = 1) => getTvEpisodeUrl('https://vidlink.pro', item, season, episode)),
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

