import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Check, Film, Tv, Sparkles, Filter, Play, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { Genre } from '../data/genres';
import { MediaRow } from './MediaRow';
import { getPosterUrl, DEFAULT_POSTER_PLACEHOLDER } from '../config/tmdb';
import { tmdbService } from '../services/tmdbService';

interface MediaSectionViewProps {
  sectionType: 'movies' | 'tv' | 'animes';
  title: string;
  subtitle: string;
  items: MediaItem[];
  genres: Genre[];
  isLoading?: boolean;
  onSelectMedia: (item: MediaItem) => void;
}

interface SectionCardProps {
  item: MediaItem;
  onSelectMedia: (item: MediaItem) => void;
}

const MediaSectionCard: React.FC<SectionCardProps> = ({ item, onSelectMedia }) => {
  const displayTitle = item.title || item.name || 'Título';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);

  return (
    <div
      id={`media-card-${item.id}`}
      onClick={() => onSelectMedia(item)}
      className="group/card relative rounded-lg overflow-hidden bg-zinc-900 border border-white/5 hover:border-red-600/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-950/40 select-none"
    >
      {/* Imagem com Aspect Ratio 2:3 */}
      <div className="aspect-[2/3] w-full bg-zinc-950 overflow-hidden relative">
        <img
          src={getPosterUrl(item.poster_path)}
          alt={displayTitle}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DEFAULT_POSTER_PLACEHOLDER;
          }}
          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />
        
        {/* Badge do Tipo de Mídia */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-black/80 backdrop-blur-md text-[9px] font-bold text-white px-1.5 py-0.5 rounded border border-white/10 shadow">
            {item.media_type === 'tv' ? 'SÉRIE' : 'FILME'}
          </span>
        </div>

        {/* Nota TMDB */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 border border-amber-400/20 shadow">
          <Star className="w-2.5 h-2.5 fill-amber-400" />
          <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.0'}</span>
        </div>

        {/* Botão de Play Vermelho ao passar o mouse */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
          <div className="w-11 h-11 rounded-full bg-[#e50914] text-white flex items-center justify-center shadow-2xl transform group-hover/card:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Título e Ano */}
      <div className="p-2.5 sm:p-3 bg-[#181818] min-h-[58px] flex flex-col justify-between">
        <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover/card:text-red-400 transition-colors">
          {displayTitle}
        </h4>
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 mt-1">
          <span>{year || '2024'}</span>
          <span className="text-emerald-400 font-semibold tracking-wider">HD</span>
        </div>
      </div>
    </div>
  );
};

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

  // =========================================================================
  // 1. SISTEMA DE ROLAGEM INFINITA (INFINITE SCROLL) CUMULATIVO
  // =========================================================================
  const [catalogItems, setCatalogItems] = useState<MediaItem[]>(items);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Atualiza a lista quando os itens iniciais forem carregados da API pela primeira vez
  useEffect(() => {
    if (items && items.length > 0 && selectedGenreId === 'all') {
      setCatalogItems(prev => {
        if (prev.length === 0) return items;
        // Mescla sem duplicar IDs
        const existingIds = new Set(prev.map(p => p.id));
        const additions = items.filter(i => !existingIds.has(i.id));
        return additions.length > 0 ? [...prev, ...additions] : prev;
      });
    }
  }, [items, selectedGenreId]);

  // Ao trocar de gênero selecionado, reinicia a paginação para a página 1 e busca o novo gênero
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);

    if (selectedGenreId === 'all') {
      setCatalogItems(items);
      return;
    }

    let isSubscribed = true;
    const fetchFirstGenrePage = async () => {
      try {
        let results: MediaItem[] = [];
        if (sectionType === 'movies') {
          results = await tmdbService.getMoviesByGenre(selectedGenreId, 1);
        } else if (sectionType === 'tv') {
          results = await tmdbService.getTvByGenre(selectedGenreId, 1);
        } else if (sectionType === 'animes') {
          results = await tmdbService.getAnimes(1, selectedGenreId);
        }

        if (isSubscribed) {
          if (results.length > 0) {
            setCatalogItems(results);
            setHasMore(results.length >= 10);
          } else {
            setCatalogItems([]);
            setHasMore(false);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar primeiro lote do gênero:', err);
      }
    };

    fetchFirstGenrePage();

    return () => {
      isSubscribed = false;
    };
  }, [selectedGenreId, sectionType, items]);

  // Função para carregar a próxima página cumulativamente
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      let newItems: MediaItem[] = [];

      if (sectionType === 'movies') {
        if (selectedGenreId === 'all') {
          newItems = await tmdbService.getDiscoverMovies(nextPage);
          if (newItems.length === 0) {
            newItems = await tmdbService.getTrendingMovies(nextPage);
          }
        } else {
          newItems = await tmdbService.getMoviesByGenre(selectedGenreId, nextPage);
        }
      } else if (sectionType === 'tv') {
        if (selectedGenreId === 'all') {
          newItems = await tmdbService.getDiscoverTv(nextPage);
          if (newItems.length === 0) {
            newItems = await tmdbService.getPopularTV(nextPage);
          }
        } else {
          newItems = await tmdbService.getTvByGenre(selectedGenreId, nextPage);
        }
      } else if (sectionType === 'animes') {
        newItems = await tmdbService.getAnimes(nextPage, selectedGenreId);
      }

      if (!newItems || newItems.length === 0) {
        setHasMore(false);
      } else {
        setCatalogItems(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueItems = newItems.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueItems];
        });
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.warn('Erro no Infinite Scroll ao buscar página:', nextPage, err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoadingMore, sectionType, selectedGenreId]);

  // 1. IntersectionObserver para detecção nativa e suave do final da página
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMore) {
          loadNextPage();
        }
      },
      {
        rootMargin: '500px', // Inicia o pré-carregamento 500px antes de tocar o fundo
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, isLoadingMore, hasMore]);

  // 2. Fallback de evento de rolagem tradicional da janela
  useEffect(() => {
    const handleWindowScroll = () => {
      if (isLoadingMore || !hasMore) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= docHeight - 450) {
        loadNextPage();
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [loadNextPage, isLoadingMore, hasMore]);

  const selectedGenre = useMemo(() => {
    return genres.find(g => String(g.id) === String(selectedGenreId)) || genres[0];
  }, [genres, selectedGenreId]);

  // Subcategorias automáticas para os carrosséis de destaque no topo quando em "Todos os Gêneros"
  const categorizedRows = useMemo(() => {
    if (selectedGenreId !== 'all') return [];

    if (sectionType === 'movies') {
      return [
        {
          id: 'movies-row-popular',
          title: 'Em Alta no Cinema',
          subtitle: 'Os títulos mais procurados do momento',
          items: catalogItems.slice(0, 10),
        },
        {
          id: 'movies-row-action',
          title: 'Ação & Adrenalina',
          subtitle: 'Muita ação, explosões e combates eletrizantes',
          items: catalogItems.filter(m => m.genre_ids?.includes(28) || m.genres?.some(g => g.id === 28) || (m.vote_average || 0) >= 7.5).slice(0, 10),
        },
        {
          id: 'movies-row-scifi',
          title: 'Ficção Científica & Futuro',
          subtitle: 'Universos desconhecidos e viagens alucinantes',
          items: catalogItems.filter(m => m.genre_ids?.includes(878) || m.genres?.some(g => g.id === 878)).slice(0, 10),
        },
        {
          id: 'movies-row-drama',
          title: 'Dramas & Histórias Marcantes',
          subtitle: 'Grandes atuações e narrativas profundas',
          items: catalogItems.filter(m => m.genre_ids?.includes(18) || m.genres?.some(g => g.id === 18)).slice(0, 10),
        },
      ];
    }

    if (sectionType === 'tv') {
      return [
        {
          id: 'tv-row-trending',
          title: 'Séries em Alta',
          subtitle: 'As produções mais assistidas e comentadas',
          items: catalogItems.slice(0, 10),
        },
        {
          id: 'tv-row-fantasy',
          title: 'Sci-Fi & Mundos Fantásticos',
          subtitle: 'Criaturas míticas, futuros distópicos e poderes sobrenaturais',
          items: catalogItems.filter(s => s.genre_ids?.includes(10765) || s.genres?.some(g => g.id === 10765)).slice(0, 10),
        },
        {
          id: 'tv-row-action',
          title: 'Ação & Aventura Épica',
          subtitle: 'Histórias intensas que não deixam você piscar',
          items: catalogItems.filter(s => s.genre_ids?.includes(10759) || s.genres?.some(g => g.id === 10759)).slice(0, 10),
        },
        {
          id: 'tv-row-mystery',
          title: 'Mistério & Investigação',
          subtitle: 'Segredos sombrios esperando para serem descobertos',
          items: catalogItems.filter(s => s.genre_ids?.includes(9648) || s.genres?.some(g => g.id === 9648) || s.genre_ids?.includes(18)).slice(0, 10),
        },
      ];
    }

    // Animes
    return [
      {
        id: 'anime-row-popular',
        title: 'Animes em Destaque',
        subtitle: 'As animações japonesas mais aclamadas mundialmente',
        items: catalogItems.slice(0, 10),
      },
      {
        id: 'anime-row-shounen',
        title: 'Shounen & Batalhas Épicas',
        subtitle: 'Poderes insanos, superação e rivalidades lendárias',
        items: catalogItems.filter(a => a.genre_ids?.includes(10759) || (a.vote_average || 0) >= 8.5).slice(0, 10),
      },
      {
        id: 'anime-row-fantasy',
        title: 'Fantasia, Magia & Isekai',
        subtitle: 'Jornadas emocionantes por reinos desconhecidos',
        items: catalogItems.filter(a => a.genre_ids?.includes(10765) || a.genres?.some(g => g.id === 10765)).slice(0, 10),
      },
      {
        id: 'anime-row-movies',
        title: 'Obras-Primas & Longas de Animação',
        subtitle: 'Filmes aclamados pelos maiores mestres da animação japonesa',
        items: catalogItems.filter(a => a.media_type === 'movie' || Boolean(a.runtime) || (a.vote_count && a.vote_count > 4000)).slice(0, 10),
      },
    ];
  }, [catalogItems, sectionType, selectedGenreId]);

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
      {/* Barra de Título Exclusiva com Botão de Gêneros (☰) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          {/* Título da Aba e Subtítulo */}
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

          {/* Botão de Três Risquinhos (☰) de Gêneros */}
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
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline">
                {selectedGenreId === 'all' ? 'Gêneros' : selectedGenre.name}
              </span>
            </button>

            {/* Menu Dropdown de Gêneros */}
            {isGenreMenuOpen && (
              <>
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
                      className="text-zinc-500 hover:text-white p-1 rounded-md cursor-pointer"
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

        {/* Chips de filtro ativo */}
        {selectedGenreId !== 'all' && (
          <div className="mt-3 flex items-center justify-between gap-3 bg-zinc-900/80 p-3 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Exibindo catálogo filtrado por:</span>
              <span className="text-xs font-bold text-white bg-zinc-800 px-2.5 py-1 rounded-md border border-white/10">
                {selectedGenre.name}
              </span>
              <span className="text-xs text-zinc-500">
                ({catalogItems.length} títulos carregados)
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

      {/* =========================================================================
          2. RENDERIZAÇÃO DO CONTEÚDO (CARROSSÉIS E GRADE INFINITA)
         ========================================================================= */}
      {selectedGenreId === 'all' ? (
        <div className="space-y-8">
          {/* Carrosséis Temáticos Superiores */}
          <div className="space-y-4">
            {categorizedRows.map((row) => {
              const rowItems = row.items.length > 0 ? row.items : catalogItems.slice(0, 8);
              return (
                <MediaRow
                  key={row.id}
                  id={row.id}
                  title={row.title}
                  subtitle={row.subtitle}
                  items={rowItems}
                  isLoading={isLoading && catalogItems.length === 0}
                  onSelectMedia={onSelectMedia}
                />
              );
            })}
          </div>

          {/* Grade Completa com Rolagem Infinita (Infinite Scroll) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#e50914] rounded-full inline-block" />
                  <span>Catálogo Completo • {title}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {catalogItems.length} títulos carregados na tela • Role até o final para carregar mais capas
                </p>
              </div>
              <span className="text-xs font-semibold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/5">
                Página {currentPage}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {catalogItems.map((item, idx) => (
                <MediaSectionCard
                  key={`catalog-card-${item.id}-${idx}`}
                  item={item}
                  onSelectMedia={onSelectMedia}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* VISUALIZAÇÃO POR GÊNERO ESPECÍFICO */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {catalogItems.length > 0 ? (
            <div className="space-y-6">
              {/* Destaque em Carrossel do Gênero */}
              <MediaRow
                id={`genre-row-${selectedGenreId}`}
                title={`Destaques de ${selectedGenre.name}`}
                subtitle={`Navegue horizontalmente pelos títulos de ${selectedGenre.name}`}
                items={catalogItems.slice(0, 15)}
                isLoading={isLoading && catalogItems.length === 0}
                onSelectMedia={onSelectMedia}
              />

              {/* Grade de Todos os Títulos do Gênero */}
              <div className="pt-6 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#e50914] rounded-full inline-block" />
                    <span>Todos os títulos de {selectedGenre.name} ({catalogItems.length})</span>
                  </h3>
                  <span className="text-xs font-semibold bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/5">
                    Página {currentPage}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {catalogItems.map((item, idx) => (
                    <MediaSectionCard
                      key={`genre-grid-${item.id}-${idx}`}
                      item={item}
                      onSelectMedia={onSelectMedia}
                    />
                  ))}
                </div>
              </div>
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
                Experimente selecionar outro gênero ou retornar ao catálogo completo.
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

      {/* =========================================================================
          3. SENTINELA DO INFINITE SCROLL E INDICADOR DE CARREGAMENTO
         ========================================================================= */}
      <div
        id="infinite-scroll-sentinel"
        ref={sentinelRef}
        className="py-10 flex flex-col items-center justify-center min-h-[80px]"
      >
        {isLoadingMore && (
          <div className="flex items-center gap-3 text-zinc-200 bg-zinc-900/95 px-5 py-3 rounded-full border border-red-500/30 shadow-2xl shadow-black/80 animate-in fade-in duration-200">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#e50914] rounded-full animate-spin" />
            <span className="text-xs sm:text-sm font-semibold text-zinc-200">
              Carregando mais {title.toLowerCase()} (Página {currentPage + 1})...
            </span>
          </div>
        )}
        {!hasMore && catalogItems.length > 20 && (
          <p className="text-xs text-zinc-500 font-medium">
            Você chegou ao final do catálogo disponível de {title.toLowerCase()}.
          </p>
        )}
      </div>
    </div>
  );
};
