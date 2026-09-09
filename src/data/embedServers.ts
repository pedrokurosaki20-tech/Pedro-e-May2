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
  createServer('vidlink-movie', 'Player 1', 1, 'VidLink Pro', (item) => 'https://vidlink.pro/embed/movie/' + item.id),
  createServer('vidsrc-me-movie', 'Player 2', 2, 'VidSrc ME', (item) => `https://vidsrc.me/embed/movie?tmdb=${item.id}`),
  createServer('vidsrc-cc-movie', 'Player 3', 3, 'VidSrc CC', (item) => `https://vidsrc.cc/v2/embed/movie/${item.id}`),
];

export const TV_ANIME_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidlink-tv', 'Player 1', 1, 'VidLink Pro', (item, season = 1, episode = 1) => `https://vidlink.pro/embed/tv/${item.id}/${season}/${episode}`),
  createServer('vidsrc-me-tv', 'Player 2', 2, 'VidSrc ME', (item, season = 1, episode = 1) => `https://vidsrc.me/embed/tv?tmdb=${item.id}&season=${season}&episode=${episode}`),
  createServer('vidsrc-cc-tv', 'Player 3', 3, 'VidSrc CC', (item, season = 1, episode = 1) => `https://vidsrc.cc/v2/embed/tv/${item.id}/${season}/${episode}`),
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

