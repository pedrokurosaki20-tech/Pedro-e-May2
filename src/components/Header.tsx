import React, { useState, useEffect } from 'react';
import { Search, X, Film, Tv, Sparkles, User, Home } from 'lucide-react';

export type AppTab = 'home' | 'movies' | 'tv' | 'animes' | 'profile';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchQuery,
  activeTab,
  onSelectTab,
  onGoHome,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch('');
    setIsSearchOpen(false);
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-2xl border-b border-white/5'
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        {/* Lado Esquerdo: Logo e Navegação */}
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            id="brand-logo-btn"
            onClick={onGoHome}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            aria-label="Ir para a página inicial"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#e50914] to-[#b8000b] flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-2xl sm:text-3xl tracking-wider text-[#e50914] leading-none group-hover:text-red-500 transition-colors">
                CINESTREAM
              </span>
              <span className="text-[9px] tracking-widest text-zinc-400 font-medium uppercase hidden sm:block">
                Streaming Platform
              </span>
            </div>
          </button>

          {/* Links de navegação exclusivos (desktop/tablet) */}
          <nav id="header-nav" className="hidden md:flex items-center gap-1 sm:gap-1.5 text-sm font-medium">
            <button
              id="nav-home-btn"
              onClick={() => {
                onSelectTab('home');
                onGoHome();
              }}
              className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home' && !searchQuery
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>

            <button
              id="nav-movies-btn"
              onClick={() => onSelectTab('movies')}
              className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'movies'
                  ? 'bg-[#e50914] text-white font-semibold shadow-md shadow-red-950/40'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Filmes</span>
            </button>

            <button
              id="nav-series-btn"
              onClick={() => onSelectTab('tv')}
              className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tv'
                  ? 'bg-[#e50914] text-white font-semibold shadow-md shadow-red-950/40'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Séries</span>
            </button>

            <button
              id="nav-animes-btn"
              onClick={() => onSelectTab('animes')}
              className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'animes'
                  ? 'bg-[#e50914] text-white font-semibold shadow-md shadow-red-950/40'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Animes</span>
            </button>

            <button
              id="nav-profile-btn"
              onClick={() => onSelectTab('profile')}
              className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Perfil</span>
            </button>
          </nav>
        </div>

        {/* Lado Direito: Barra de Pesquisa e Perfil Rápido */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Barra de Pesquisa */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center rounded-full transition-all duration-300 border ${
                isSearchOpen || searchQuery
                  ? 'w-48 sm:w-64 md:w-72 bg-black/80 border-white/30 px-3 py-1.5'
                  : 'w-9 h-9 sm:w-10 sm:h-10 justify-center bg-zinc-900/80 border-white/10 hover:border-white/30'
              }`}
            >
              <button
                id="search-toggle-btn"
                onClick={() => setIsSearchOpen(prev => !prev)}
                className="text-zinc-400 hover:text-white focus:outline-none cursor-pointer flex-shrink-0"
                aria-label="Abrir pesquisa"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {(isSearchOpen || searchQuery) && (
                <>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Buscar filmes, séries, animes..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus={isSearchOpen}
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-400 ml-2 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      id="search-clear-btn"
                      onClick={clearSearch}
                      className="text-zinc-400 hover:text-white focus:outline-none p-0.5 ml-1"
                      aria-label="Limpar pesquisa"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Botão de Perfil (Avatar Superior Direito) */}
          <button
            id="top-profile-btn"
            onClick={() => onSelectTab('profile')}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              activeTab === 'profile'
                ? 'bg-[#e50914] border-red-500 text-white shadow-lg shadow-red-950/40 scale-105'
                : 'bg-zinc-800/90 border-white/10 text-zinc-300 hover:border-white/30 hover:text-white'
            }`}
            title="Acessar Perfil"
            aria-label="Acessar Perfil"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
