import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaItem } from './types';
import { tmdbService } from './services/tmdbService';
import { 
  FALLBACK_FEATURED_BANNER, 
  FALLBACK_TRENDING_MOVIES, 
  FALLBACK_POPULAR_TV, 
  FALLBACK_NEW_RELEASES,
  FALLBACK_ANIMES
} from './data/fallbackCatalog';
import { MOVIE_GENRES, TV_GENRES, ANIME_GENRES } from './data/genres';
import { Header, AppTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MediaRow } from './components/MediaRow';
import { MediaSectionView } from './components/MediaSectionView';
import { ProfilePlaceholder } from './components/ProfilePlaceholder';
import { SearchResults } from './components/SearchResults';
import { VideoPlayer } from './components/VideoPlayer';
import { Footer } from './components/Footer';
import { Home, Film, Tv, Sparkles, User } from 'lucide-react';

export default function App() {
  // Aba ativa principal: 'home' | 'movies' | 'tv' | 'animes' | 'profile'
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // Catálogo de Mídia
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>(FALLBACK_TRENDING_MOVIES);
  const [popularTV, setPopularTV] = useState<MediaItem[]>(FALLBACK_POPULAR_TV);
  const [newReleases, setNewReleases] = useState<MediaItem[]>(FALLBACK_NEW_RELEASES);
  const [animes, setAnimes] = useState<MediaItem[]>(FALLBACK_ANIMES);
  const [featuredItem, setFeaturedItem] = useState<MediaItem>(FALLBACK_FEATURED_BANNER);
  
  // Estado de Exibição / Player
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  // Pesquisa
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);

  // Carrega catálogo
  const loadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    try {
      const [trending, tv, releases, animeList] = await Promise.all([
        tmdbService.getTrendingMovies(),
        tmdbService.getPopularTV(),
        tmdbService.getNewReleases(),
        tmdbService.getAnimes(),
      ]);

      if (trending && trending.length > 0) {
        setTrendingMovies(trending);
        setFeaturedItem(trending[0]);
      }
      if (tv && tv.length > 0) {
        setPopularTV(tv);
      }
      if (releases && releases.length > 0) {
        setNewReleases(releases);
      }
      if (animeList && animeList.length > 0) {
        setAnimes(animeList);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados do catálogo:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Debounce para a barra de pesquisa
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await tmdbService.searchMedia(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.warn('Erro na busca:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Lista agregada e desduplicada para a aba de filmes
  const allMovies = useMemo(() => {
    const movieMap = new Map<number, MediaItem>();
    [...trendingMovies, ...newReleases].forEach(m => {
      movieMap.set(m.id, m);
    });
    return Array.from(movieMap.values());
  }, [trendingMovies, newReleases]);

  // Manipuladores de navegação
  const handleSelectMedia = (item: MediaItem) => {
    setActiveMedia(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: AppTab) => {
    setActiveTab(tab);
    setActiveMedia(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setActiveTab('home');
    setActiveMedia(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col selection:bg-[#e50914] selection:text-white">
      {/* Header Principal com abas exclusivas e barra de busca limpa */}
      <Header
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onGoHome={handleGoHome}
      />

      {/* RENDERIZAÇÃO CONDICIONAL */}
      <main className="flex-1">
        {activeMedia ? (
          /* =========================================================================
             1. TELA DO PLAYER DE VÍDEO (EXIBIÇÃO COM EMBED ESTÁVEL)
             ========================================================================= */
          <VideoPlayer
            item={activeMedia}
            onBack={() => setActiveMedia(null)}
          />
        ) : searchQuery.trim() ? (
          /* =========================================================================
             2. RESULTADOS DA BUSCA
             ========================================================================= */
          <SearchResults
            query={searchQuery}
            results={searchResults}
            isLoading={isSearching}
            onSelectMedia={handleSelectMedia}
            onClear={() => setSearchQuery('')}
          />
        ) : activeTab === 'movies' ? (
          /* =========================================================================
             3. ABA EXCLUSIVA DE FILMES (CARROSSÉIS E BOTÃO DE GÊNEROS ☰)
             ========================================================================= */
          <MediaSectionView
            sectionType="movies"
            title="Filmes"
            subtitle="Catálogo exclusivo com grandes sucessos, lançamentos e clássicos do cinema"
            items={allMovies}
            genres={MOVIE_GENRES}
            isLoading={isLoadingCatalog}
            onSelectMedia={handleSelectMedia}
          />
        ) : activeTab === 'tv' ? (
          /* =========================================================================
             4. ABA EXCLUSIVA DE SÉRIES (CARROSSÉIS E BOTÃO DE GÊNEROS ☰)
             ========================================================================= */
          <MediaSectionView
            sectionType="tv"
            title="Séries"
            subtitle="Temporadas completas, produções originais e séries aclamadas pela crítica"
            items={popularTV}
            genres={TV_GENRES}
            isLoading={isLoadingCatalog}
            onSelectMedia={handleSelectMedia}
          />
        ) : activeTab === 'animes' ? (
          /* =========================================================================
             5. ABA EXCLUSIVA DE ANIMES (CARROSSÉIS E BOTÃO DE GÊNEROS ☰)
             ========================================================================= */
          <MediaSectionView
            sectionType="animes"
            title="Animes"
            subtitle="O melhor da animação japonesa, shounens épicos, longas-metragens e clássicos"
            items={animes}
            genres={ANIME_GENRES}
            isLoading={isLoadingCatalog}
            onSelectMedia={handleSelectMedia}
          />
        ) : activeTab === 'profile' ? (
          /* =========================================================================
             6. ABA DE PERFIL (ESTRUTURA PREPARADA)
             ========================================================================= */
          <ProfilePlaceholder />
        ) : (
          /* =========================================================================
             7. ABA DE INÍCIO (HOME STREAMING TRADICIONAL)
             ========================================================================= */
          <div>
            {/* Banner de Destaque Dinâmico no Topo */}
            {featuredItem && (
              <HeroBanner
                item={featuredItem}
                onPlay={handleSelectMedia}
                onMoreInfo={handleSelectMedia}
              />
            )}

            {/* Fileiras Horizontais (Carrosséis) da Página Inicial */}
            <div className="space-y-2 sm:space-y-4 pb-16">
              {/* Linha 1: Filmes em Alta */}
              <MediaRow
                id="row-trending-movies"
                title="Filmes em Alta"
                subtitle="Os filmes mais assistidos e comentados da semana"
                items={trendingMovies}
                isLoading={isLoadingCatalog}
                onSelectMedia={handleSelectMedia}
              />

              {/* Linha 2: Séries Populares */}
              <MediaRow
                id="row-popular-tv"
                title="Séries Populares"
                subtitle="Temporadas completas prontas para maratonar"
                items={popularTV}
                isLoading={isLoadingCatalog}
                onSelectMedia={handleSelectMedia}
              />

              {/* Linha 3: Animes em Destaque */}
              <MediaRow
                id="row-popular-animes"
                title="Animes em Destaque"
                subtitle="As animações japonesas mais assistidas e aclamadas"
                items={animes}
                isLoading={isLoadingCatalog}
                onSelectMedia={handleSelectMedia}
              />

              {/* Linha 4: Lançamentos */}
              <MediaRow
                id="row-new-releases"
                title="Lançamentos Recentes"
                subtitle="Títulos recém-chegados direto para você"
                items={newReleases}
                isLoading={isLoadingCatalog}
                onSelectMedia={handleSelectMedia}
              />
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior para Mobile (Sem 'Em alta', com Início, Filmes, Séries, Animes e Perfil) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-2 flex items-center justify-around text-zinc-400"
      >
        <button
          id="mobile-nav-home"
          onClick={() => handleSelectTab('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            !activeMedia && activeTab === 'home' && !searchQuery ? 'text-[#e50914]' : 'hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Início</span>
        </button>

        <button
          id="mobile-nav-movies"
          onClick={() => handleSelectTab('movies')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            !activeMedia && activeTab === 'movies' ? 'text-[#e50914]' : 'hover:text-white'
          }`}
        >
          <Film className="w-5 h-5" />
          <span>Filmes</span>
        </button>

        <button
          id="mobile-nav-series"
          onClick={() => handleSelectTab('tv')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            !activeMedia && activeTab === 'tv' ? 'text-[#e50914]' : 'hover:text-white'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span>Séries</span>
        </button>

        <button
          id="mobile-nav-animes"
          onClick={() => handleSelectTab('animes')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            !activeMedia && activeTab === 'animes' ? 'text-[#e50914]' : 'hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Animes</span>
        </button>

        <button
          id="mobile-nav-profile"
          onClick={() => handleSelectTab('profile')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            !activeMedia && activeTab === 'profile' ? 'text-[#e50914]' : 'hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Perfil</span>
        </button>
      </nav>

      {/* Rodapé Tradicional */}
      <Footer onSelectTab={handleSelectTab} />
    </div>
  );
}
