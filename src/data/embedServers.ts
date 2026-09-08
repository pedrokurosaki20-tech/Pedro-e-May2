import { EmbedServer, MediaItem } from '../types';

/**
 * Constrói a URL do player no servidor VidLink Pro (Canal 1).
 * Formato dinâmico:
 * - Filmes: https://vidlink.pro{id} -> https://vidlink.pro/[ID]
 * - Séries / Animes: https://vidlink.pro{id}/1/1 -> https://vidlink.pro/[ID]/[temporada]/[episódio]
 */
export function getVidLinkUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).startsWith('/') ? item.id : `/${item.id}`;
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://vidlink.pro${cleanId}/${s}/${ep}`;
  }
  return `https://vidlink.pro${cleanId}`;
}

/**
 * Constrói a URL do player no servidor SuperEmbed XYZ (Canal 2).
 * Formato dinâmico:
 * - Filmes: https://superembed.xyz{id} -> https://superembed.xyz/[ID]
 * - Séries / Animes: https://superembed.xyz{id}/1/1 -> https://superembed.xyz/[ID]/[temporada]/[episódio]
 */
export function getSuperEmbedUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).startsWith('/') ? item.id : `/${item.id}`;
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://superembed.xyz${cleanId}/${s}/${ep}`;
  }
  return `https://superembed.xyz${cleanId}`;
}

/**
 * Constrói a URL do player no servidor VidSrc To (Canal 3).
 * Formato dinâmico:
 * - Filmes: https://vidsrc.to{id} -> https://vidsrc.to/[ID]
 * - Séries / Animes: https://vidsrc.to{id}/1/1 -> https://vidsrc.to/[ID]/[temporada]/[episódio]
 */
export function getVidSrcUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  const cleanId = String(item.id).startsWith('/') ? item.id : `/${item.id}`;
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://vidsrc.to${cleanId}/${s}/${ep}`;
  }
  return `https://vidsrc.to${cleanId}`;
}

export const EMBED_SERVERS: EmbedServer[] = [
  {
    id: 'vidlink-pro',
    name: 'Canal 1 (VidLink Pro)',
    serverNumber: 1,
    description: 'Servidor VidLink Pro otimizado e de alta compatibilidade com a Vercel',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidLinkUrl(item, season, episode);
    }
  },
  {
    id: 'superembed-xyz',
    name: 'Canal 2 (SuperEmbed XYZ)',
    serverNumber: 2,
    description: 'Servidor SuperEmbed flexível com carregamento rápido e sem restrições de frame',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getSuperEmbedUrl(item, season, episode);
    }
  },
  {
    id: 'vidsrc-to',
    name: 'Canal 3 (VidSrc To)',
    serverNumber: 3,
    description: 'Servidor VidSrc estável e sem bloqueios de frame',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidSrcUrl(item, season, episode);
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

