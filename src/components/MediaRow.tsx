import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Film } from 'lucide-react';
import { MediaItem } from '../types';
import { getPosterUrl, DEFAULT_POSTER_PLACEHOLDER } from '../config/tmdb';

interface MediaCardProps {
  item: MediaItem;
  onSelectMedia: (item: MediaItem) => void;
  index: number;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onSelectMedia }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawPoster = getPosterUrl(item.poster_path);
  const posterSrc = imageError ? DEFAULT_POSTER_PLACEHOLDER : rawPoster;
  const displayTitle = item.title || item.name || 'Título Indisponível';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div
      id={`media-card-${item.id}`}
      onClick={() => onSelectMedia(item)}
      className="relative flex-none w-36 sm:w-44 md:w-52 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-30 hover:shadow-2xl hover:shadow-red-950/40 group/card border border-white/5 hover:border-red-600/50 select-none"
    >
      {/* Container da Imagem com Aspect Ratio Fixo (2:3) para evitar textos encavalados */}
      <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-950">
        {/* Skeleton com Efeito Pulse durante o Carregamento */}
        {!imageLoaded && (
          <div className="absolute inset-0 z-10 bg-zinc-800 animate-pulse flex flex-col items-center justify-center p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-zinc-700/60 flex items-center justify-center mb-2">
              <Film className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
            <div className="w-3/4 h-2.5 bg-zinc-700 rounded mb-1.5" />
            <div className="w-1/2 h-2 bg-zinc-700/80 rounded" />
          </div>
        )}

        {/* Imagem do Filme / Série */}
        <img
          src={posterSrc}
          alt={displayTitle}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-500 group-hover/card:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Overlay gradiente inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent opacity-60 group-hover/card:opacity-85 transition-opacity pointer-events-none" />

        {/* Badge de Tipo (Filme / Série) */}
        <div className="absolute top-2 left-2 z-20">
          <span className="bg-black/75 backdrop-blur-md text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-white px-2 py-0.5 rounded border border-white/10 shadow">
            {item.media_type === 'tv' ? 'SÉRIE' : 'FILME'}
          </span>
        </div>

        {/* Nota TMDB */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-400/20 shadow">
          <Star className="w-2.5 h-2.5 fill-amber-400" />
          <span>{item.vote_average ? item.vote_average.toFixed(1) : '7.5'}</span>
        </div>

        {/* Botão de Play em Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-20 pointer-events-none">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-2xl shadow-black transform scale-75 group-hover/card:scale-100 transition-transform">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Detalhes do Card */}
      <div className="p-2.5 sm:p-3 bg-[#181818] min-h-[58px] flex flex-col justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover/card:text-red-400 transition-colors">
          {displayTitle}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-zinc-400 font-medium">
          <span>{year || '2024'}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-emerald-400 font-semibold tracking-wider">HD</span>
        </div>
      </div>
    </div>
  );
};

interface MediaRowProps {
  id: string;
  title: string;
  items: MediaItem[];
  onSelectMedia: (item: MediaItem) => void;
  subtitle?: string;
  isLoading?: boolean;
}

export const MediaRow: React.FC<MediaRowProps> = ({
  id,
  title,
  items,
  onSelectMedia,
  subtitle,
  isLoading = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section id={id} className="relative py-4 sm:py-6 px-4 sm:px-6 lg:px-8 group">
      {/* Cabeçalho da Linha */}
      <div className="flex items-baseline justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-5 sm:h-6 bg-[#e50914] rounded-full inline-block" />
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5 ml-3.5">{subtitle}</p>
          )}
        </div>
        {items && items.length > 0 && (
          <span className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors cursor-pointer hidden sm:block">
            {items.length} títulos
          </span>
        )}
      </div>

      {/* Container do Carrossel com botões de navegação */}
      <div className="relative">
        {/* Seta Esquerda */}
        {showLeftArrow && (
          <button
            id={`${id}-scroll-left-btn`}
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-24 sm:h-36 bg-black/80 hover:bg-black/95 text-white rounded-r-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xs cursor-pointer shadow-2xl border-y border-r border-white/10"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Carrossel Horizontal */}
        <div
          ref={rowRef}
          onScroll={checkScroll}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
        >
          {isLoading ? (
            /* Renderiza Placeholders durante carregamento */
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`row-skel-${i}`}
                className="flex-none w-36 sm:w-44 md:w-52 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 animate-pulse"
              >
                <div className="aspect-[2/3] w-full bg-zinc-800 flex items-center justify-center">
                  <Film className="w-8 h-8 text-zinc-700" />
                </div>
                <div className="p-3 space-y-2 bg-[#181818]">
                  <div className="w-4/5 h-3.5 bg-zinc-700 rounded" />
                  <div className="w-1/2 h-2.5 bg-zinc-800 rounded" />
                </div>
              </div>
            ))
          ) : items && items.length > 0 ? (
            items.map((item, index) => (
              <MediaCard
                key={`${item.id}-${index}`}
                item={item}
                index={index}
                onSelectMedia={onSelectMedia}
              />
            ))
          ) : (
            <div className="py-8 text-xs text-zinc-500">
              Nenhum item disponível nesta categoria.
            </div>
          )}
        </div>

        {/* Seta Direita */}
        {showRightArrow && items && items.length > 3 && (
          <button
            id={`${id}-scroll-right-btn`}
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 sm:w-12 h-24 sm:h-36 bg-black/80 hover:bg-black/95 text-white rounded-l-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xs cursor-pointer shadow-2xl border-y border-l border-white/10"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>
    </section>
  );
};
