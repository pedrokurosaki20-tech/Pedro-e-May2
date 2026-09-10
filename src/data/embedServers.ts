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

export const getMultiEmbedFallbackUrl = (item: MediaItem, season = 1, episode = 1): string => {
  const cleanId = String(item.id).replace(/^\//, '');
  if (item.media_type === 'movie') {
    return `https://multiembed.mov/${cleanId}`;
  }
  const params = getPlayerParams(season, episode);
  return `https://multiembed.mov/${cleanId}&s=${params.season}&e=${params.episode}`;
};

export const MOVIE_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidlink-movie', 'VidLink Movie', 1, 'Player principal', (item) => `https://vidlink.pro/movie/${item.id}`),
  createServer('vidsrc-to-movie', 'VidSrc To Movie', 2, 'Fallback de filmes', (item) => `https://vidsrc.to/movie/${item.id}`),
  createServer('multiembed-movie', 'MultiEmbed Movie', 3, 'Fallback de filmes', (item) => `https://multiembed.mov/${item.id}`),
];

export const TV_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidlink-tv', 'VidLink Principal', 1, 'Player principal', (item, season = 1, episode = 1) => `https://vidlink.pro/tv/${item.id}/${season}/${episode}`),
  createServer('vidsrc-to-tv', 'Vidsrc To', 2, 'Fallback de séries', (item, season = 1, episode = 1) => `https://vidsrc.to/tv/${item.id}/${season}/${episode}`),
  createServer('multiembed-tv', 'SuperEmbed TV', 3, 'Fallback de séries', (item, season = 1, episode = 1) => `https://multiembed.mov/${item.id}&s=${season}&e=${episode}`),
  createServer('2embed-tv', '2Embed Nova', 4, 'Fallback de séries', (item, season = 1, episode = 1) => `https://2embed.cc/${item.id}&s=${season}&e=${episode}`),
];

export const ANIME_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidsrc-pro-anime', 'Vidsrc Pro', 1, 'Player principal de animes', (item, season = 1, episode = 1) => `https://vidsrc.pro/tv/${item.id}/${season}/${episode}`),
  createServer('multiembed-anime', 'SuperEmbed Nova', 2, 'Fallback de animes', (item, season = 1, episode = 1) => `https://multiembed.mov/${item.id}&s=${season}&e=${episode}`),
  createServer('vidsrc-cc-anime', 'Vidsrc CC', 3, 'Fallback de animes', (item, season = 1, episode = 1) => `https://vidsrc.cc/tv/${item.id}/${season}/${episode}`),
  createServer('autoembed-anime', 'AutoEmbed VIP', 4, 'Fallback de animes', (item, season = 1, episode = 1) => `https://autoembed.co/${item.id}?s=${season}&e=${episode}`),
];

export const getPlayerQueue = (item: MediaItem): EmbedServer[] => (
  item.media_type === 'movie' ? MOVIE_SERVER_QUEUE : item.media_type === 'anime' ? ANIME_SERVER_QUEUE : TV_SERVER_QUEUE
);

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

