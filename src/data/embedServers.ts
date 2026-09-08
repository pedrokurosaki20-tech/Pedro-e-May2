import { EmbedServer, MediaItem } from '../types';

/**
 * Constrói a URL do player gratuito no servidor externo estável VidSrc.
 * - Se for FILME: https://vidsrc.to/embed/movie/[ID_DO_FILME]
 * - Se for SÉRIE ou ANIME: https://vidsrc.to/embed/tv/[ID_DA_SERIE]/1/1 (temporada 1 e episódio 1 por padrão)
 */
export function getVidSrcUrl(item: MediaItem, season = 1, episode = 1): string {
  const isSeriesOrAnime = item.media_type === 'tv' || item.media_type === 'anime';
  if (isSeriesOrAnime) {
    const s = Math.max(1, season || 1);
    const ep = Math.max(1, episode || 1);
    return `https://vidsrc.to/embed/tv/${item.id}/${s}/${ep}`;
  }
  return `https://vidsrc.to/embed/movie/${item.id}`;
}

export const EMBED_SERVERS: EmbedServer[] = [
  {
    id: 'vidsrc-to',
    name: 'Canal 1 (VidSrc To)',
    serverNumber: 1,
    description: 'Servidor principal VidSrc de alta estabilidade e reprodução gratuita',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      return getVidSrcUrl(item, season, episode);
    }
  },
  {
    id: 'embed-su',
    name: 'Canal 2 (Embed.su)',
    serverNumber: 2,
    description: 'Servidor secundário rápido e otimizado para conexões móveis',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      const isTv = item.media_type === 'tv' || item.media_type === 'anime';
      if (isTv) {
        return `https://embed.su/embed/tv/${item.id}/${season}/${episode}`;
      }
      return `https://embed.su/embed/movie/${item.id}`;
    }
  },
  {
    id: 'vidsrc-cc',
    name: 'Canal 3 (VidSrc CC)',
    serverNumber: 3,
    description: 'Servidor alternativo moderno com múltiplos idiomas de áudio',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      const isTv = item.media_type === 'tv' || item.media_type === 'anime';
      if (isTv) {
        return `https://vidsrc.cc/v2/embed/tv/${item.id}/${season}/${episode}`;
      }
      return `https://vidsrc.cc/v2/embed/movie/${item.id}`;
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
