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

/** Constrói a URL do fallback Vidsrc ME (Canal 2). */
export function getSuperEmbedUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).replace(/^\//, '');
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://vidsrc.me/tv/${cleanId}&season=${s}&episode=${ep}`;
  }
  return `https://multiembed.eu/?video_id=${cleanId}&tmdb=1`;
}

/** Constrói a URL do fallback Embed SU (Canal 3). */
export function getVidsrcVipUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).replace(/^\//, '');
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://embed.su/tv/${cleanId}/${s}/${ep}`;
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
    name: 'Canal 2 (Vidsrc ME)',
    serverNumber: 2,
    description: 'Servidor alternativo Vidsrc ME para séries e animes',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getSuperEmbedUrl(item, season, episode);
    }
  },
  {
    id: 'vidsrc-xyz',
    name: 'Canal 3 (Embed SU)',
    serverNumber: 3,
    description: 'Servidor alternativo Embed SU para séries e animes',
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

