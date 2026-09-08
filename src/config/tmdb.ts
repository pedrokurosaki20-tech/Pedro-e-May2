/**
 * ============================================================================
 * CONFIGURAÇÃO DA API THE MOVIE DATABASE (TMDB)
 * ============================================================================
 */

// Constante global configurada com a chave v3 do TMDB
export const TMDB_API_KEY = "4b50180f870c7d5977cee36f9da052ec";

export const getActiveTmdbKey = (): string => {
  // 1. Chave configurada na constante global
  if (TMDB_API_KEY && TMDB_API_KEY.trim() !== "") {
    return TMDB_API_KEY.trim();
  }
  
  // 2. Chave salva no LocalStorage (se houver)
  if (typeof window !== "undefined") {
    const storedKey = localStorage.getItem("cinestream_tmdb_key");
    if (storedKey && storedKey.trim() !== "") {
      return storedKey.trim();
    }
  }

  // 3. Variável de ambiente VITE_TMDB_API_KEY
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  const envKey = metaEnv?.VITE_TMDB_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim() !== "") {
    return envKey.trim();
  }

  return "4b50180f870c7d5977cee36f9da052ec";
};

export const setStoredTmdbKey = (key: string): void => {
  if (typeof window !== "undefined") {
    if (key && key.trim() !== "") {
      localStorage.setItem("cinestream_tmdb_key", key.trim());
    } else {
      localStorage.removeItem("cinestream_tmdb_key");
    }
  }
};

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
export const TMDB_IMAGE_POSTER_SIZE = "/w500";
export const TMDB_IMAGE_BACKDROP_SIZE = "/original";

// Placeholder SVG de alta fidelidade para quando não houver imagem ou durante o carregamento
export const DEFAULT_POSTER_PLACEHOLDER = 
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22500%22%20height%3D%22750%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20500%20750%22%3E%3Crect%20fill%3D%22%231a1a1a%22%20width%3D%22500%22%20height%3D%22750%22%2F%3E%3Crect%20x%3D%2220%22%20y%3D%2220%22%20width%3D%22460%22%20height%3D%22710%22%20fill%3D%22none%22%20stroke%3D%22%232a2a2a%22%20stroke-width%3D%222%22%20rx%3D%2212%22%2F%3E%3Cpath%20d%3D%22M200%20330h100v90H200z%22%20fill%3D%22%23333333%22%2F%3E%3Ccircle%20cx%3D%22250%22%20cy%3D%22375%22%20r%3D%2230%22%20fill%3D%22%23e50914%22%20opacity%3D%220.8%22%2F%3E%3Cpolygon%20points%3D%22242%2C362%20264%2C375%20242%2C388%22%20fill%3D%22%23ffffff%22%2F%3E%3Ctext%20x%3D%22250%22%20y%3D%22450%22%20fill%3D%22%23666666%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22600%22%20text-anchor%3D%22middle%22%3ECINESTREAM%3C%2Ftext%3E%3C%2Fsvg%3E";

export const DEFAULT_BACKDROP_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%221920%22%20height%3D%221080%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201920%201080%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22bg%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23141414%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23080808%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20fill%3D%22url(%23bg)%22%20width%3D%221920%22%20height%3D%221080%22%2F%3E%3Ccircle%20cx%3D%22960%22%20cy%3D%22540%22%20r%3D%2260%22%20fill%3D%22%23e50914%22%20opacity%3D%220.4%22%2F%3E%3Cpolygon%20points%3D%22946%2C516%20986%2C540%20946%2C564%22%20fill%3D%22%23ffffff%22%2F%3E%3C%2Fsvg%3E";

/**
 * Constrói a URL da imagem da capa garantindo que não fique quebrada.
 * Suporta o caminho padrão do TMDB ou URLs completas.
 */
export const getPosterUrl = (path: string | null | undefined): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return DEFAULT_POSTER_PLACEHOLDER;
  }
  
  const clean = path.trim();

  // Se já for uma URL completa
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    // Caso venha com tmdb.org direto sem subdomínio image
    if (clean.includes('tmdb.org') && !clean.includes('image.tmdb.org')) {
      return clean.replace('tmdb.org', 'image.tmdb.org/t/p/w500');
    }
    return clean;
  }

  // Garante que o caminho inicie com barra única
  const normalizedPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `https://image.tmdb.org/t/p/w500${normalizedPath}`;
};

export const getBackdropUrl = (path: string | null | undefined): string => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return DEFAULT_BACKDROP_PLACEHOLDER;
  }

  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    if (clean.includes('tmdb.org') && !clean.includes('image.tmdb.org')) {
      return clean.replace('tmdb.org', 'image.tmdb.org/t/p/original');
    }
    return clean;
  }

  // Garante que o caminho inicie com barra única
  const normalizedPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `https://image.tmdb.org/t/p/original${normalizedPath}`;
};
