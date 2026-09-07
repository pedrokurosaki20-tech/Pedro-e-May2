import React, { useState, useMemo } from 'react';
import { Menu, X, Check, Film, Tv, Sparkles, Filter, ChevronRight, Play } from 'lucide-react';
import { MediaItem } from '../types';
import { Genre } from '../data/genres';
import { MediaRow } from './MediaRow';

interface MediaSectionViewProps {
  sectionType: 'movies' | 'tv' | 'animes';
  title: string;
  subtitle: string;
  items: MediaItem[];
  genres: Genre[];
  isLoading?: boolean;
  onSelectMedia: (item: MediaItem) => void;
}

export const MediaSectionView: React.FC<MediaSectionViewProps> = ({
  sectionType,
  title,
  subtitle,
  items,
  genres,
  isLoading = false,
  onSelectMedia,
}) => {
  const [selectedGenreId, setSelectedGenreId] = useState<number | string>('all');
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);

  const selectedGenre = useMemo(() => {
    return genres.find(g => String(g.id) === String(selectedGenreId)) || genres[0];
  }, [genres, selectedGenreId]);

  // Filtragem de itens pelo gênero selecionado
  const filteredItems = useMemo(() => {
    if (selectedGenreId === 'all') {
      return items;
    }

    const targetId = selectedGenreId;
    return items.filter(item => {
      // Checa por genre_ids
      if (typeof targetId === 'number') {
        if (item.genre_ids && item.genre_ids.includes(targetId)) return true;
        if (item.genres && item.genres.some(g => g.id === targetId)) return true;
      }
      // Checa por nomes ou palavras-chave (ex: animes com strings de id)
      if (typeof targetId === 'string') {
        const lowerTarget = targetId.toLowerCase();
        const fullText = `${item.title} ${item.name || ''} ${item.overview || ''} ${item.genres?.map(g => g.name).join(' ') || ''}`.toLowerCase();
        
        if (lowerTarget === 'shounen') {
          return fullText.includes('shounen') || fullText.includes('ação') || fullText.includes('aventura') || item.genre_ids?.includes(10759);
        }
        if (lowerTarget === 'isekai') {
          return fullText.includes('isekai') || fullText.includes('fantasia') || fullText.includes('mundo') || item.genre_ids?.includes(10765);
        }
        if (lowerTarget === 'scifi') {
          return fullText.includes('cyber') || fullText.includes('ficção') || fullText.includes('sci-fi') || item.genre_ids?.includes(10765);
        }
        if (lowerTarget === 'supernatural') {
          return fullText.includes('demônio') || fullText.includes('maldição') || fullText.includes('sobrenatural') || item.genre_ids?.includes(9648);
        }
        if (lowerTarget === 'adventure') {
          return fullText.includes('aventura') || fullText.includes('jornada') || item.genre_ids?.includes(10759);
        }
        if (lowerTarget === 'drama') {
          return fullText.includes('drama') || fullText.includes('psicológico') || item.genre_ids?.includes(18);
        }
        if (lowerTarget === 'comedy') {
          return fullText.includes('comédia') || fullText.includes('divertida') || item.genre_ids?.includes(35);
        }
        if (lowerTarget === 'romance') {
          return fullText.includes('romance') || fullText.includes('amor') || item.genre_ids?.includes(10749);
        }
      }
      return false;
    });
  }, [items, selectedGenreId]);

  // Seção de Destaque / Subcategorias automáticas para exibição em carrosséis quando "Todos os Gêneros" está ativo
  const categorizedRows = useMemo(() => {
    if (selectedGenreId !== 'all') return [];

    if (sectionType === 'movies') {
      return [
        {
          id: 'movies-row-popular',
          title: 'Em Alta no Cinema',
          subtitle: 'Os títulos mais procurados do momento',
          items: items.slice(0, 10),
        },
        {
          id: 'movies-row-action',
          title: 'Ação & Adrenalina',
          subtitle: 'Muita ação, explosões e combates eletrizantes',
          items: items.filter(m => m.genre_ids?.includes(28) || m.genres?.some(g => g.id === 28) || m.vote_average >= 7.5).slice(0, 10),
        },
        {
          id: 'movies-row-scifi',
          title: 'Ficção Científica & Futuro',
          subtitle: 'Universos desconhecidos e viagens alucinantes',
          items: items.filter(m => m.genre_ids?.includes(878) || m.genres?.some(g => g.id === 878)).slice(0, 10),
        },
        {
          id: 'movies-row-drama',
          title: 'Dramas & Histórias Marcantes',
          subtitle: 'Grandes atuações e narrativas profundas',
          items: items.filter(m => m.genre_ids?.includes(18) || m.genres?.some(g => g.id === 18)).slice(0, 10),
        },
      ];
    }

    if (sectionType === 'tv') {
      return [
        {
          id: 'tv-row-trending',
          title: 'Séries em Alta',
          subtitle: 'As produções mais assistidas e comentadas',
          items: items.slice(0, 10),
        },
        {
          id: 'tv-row-fantasy',
          title: 'Sci-Fi & Mundos Fantásticos',
          subtitle: 'Criaturas míticas, futuros distópicos e poderes sobrenaturais',
          items: items.filter(s => s.genre_ids?.includes(10765) || s.genres?.some(g => g.id === 10765)).slice(0, 10),
        },
        {
          id: 'tv-row-action',
          title: 'Ação & Aventura Épica',
          subtitle: 'Histórias intensas que não deixam você piscar',
          items: items.filter(s => s.genre_ids?.includes(10759) || s.genres?.some(g => g.id === 10759)).slice(0, 10),
        },
        {
          id: 'tv-row-mystery',
          title: 'Mistério & Investigação',
          subtitle: 'Segredos sombrios esperando para serem descobertos',
          items: items.filter(s => s.genre_ids?.includes(9648) || s.genres?.some(g => g.id === 9648) || s.genre_ids?.includes(18)).slice(0, 10),
        },
      ];
    }

    // Animes
    return [
      {
        id: 'anime-row-popular',
        title: 'Animes em Destaque',
        subtitle: 'As animações japonesas mais aclamadas mundialmente',
        items: items.slice(0, 10),
      },
      {
        id: 'anime-row-shounen',
        title: 'Shounen & Batalhas Épicas',
        subtitle: 'Poderes insanos, superação e rivalidades lendárias',
        items: items.filter(a => a.genre_ids?.includes(10759) || a.vote_average >= 8.5).slice(0, 10),
      },
      {
        id: 'anime-row-fantasy',
        title: 'Fantasia, Magia & Isekai',
        subtitle: 'Jornadas emocionantes por reinos desconhecidos',
        items: items.filter(a => a.genre_ids?.includes(10765) || a.genres?.some(g => g.id === 10765)).slice(0, 10),
      },
      {
        id: 'anime-row-movies',
        title: 'Obras-Primas & Longas de Animação',
        subtitle: 'Filmes aclamados pelos maiores mestres da animação japonesa',
        items: items.filter(a => a.media_type === 'movie' || a.runtime || a.vote_count && a.vote_count > 4000).slice(0, 10),
      },
    ];
  }, [items, sectionType, selectedGenreId]);

  const getSectionIcon = () => {
    switch (sectionType) {
      case 'movies':
        return <Film className="w-6 h-6 text-[#e50914]" />;
      case 'tv':
        return <Tv className="w-6 h-6 text-[#e50914]" />;
      case 'animes':
        return <Sparkles className="w-6 h-6 text-[#e50914]" />;
    }
  };

  return (
    <div id={`${sectionType}-exclusive-view`} className="min-h-screen pt-20 sm:pt-24 pb-20 text-white">
      {/* Barra de Título Exclusiva com Botão ☰ no canto superior direito */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          {/* Lado Esquerdo: Título da Aba e Subtítulo */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg shadow-black/60 flex-shrink-0">
              {getSectionIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                  {title}
                </h1>
                {selectedGenreId !== 'all' && (
                  <span className="text-xs bg-[#e50914]/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                    {selectedGenre.name}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-zinc-400">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Canto Superior Direito: Botão de Três Risquinhos (☰) */}
          <div className="relative">
            <button
              id={`genre-menu-toggle-btn-${sectionType}`}
              onClick={() => setIsGenreMenuOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border shadow-lg ${
                isGenreMenuOpen || selectedGenreId !== 'all'
                  ? 'bg-[#e50914] text-white border-red-500 shadow-red-950/50'
                  : 'bg-zinc-900/90 text-zinc-200 border-white/10 hover:bg-zinc-800 hover:text-white hover:border-white/25'
              }`}
              aria-label="Filtrar por Gênero"
            >
              {/* Três risquinhos (☰) solicitados */}
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline">
                {selectedGenreId === 'all' ? 'Gêneros' : selectedGenre.name}
              </span>
            </button>

            {/* Menu Dropdown de Gêneros Disponíveis */}
            {isGenreMenuOpen && (
              <>
                {/* Backdrop invisível para fechar ao clicar fora */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsGenreMenuOpen(false)}
                />

                <div
                  id={`genre-dropdown-menu-${sectionType}`}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-[70vh] overflow-y-auto bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl p-3 z-50 space-y-1 no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between px-2.5 py-2 border-b border-zinc-800 mb-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-[#e50914]" />
                      <span>Selecionar Gênero</span>
                    </span>
                    <button
                      onClick={() => setIsGenreMenuOpen(false)}
                      className="text-zinc-500 hover:text-white p-1 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {genres.map((g) => {
                      const isSelected = String(g.id) === String(selectedGenreId);
                      return (
                        <button
                          key={String(g.id)}
                          onClick={() => {
                            setSelectedGenreId(g.id);
                            setIsGenreMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#e50914] text-white shadow-md'
                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <span>{g.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Barra de Filtro Rápido / Chips se um gênero estiver selecionado */}
        {selectedGenreId !== 'all' && (
          <div className="mt-3 flex items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Exibindo catálogo filtrado por:</span>
              <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-md border border-white/10">
                {selectedGenre.name}
              </span>
              <span className="text-xs text-zinc-500">
                ({filteredItems.length} títulos encontrados)
              </span>
            </div>

            <button
              onClick={() => setSelectedGenreId('all')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer underline underline-offset-2"
            >
              Ver Todos os Gêneros
            </button>
          </div>
        )}
      </div>

      {/* CONTEÚDO DA ABA */}
      {selectedGenreId === 'all' ? (
        /* =========================================================================
           ESTRUTURA DE CARROSSÉIS HORIZONTAIS ORGANIZADOS POR CATEGORIAS
           ========================================================================= */
        <div className="space-y-4">
          {categorizedRows.map((row) => {
            const rowItems = row.items.length > 0 ? row.items : items.slice(0, 8);
            return (
              <MediaRow
                key={row.id}
                id={row.id}
                title={row.title}
                subtitle={row.subtitle}
                items={rowItems}
                isLoading={isLoading}
                onSelectMedia={onSelectMedia}
              />
            );
          })}
        </div>
      ) : (
        /* =========================================================================
           AO SELECIONAR UM GÊNERO ESPECÍFICO: EXIBE ORGANIZADAMENTE TODOS OS TÍTULOS
           ========================================================================= */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {filteredItems.length > 0 ? (
            <div className="space-y-4">
              {/* Carrossel Principal do Gênero */}
              <MediaRow
                id={`genre-row-${selectedGenreId}`}
                title={`Destaques de ${selectedGenre.name}`}
                subtitle={`Navegue horizontalmente pelos títulos de ${selectedGenre.name}`}
                items={filteredItems}
                isLoading={isLoading}
                onSelectMedia={onSelectMedia}
              />

              {/* Grade Complementar Organizada com todos os títulos restantes daquele gênero */}
              {filteredItems.length > 4 && (
                <div className="pt-6 border-t border-zinc-800/80">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#e50914] rounded-full inline-block" />
                    <span>Todos os títulos de {selectedGenre.name} ({filteredItems.length})</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {filteredItems.map((item, idx) => {
                      const displayTitle = item.title || item.name || 'Título';
                      const year = (item.release_date || item.first_air_date || '').substring(0, 4);
                      return (
                        <div
                          key={`genre-grid-${item.id}-${idx}`}
                          onClick={() => onSelectMedia(item)}
                          className="group/card relative rounded-lg overflow-hidden bg-zinc-900 border border-white/5 hover:border-red-600/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-950/30 select-none"
                        >
                          <div className="aspect-[2/3] w-full bg-zinc-950 overflow-hidden relative">
                            <img
                              src={
                                item.poster_path
                                  ? (item.poster_path.startsWith('http')
                                      ? item.poster_path
                                      : `https://image.tmdb.org/t/p/w500${item.poster_path}`)
                                  : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80'
                              }
                              alt={displayTitle}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />
                            <div className="absolute top-2 left-2">
                              <span className="bg-black/80 text-[9px] font-bold text-white px-1.5 py-0.5 rounded border border-white/10">
                                {item.media_type === 'tv' ? 'SÉRIE' : 'FILME'}
                              </span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <div className="w-10 h-10 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-lg transform group-hover/card:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>
                          </div>
                          <div className="p-2.5 bg-[#181818]">
                            <h4 className="text-xs font-bold text-white truncate group-hover/card:text-red-400 transition-colors">
                              {displayTitle}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                              <span>{year || '2024'}</span>
                              <span className="text-amber-400 font-semibold">
                                ★ {item.vote_average ? item.vote_average.toFixed(1) : '8.0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-white/5 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Nenhum título encontrado em {selectedGenre.name}
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                No momento não há títulos catalogados para este gênero específico. Experimente selecionar outro gênero ou retornar ao catálogo completo.
              </p>
              <button
                onClick={() => setSelectedGenreId('all')}
                className="px-4 py-2 bg-[#e50914] hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Voltar a Todos os Gêneros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
