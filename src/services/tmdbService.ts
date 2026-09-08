import { MediaItem, MediaType } from '../types';
import { getActiveTmdbKey, TMDB_BASE_URL } from '../config/tmdb';
import { 
  FALLBACK_TRENDING_MOVIES, 
  FALLBACK_POPULAR_TV, 
  FALLBACK_NEW_RELEASES,
  FALLBACK_ANIMES
} from '../data/fallbackCatalog';

interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TMDBRawItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

const formatRawItem = (item: TMDBRawItem, defaultType: MediaType): MediaItem => {
  const mediaType: MediaType = item.media_type === 'tv' ? 'tv' : (item.media_type === 'movie' ? 'movie' : defaultType);
  return {
    id: item.id,
    title: item.title || item.name || 'Sem título',
    name: item.name,
    original_title: item.original_title,
    overview: item.overview || 'Sinopse indisponível no momento.',
    poster_path: item.poster_path || '',
    backdrop_path: item.backdrop_path || item.poster_path || '',
    media_type: mediaType,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
    vote_count: item.vote_count,
    genre_ids: item.genre_ids || [],
    runtime: item.runtime,
    number_of_seasons: item.number_of_seasons,
    number_of_episodes: item.number_of_episodes,
  };
};

/**
 * Busca dados da API TMDB oficial se houver chave configurada,
 * ou retorna o catálogo offline de alta qualidade se não houver chave.
 */
