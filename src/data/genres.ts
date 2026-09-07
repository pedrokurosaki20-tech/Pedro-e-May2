export interface Genre {
  id: number | string;
  name: string;
}

export const MOVIE_GENRES: Genre[] = [
  { id: 'all', name: 'Todos os Gêneros' },
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 36, name: 'História' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção Científica' },
  { id: 53, name: 'Suspense & Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Faroeste' },
];

export const TV_GENRES: Genre[] = [
  { id: 'all', name: 'Todos os Gêneros' },
  { id: 10759, name: 'Ação & Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime & Investigação' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 10762, name: 'Infantil / Kids' },
  { id: 9648, name: 'Mistério & Suspense' },
  { id: 10765, name: 'Sci-Fi & Fantasia' },
  { id: 10768, name: 'Guerra & Política' },
  { id: 37, name: 'Faroeste' },
];

export const ANIME_GENRES: Genre[] = [
  { id: 'all', name: 'Todos os Gêneros' },
  { id: 'shounen', name: 'Shounen & Ação' },
  { id: 'isekai', name: 'Fantasia & Isekai' },
  { id: 'scifi', name: 'Ficção Científica & Mecha' },
  { id: 'supernatural', name: 'Sobrenatural & Mistério' },
  { id: 'adventure', name: 'Aventura Épica' },
  { id: 'drama', name: 'Drama & Psicológico' },
  { id: 'comedy', name: 'Comédia & Slice of Life' },
  { id: 'romance', name: 'Romance' },
];
