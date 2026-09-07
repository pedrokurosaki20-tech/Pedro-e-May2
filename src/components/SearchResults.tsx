import React, { useState } from 'react';
import { MediaItem } from '../types';
import { getPosterUrl, DEFAULT_POSTER_PLACEHOLDER } from '../config/tmdb';
import { Play, Star, AlertCircle, Film } from 'lucide-react';

interface SearchItemCardProps {
  item: MediaItem;
  onSelectMedia: (item: MediaItem) => void;
}

const SearchItemCard: React.FC<SearchItemCardProps> = ({ item, onSelectMedia }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rawPoster = getPosterUrl(item.poster_path);
  const poster = imageError ? DEFAULT_POSTER_PLACEHOLDER : rawPoster;
  const displayTitle = item.title || item.name || 'Título';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div
      id={`search-card-${item.id}`}
      onClick={() => onSelectMedia(item)}
      className="group relative rounded-lg overflow-hidden bg-zinc-900 cursor-pointer border border-white/5 hover:border-red-600/50 transition-all duration-300 hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-red-950/40 select-none"
    >
      <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-950">
        {!imageLoaded && (
          <div className="absolute inset-0 z-10 bg-zinc-800 animate-pulse flex flex-col items-center justify-center p-3 text-center">
            <Film className="w-6 h-6 text-zinc-600 animate-spin mb-1" />
            <div className="w-2/3 h-2 bg-zinc-700 rounded" />
          </div>
        )}

        <img
          src={poster}
          alt={displayTitle}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black/60 backdrop-blur-md text-[9px] uppercase tracking-wider font-bold text-white px-1.5 py-0.5 rounded border border-white/10">
            {item.media_type === 'tv' ? 'Série' : 'Filme'}
          </span>
        </div>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400">
          <Star className="w-2.5 h-2.5 fill-amber-400" />
          <span>{item.vote_average ? item.vote_average.toFixed(1) : '7.0'}</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-2.5 bg-[#181818] min-h-[54px] flex flex-col justify-between">
        <h3 className="text-xs font-semibold text-white truncate group-hover:text-red-400">
          {displayTitle}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-400">
          <span>{year || '2024'}</span>
          <span className="text-emerald-400 font-medium">HD</span>
        </div>
      </div>
    </div>
  );
};

interface SearchResultsProps {
  query: string;
  results: MediaItem[];
  isLoading: boolean;
  onSelectMedia: (item: MediaItem) => void;
  onClear: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading,
  onSelectMedia,
  onClear,
}) => {
  return (
    <div id="search-results-container" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[70vh]">
      <div className="flex items-baseline justify-between mb-6 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            Resultados para <span className="text-[#e50914]">"{query}"</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isLoading
              ? 'Pesquisando...'
              : results.length === 1
              ? '1 resultado encontrado'
              : `${results.length} resultados encontrados`}
          </p>
        </div>
        <button
          id="clear-search-btn"
          onClick={onClear}
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors underline cursor-pointer"
        >
          Limpar busca
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#e50914] rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">Consultando banco de dados...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Nenhum resultado encontrado</h3>
          <p className="text-zinc-400 text-sm mb-4">
            Não encontramos títulos correspondentes a "{query}". Tente buscar por outro termo ou nome de ator.
          </p>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-semibold transition-colors"
          >
            Voltar ao Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {results.map((item) => (
            <SearchItemCard
              key={`search-${item.id}`}
              item={item}
              onSelectMedia={onSelectMedia}
            />
          ))}
        </div>
      )}
    </div>
  );
};