export const tmdbService = {
  hasApiKey(): boolean {
    const key = getActiveTmdbKey();
    return Boolean(key && key.length > 5);
  },

  async getTrendingMovies(page: number = 1): Promise<MediaItem[]> {
    const key = getActiveTmdbKey();
    if (!key) {
      return FALLBACK_TRENDING_MOVIES;
    }

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?api_key=${key}&language=pt-BR&page=${page}`
      );
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'movie'));
      }
      return page === 1 ? FALLBACK_TRENDING_MOVIES : [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (Trending Movies), usando catálogo local:', err);
      return page === 1 ? FALLBACK_TRENDING_MOVIES : [];
    }
  },

  async getPopularTV(page: number = 1): Promise<MediaItem[]> {
    const key = getActiveTmdbKey();
    if (!key) {
      return FALLBACK_POPULAR_TV;
    }

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/tv/popular?api_key=${key}&language=pt-BR&page=${page}`
      );
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'tv'));
      }
      return page === 1 ? FALLBACK_POPULAR_TV : [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (Popular TV), usando catálogo local:', err);
      return page === 1 ? FALLBACK_POPULAR_TV : [];
    }
  },

  async getNewReleases(page: number = 1): Promise<MediaItem[]> {
    const key = getActiveTmdbKey();
    if (!key) {
      return FALLBACK_NEW_RELEASES;
    }

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/movie/now_playing?api_key=${key}&language=pt-BR&page=${page}`
      );
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'movie'));
      }
      return page === 1 ? FALLBACK_NEW_RELEASES : [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (New Releases), usando catálogo local:', err);
      return page === 1 ? FALLBACK_NEW_RELEASES : [];
    }
  },

  async getAnimes(page: number = 1, genreId?: number | string): Promise<MediaItem[]> {
    const key = getActiveTmdbKey();
    if (!key) {
      return page === 1 ? FALLBACK_ANIMES : [];
    }

    try {
      let genreParam = '16';
      if (genreId && genreId !== 'all' && !isNaN(Number(genreId))) {
        genreParam = `16,${genreId}`;
      }

      const res = await fetch(
        `${TMDB_BASE_URL}/discover/tv?api_key=${key}&with_genres=${genreParam}&with_original_language=ja&sort_by=popularity.desc&language=pt-BR&page=${page}`
      );
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'tv'));
      }
      return page === 1 ? FALLBACK_ANIMES : [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (Animes), usando catálogo local:', err);
      return page === 1 ? FALLBACK_ANIMES : [];
    }
  },

  async getMoviesByGenre(genreId: number | string, page: number = 1): Promise<MediaItem[]> {
    if (genreId === 'all') {
      return this.getTrendingMovies(page);
    }
    const key = getActiveTmdbKey();
    if (!key) {
      const numGenreId = Number(genreId);
      const filtered = FALLBACK_TRENDING_MOVIES.concat(FALLBACK_NEW_RELEASES).filter(
        item => item.genre_ids?.includes(numGenreId) || item.genres?.some(g => g.id === numGenreId)
      );
      return page === 1 ? (filtered.length > 0 ? filtered : FALLBACK_TRENDING_MOVIES) : [];
    }

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=popularity.desc&language=pt-BR&page=${page}`
      );
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'movie'));
      }
      return page === 1 ? FALLBACK_TRENDING_MOVIES : [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (Movies by Genre):', err);
      return page === 1 ? FALLBACK_TRENDING_MOVIES : [];
    }
  },

  async getTvByGenre(genreId: number | string, page: number = 1): Promise<MediaItem[]> {
    if (genreId === 'all') {
      return this.getPopularTV(page);
    }
    const key = getActiveTmdbKey();
    if (!key) {
      const numGenreId = Number(genreId);
      const filtered = FALLBACK_POPULAR_TV.filter(
        item => item.genre_ids?.includes(numGenreId) || item.genres?.some(g => g.id === numGenreId)
      );
      return page === 1 ? (filtered.length > 0 ? filtered : FALLBACK_POPULAR_TV) : [];
    }

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/discover/tv?api_key=${key}&with_genres=${genreId}&sort_by=popularity.desc&language=pt-BR&page=${page}`
      );
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'tv'));
      }
      return page === 1 ? FALLBACK_POPULAR_TV : [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (TV by Genre):', err);
      return page === 1 ? FALLBACK_POPULAR_TV : [];
    }
  },

  async getDiscoverMovies(page: number = 1, genreId?: number | string): Promise<MediaItem[]> {
    const key = getActiveTmdbKey();
    if (!key) {
      return page === 1 ? FALLBACK_TRENDING_MOVIES : [];
    }

    try {
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${key}&sort_by=popularity.desc&language=pt-BR&page=${page}`;
      if (genreId && genreId !== 'all') {
        url += `&with_genres=${genreId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'movie'));
      }
      return [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (Discover Movies):', err);
      return [];
    }
  },

  async getDiscoverTv(page: number = 1, genreId?: number | string): Promise<MediaItem[]> {
    const key = getActiveTmdbKey();
    if (!key) {
      return page === 1 ? FALLBACK_POPULAR_TV : [];
    }

    try {
      let url = `${TMDB_BASE_URL}/discover/tv?api_key=${key}&sort_by=popularity.desc&language=pt-BR&page=${page}`;
      if (genreId && genreId !== 'all') {
        url += `&with_genres=${genreId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TMDB HTTP error: ${res.status}`);
      const data: TMDBResponse<TMDBRawItem> = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map(item => formatRawItem(item, 'tv'));
      }
      return [];
    } catch (err) {
      console.warn('Erro ao consultar TMDB (Discover TV):', err);
      return [];
    }
  },

  async searchMedia(query: string): Promise<MediaItem[]> {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const key = getActiveTmdbKey();
    if (key) {
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/search/multi?api_key=${key}&query=${encodeURIComponent(trimmed)}&language=pt-BR&page=1&include_adult=false`
        );
        if (res.ok) {
          const data: TMDBResponse<TMDBRawItem> = await res.json();
          const filtered = (data.results || []).filter(
            item => item.media_type === 'movie' || item.media_type === 'tv'
          );
          if (filtered.length > 0) {
            return filtered.map(item => formatRawItem(item, item.media_type === 'tv' ? 'tv' : 'movie'));
          }
        }
      } catch (err) {
        console.warn('Erro ao pesquisar no TMDB:', err);
      }
    }

    // Busca de fallback nos dados locais
    const allFallback = [
      ...FALLBACK_TRENDING_MOVIES,
      ...FALLBACK_POPULAR_TV,
      ...FALLBACK_NEW_RELEASES
    ];

    const uniqueMap = new Map<number, MediaItem>();
    allFallback.forEach(item => {
      const match = 
        item.title.toLowerCase().includes(trimmed) || 
        (item.original_title && item.original_title.toLowerCase().includes(trimmed)) ||
        item.overview.toLowerCase().includes(trimmed);
      if (match && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    return Array.from(uniqueMap.values());
  },

  async fetchTrailerId(id: number, type: MediaType): Promise<string | undefined> {
    const key = getActiveTmdbKey();
    if (!key) return undefined;

    try {
      const res = await fetch(
        `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${key}&language=pt-BR`
      );
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        const trailer = results.find(
          (v: { site: string; type: string; key: string }) => 
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        if (trailer) return trailer.key;

        // Se não achar dublado/legendado em pt-BR, busca em en-US
        const resEn = await fetch(
          `${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${key}&language=en-US`
        );
        if (resEn.ok) {
          const dataEn = await resEn.json();
          const trailerEn = (dataEn.results || []).find(
            (v: { site: string; type: string; key: string }) => 
              v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          );
          if (trailerEn) return trailerEn.key;
        }
      }
    } catch {
      // Ignora erro e continua
    }
    return undefined;
  }
};
