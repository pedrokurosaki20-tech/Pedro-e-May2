import { EmbedServer, MediaItem } from '../types';

/**
 * Constrói a URL do player no servidor VidLink (Canal 1).
 * Rota oficial:
 * - Filmes: https://vidlink.pro/movie/[ID] (sem /embed, rota direta /movie/)
 * - Séries / Animes: https://vidlink.pro/tv/[ID]/[temporada]/[episódio] (iniciando em 1/1)
 */
export function getVidLinkUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).replace(/^\//, '');
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://vidlink.pro/tv/${cleanId}/${s}/${ep}`;
  }
  return `https://vidlink.pro/movie/${cleanId}`;
}

/**
 * Constrói a URL do player no servidor SuperEmbed (multiembed.eu) (Canal 2).
 * Rota oficial mais estável:
 * - Filmes: https://multiembed.eu/?video_id=[ID]&tmdb=1
 * - Séries / Animes: https://multiembed.eu/?video_id=[ID]&tmdb=1&s=[temporada]&e=[episódio] (iniciando em &s=1&e=1)
 */
export function getSuperEmbedUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).replace(/^\//, '');
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://multiembed.eu/?video_id=${cleanId}&tmdb=1&s=${s}&e=${ep}`;
  }
  return `https://multiembed.eu/?video_id=${cleanId}&tmdb=1`;
}

/**
 * Constrói a URL do player no servidor Vidsrc VIP (vidsrc.xyz) (Canal 3).
 * Rota oficial:
 * - Filmes: https://vidsrc.xyz/embed/movie/[ID]
 * - Séries / Animes: https://vidsrc.xyz/embed/tv/[ID]/[temporada]/[episódio] (iniciando em 1/1)
 */
export function getVidsrcVipUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).replace(/^\//, '');
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://vidsrc.xyz/embed/tv/${cleanId}/${s}/${ep}`;
  }
  return `https://vidsrc.xyz/embed/movie/${cleanId}`;
}

// Alias de compatibilidade
export const getVidSrcUrl = getVidsrcVipUrl;

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
    id: 'superembed-eu',
    name: 'Canal 2 (SuperEmbed)',
    serverNumber: 2,
    description: 'Servidor oficial e estável SuperEmbed (multiembed.eu) com integração TMDB',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getSuperEmbedUrl(item, season, episode);
    }
  },
  {
    id: 'vidsrc-xyz',
    name: 'Canal 3 (Vidsrc VIP)',
    serverNumber: 3,
    description: 'Servidor Vidsrc VIP (vidsrc.xyz) de alta definição',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidsrcVipUrl(item, season, episode);
    }
  },
  {
    id: 'autoembed',
    name: 'Canal 4 (AutoEmbed)',
    serverNumber: 4,
    description: 'Servidor de contingência com reprodutor HTML5 responsivo',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      const isTv = item.media_type === 'tv' || item.media_type === 'anime';
      if (isTv) {
        return `https://player.autoembed.cc/embed/tv/${item.id}/${season}/${episode}`;
      }
      return `https://player.autoembed.cc/embed/movie/${item.id}`;
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

