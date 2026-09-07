import React, { useState } from 'react';
import { Play, Info, Star, Plus, Check } from 'lucide-react';
import { MediaItem } from '../types';
import { getBackdropUrl, DEFAULT_BACKDROP_PLACEHOLDER } from '../config/tmdb';

interface HeroBannerProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onMoreInfo?: (item: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ item, onPlay, onMoreInfo }) => {
  const [isInList, setIsInList] = useState(false);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  // Puxa a imagem de fundo horizontal (backdrop_path) dinamicamente
  const rawBackdrop = getBackdropUrl(item.backdrop_path || item.poster_path);
  const backdropSrc = backdropError ? DEFAULT_BACKDROP_PLACEHOLDER : rawBackdrop;

  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4) || '2024';
  const displayTitle = item.title || item.name || 'Destaque';

  return (
    <section
      id="hero-banner-section"
      className="relative w-full h-[82vh] sm:h-[88vh] md:h-[92vh] min-h-[560px] max-h-[960px] flex items-end pb-16 sm:pb-24 overflow-hidden select-none"
    >
      {/* Imagem de Fundo Horizontal (Backdrop) com Tela Cheia */}
      <div className="absolute inset-0 z-0 bg-[#141414]">
        {/* Placeholder de Carregamento / Pulso */}
        {!backdropLoaded && (
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-[#141414] animate-pulse" />
        )}

        <img
          id="hero-backdrop-img"
          key={backdropSrc}
          src={backdropSrc}
          alt={displayTitle}
          onLoad={() => setBackdropLoaded(true)}
          onError={() => {
            setBackdropError(true);
            setBackdropLoaded(true);
          }}
          className={`w-full h-full object-cover object-top sm:object-[center_25%] transition-opacity duration-700 ease-in-out ${
            backdropLoaded ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* Gradientes Suaves de Fusão (Inferior, Lateral e Superior) */}
        {/* Gradiente Inferior: Transição perfeita para o preto #141414 para destacar os textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/75 via-45% to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent z-10 pointer-events-none" />

        {/* Gradiente Lateral Esquerdo: Garante legibilidade absoluta da sinopse e títulos */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-transparent max-w-4xl z-10 pointer-events-none" />

        {/* Gradiente Superior: Contraste para o Header fixo */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Conteúdo Dinâmico do Filme em Destaque */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Badges de Destaque */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-[#e50914] text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded tracking-widest uppercase shadow-md shadow-red-950/50">
              TOP 1 EM DESTAQUE
            </span>
            <span className="text-zinc-300 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              {item.media_type === 'tv' ? 'Série' : 'Filme'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs sm:text-sm font-bold bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.0'}</span>
            </div>
            <span className="text-zinc-400 text-xs sm:text-sm font-medium">
              {releaseYear}
            </span>
            <span className="bg-white/10 text-white font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded border border-white/10">
              4K ULTRA HD
            </span>
          </div>

          {/* Título Principal */}
          <h1
            id="hero-title"
            className="font-bebas text-4xl sm:text-6xl md:text-7xl font-bold tracking-wide text-white drop-shadow-2xl leading-tight sm:leading-none"
          >
            {displayTitle}
          </h1>

          {/* Sinopse Dinâmica */}
          <p
            id="hero-overview"
            className="text-zinc-200 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-xl drop-shadow text-shadow-sm font-normal"
          >
            {item.overview || 'Uma das produções mais aclamadas em catálogo. Assista agora em alta definição com som espacial.'}
          </p>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 pt-2 sm:pt-4 flex-wrap">
            <button
              id="hero-play-btn"
              onClick={() => onPlay(item)}
              className="flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-200 text-black font-bold px-6 sm:px-8 py-3 rounded-md transition-all duration-200 shadow-2xl shadow-black/80 hover:scale-105 cursor-pointer text-sm sm:text-base"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              <span>Assistir Agora</span>
            </button>

            <button
              id="hero-add-list-btn"
              onClick={() => setIsInList(prev => !prev)}
              className="flex items-center justify-center gap-2 bg-zinc-800/80 hover:bg-zinc-700/90 text-white font-semibold px-4 sm:px-6 py-3 rounded-md backdrop-blur-md transition-all duration-200 border border-white/10 text-sm sm:text-base cursor-pointer"
            >
              {isInList ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  <span>Na Minha Lista</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Minha Lista</span>
                </>
              )}
            </button>

            {onMoreInfo && (
              <button
                id="hero-more-info-btn"
                onClick={() => onMoreInfo(item)}
                className="hidden sm:flex items-center justify-center gap-2 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium px-4 py-3 rounded-md backdrop-blur-md transition-all border border-white/10 text-sm cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>Mais Informações</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
