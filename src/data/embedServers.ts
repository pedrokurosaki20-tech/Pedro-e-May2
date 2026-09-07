import { EmbedServer, MediaItem } from '../types';

export const EMBED_SERVERS: EmbedServer[] = [
  {
    id: 'vidsrc-to',
    name: 'Canal 1 (VidSrc To)',
    serverNumber: 1,
    description: 'Servidor principal de alta estabilidade e legendas automáticas',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      if (item.media_type === 'tv') {
        return `https://vidsrc.to/embed/tv/${item.id}/${season}/${episode}`;
      }
      return `https://vidsrc.to/embed/movie/${item.id}`;
    }
  },
  {
    id: 'embed-su',
    name: 'Canal 2 (Embed.su)',
    serverNumber: 2,
    description: 'Servidor secundário rápido e otimizado para conexões móveis',
    getUrl: (item: MediaItem, season = 1, episode = 1) => {
      if (item.media_type === 'tv') {
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
      if (item.media_type === 'tv') {
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
      if (item.media_type === 'tv') {
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
