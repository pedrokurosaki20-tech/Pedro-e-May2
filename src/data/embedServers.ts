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
    return `https://multiembed.cm/?video_id=${cleanId}`;
  }
  const params = getPlayerParams(season, episode);
  return `https://multiembed.cm/?video_id=${cleanId}&s=${params.season}&e=${params.episode}`;
};

export const MOVIE_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidsrc-movie', 'VidSrc Novo', 1, 'Catálogo de filmes', (item) => `https://vidsrc.to/embed/movie/${item.id}`),
  createServer('vidlink-movie', 'VidLink', 2, 'Player alternativo', (item) => `https://vidlink.pro/movie/${item.id}`),
  createServer('multiembed-movie', 'MultiEmbed', 3, 'Fallback de filmes', (item) => getMultiEmbedFallbackUrl(item)),
  createServer('smashystream-movie', 'SmashyStream', 4, 'Fallback de filmes', (item) => `https://embed.smashystream.com/playere.php?tmdb=${item.id}`),
];

export const TV_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidsrc-tv', 'VidSrc TV', 5, 'Catálogo de séries', (item, season = 1, episode = 1) => `https://vidsrc.to/embed/tv/${item.id}/${season}/${episode}`),
  createServer('vidlink-tv', 'VidLink TV', 6, 'Player alternativo de séries', (item, season = 1, episode = 1) => `https://vidlink.pro/tv/${item.id}/${season}/${episode}`),
  createServer('mgmoves-tv', 'MG Moves', 7, 'Fallback dublado', (item, season = 1, episode = 1) => `https://mgmoves.net/embed/tv/${item.id}/${season}/${episode}`),
  createServer('2embed-tv', '2Embed', 8, 'Fallback de séries', (item, season = 1, episode = 1) => `https://www.2embed.cc/embedtv/${item.id}&s=${season}&e=${episode}`),
];

export const ANIME_SERVER_QUEUE: EmbedServer[] = [
  createServer('vidlink-anime', 'VidLink Anime', 9, 'Mapeamento TMDB para animes', (item, season = 1, episode = 1) => `https://vidlink.pro/tv/${item.id}/${season}/${episode}`),
  createServer('multiembed-anime', 'MultiEmbed Anime', 10, 'Fallback de animes', (item, season = 1, episode = 1) => getMultiEmbedFallbackUrl(item, season, episode)),
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

