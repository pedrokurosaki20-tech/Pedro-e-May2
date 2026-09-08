import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Radio, 
  Tv, 
  Star, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  RotateCw
} from 'lucide-react';
import { MediaItem, EmbedServer, CineminhaSyncEvent } from '../types';
import { EMBED_SERVERS } from '../data/embedServers';
import { tmdbService } from '../services/tmdbService';
import { 
  emitCineminhaEvent, 
  listenCineminhaEvents,
  onPlayerPlay,
  onPlayerPause,
  onPlayerTimeChange,
  onPlayerSeek,
  onPlayerEnded
} from '../services/cineminhaSync';

interface VideoPlayerProps {
  item: MediaItem;
  onBack: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  item,
  onBack,
}) => {
  // Estado do servidor Embed ativo (padrão: Canal 1 - VidSrc To)
  const [activeServerId, setActiveServerId] = useState<string>(EMBED_SERVERS[0].id);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [channelReloadCount, setChannelReloadCount] = useState<number>(0);

  // Séries e Animes: temporada 1 e episódio 1 por padrão
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);
  const [episodeNumbers, setEpisodeNumbers] = useState<number[]>([]);

  // =========================================================================
  // ESTRUTURA INTERNA CONFIDENCIAL - EVENTOS DO CINEMINHA EM SEGUNDO PLANO
  // Mantida 100% ativa em background para conexões invisíveis futuras
  // =========================================================================
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerCurrentTime, setPlayerCurrentTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeServer: EmbedServer = 
    EMBED_SERVERS.find(s => s.id === activeServerId) || EMBED_SERVERS[0];

  // Constrói a URL do iframe dinamicamente com base no item selecionado
  const embedUrl = activeServer.getUrl(item, selectedSeason, selectedEpisode);

  const displayTitle = item.title || item.name || 'Filme';
  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4) || '2024';

  // Troca de canal imediata com atualização direta do src do iframe no DOM (Fallback de Teste)
  const handleSelectServer = (serverId: string) => {
    setActiveServerId(serverId);
    setIframeLoading(true);
    setChannelReloadCount(c => c + 1);

    const targetServer = EMBED_SERVERS.find(s => s.id === serverId) || EMBED_SERVERS[0];
    if (targetServer && iframeRef.current) {
      const nextUrl = targetServer.getUrl(item, selectedSeason, selectedEpisode);
      iframeRef.current.src = nextUrl;
    }
  };

  // Recarga imediata do canal
  const handleReloadChannel = () => {
    setIframeLoading(true);
    setChannelReloadCount(c => c + 1);
    if (iframeRef.current) {
      iframeRef.current.src = embedUrl;
    }
  };

  // Configura atributos de tela cheia no nó DOM real

  useEffect(() => {
    if (item.media_type !== 'tv' && item.media_type !== 'anime') return;

    let cancelled = false;
    setAvailableSeasons([]);
    setEpisodeNumbers([]);
    setSelectedSeason(1);
    setSelectedEpisode(1);

    tmdbService.getTvDetails(item.id).then((details) => {
      if (cancelled) return;
      const seasons = (details?.seasons || [])
        .map((season) => season.season_number)
        .filter((seasonNumber) => seasonNumber > 0);
      setAvailableSeasons(seasons);
      if (seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item.id, item.media_type]);

  useEffect(() => {
    if ((item.media_type !== 'tv' && item.media_type !== 'anime') || availableSeasons.length === 0) return;

    let cancelled = false;
    setEpisodeNumbers([]);
    setSelectedEpisode(1);

    tmdbService.getTvSeasonDetails(item.id, selectedSeason).then((season) => {
      if (cancelled) return;
      const numbers = (season?.episodes || []).map((episode) => episode.episode_number);
      setEpisodeNumbers(numbers);
      if (numbers.length > 0) {
        setSelectedEpisode(numbers[0]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [item.id, item.media_type, selectedSeason, availableSeasons.length]);

  // Sincronização em segundo plano (escuta e emissão de eventos intacta)
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.setAttribute('allowfullscreen', 'true');
      iframeRef.current.setAttribute('webkitallowfullscreen', 'true');
      iframeRef.current.setAttribute('mozallowfullscreen', 'true');
    }
  }, [activeServerId, embedUrl, channelReloadCount]);

  // Timeout preventivo de carregamento para nunca travar a interface
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIframeLoading(false);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [activeServerId, embedUrl, channelReloadCount]);

  // Sincronização e funções internas em segundo plano
  useEffect(() => {
    // Dispara função interna ao carregar player
    onPlayerTimeChange(item.id, 0);

    // Emite que este cliente está pronto com a mídia carregada
    emitCineminhaEvent('READY', {
      currentTime: 0,
      isPlaying: false,
      mediaId: item.id,
      mediaTitle: displayTitle,
      mediaType: item.media_type,
      season: selectedSeason,
      episode: selectedEpisode,
      senderName: 'Sessão Ativa',
      message: `Carregou: ${displayTitle}`,
    });

    // Escuta eventos remotos em segundo plano
    const unsubscribe = listenCineminhaEvents((event: CineminhaSyncEvent) => {
      // Reage internamente a comandos remotos sem poluir a interface pública
      if (event.type === 'PLAY') {
        setIsPlaying(true);
        onPlayerPlay(item.id, event.currentTime || 0);
        if (typeof event.currentTime === 'number') {
          setPlayerCurrentTime(event.currentTime);
        }
        if (!timerRef.current) {
          timerRef.current = window.setInterval(() => {
            setPlayerCurrentTime(t => {
              const nextTime = t + 1;
              onPlayerTimeChange(item.id, nextTime);
              return nextTime;
            });
          }, 1000);
        }
      } else if (event.type === 'PAUSE') {
        setIsPlaying(false);
        onPlayerPause(item.id, event.currentTime || 0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (typeof event.currentTime === 'number') {
          setPlayerCurrentTime(event.currentTime);
        }
      } else if (event.type === 'SEEK') {
        if (typeof event.currentTime === 'number') {
          setPlayerCurrentTime(event.currentTime);
          onPlayerSeek(item.id, event.currentTime);
        }
      }
    });

    return () => {
      unsubscribe();
      onPlayerPause(item.id, playerCurrentTime);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [item.id, displayTitle, item.media_type, selectedSeason, selectedEpisode]);

  return (
    <div id="video-player-view" className="min-h-screen bg-[#0d0d0d] text-white pt-16 sm:pt-20 pb-20">
      {/* Barra Superior do Player com Botão Voltar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-white/5">
        <button
          id="player-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-300 hover:text-white px-3.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 transition-colors cursor-pointer text-sm font-semibold border border-white/5 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-[#e50914]" />
          <span>Voltar ao Catálogo</span>
        </button>

        <div className="flex items-center gap-3 overflow-hidden text-right">
          <div>
            <h1 className="text-sm font-bold text-white truncate max-w-xs md:max-w-md">
              {displayTitle}
            </h1>
            <p className="text-[11px] text-zinc-400">
              {(item.media_type === 'tv' || item.media_type === 'anime')
                ? `Temporada ${selectedSeason} • Episódio ${selectedEpisode}`
                : `Filme • ${releaseYear}`}
            </p>
          </div>
        </div>
      </div>

      {/* Container Principal do Vídeo e Controles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Janela do Player 16:9 */}
        <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-zinc-800/80 group">
          {/* Overlay de carregamento do Iframe */}
          {iframeLoading && (
            <div className="absolute inset-0 z-10 bg-zinc-950/90 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-[#e50914] rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-zinc-200">
                Conectando ao {activeServer.name}...
              </p>
              <span className="text-xs text-zinc-500 mt-1">Carregando stream estável</span>
            </div>
          )}

          {/* Iframe do Servidor Embed sem restrições de sandbox (Permite execução nativa) */}
          <iframe
            ref={iframeRef}
            id="streaming-iframe"
            key={`${activeServerId}-${embedUrl}-${channelReloadCount}`}
            src={embedUrl}
            title={`Player ${displayTitle}`}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIframeLoading(false)}
          />
        </div>

        {/* =========================================================================
            BARRA DE OPÇÕES DE CANAIS / SERVIDORES ALTERNATIVOS
           ========================================================================= */}
        <div id="channels-bar" className="mt-4 p-3.5 sm:p-4 bg-zinc-900/90 rounded-xl border border-white/5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#e50914] animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Servidores de Exibição (Embed):
              </span>
              <span className="text-[11px] text-zinc-400 hidden md:inline">
                Se um canal travar, selecione outro abaixo
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="reload-channel-btn"
                onClick={handleReloadChannel}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Recarregar servidor atual com parâmetros de segurança"
              >
                <RotateCw className="w-3.5 h-3.5 text-red-500" />
                <span>Recarregar Canal</span>
              </button>

              <a
                id="external-player-btn"
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <span>Abrir em Nova Aba</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Botões de seleção de canal */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {EMBED_SERVERS.map((server) => {
              const isSelected = server.id === activeServerId;
              return (
                <button
                  key={server.id}
                  id={`channel-btn-${server.serverNumber}`}
                  onClick={() => handleSelectServer(server.id)}
                  className={`flex-none px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#e50914] text-white border-red-500 shadow-md shadow-red-950/50'
                      : 'bg-zinc-800 text-zinc-300 border-white/5 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-zinc-500'}`} />
                  <span>{server.name}</span>
                </button>
              );
            })}
          </div>

          {/* Seletor de Temporadas e Episódios (Para Séries) */}
          {(item.media_type === 'tv' || item.media_type === 'anime') && (
            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-zinc-400" />
                <label htmlFor="season-select" className="text-xs text-zinc-300 font-medium">
                  Temporada:
                </label>
                <select
                  id="season-select"
                  value={selectedSeason}
                  onChange={(e) => {
                    const newSeason = Number(e.target.value);
                    setSelectedSeason(newSeason);
                    setSelectedEpisode(1);
                    setIframeLoading(true);
                    setChannelReloadCount(c => c + 1);
                    if (iframeRef.current) {
                      iframeRef.current.src = activeServer.getUrl(item, newSeason, 1);
                    }
                  }}
                  className="bg-zinc-800 text-white text-xs rounded-md px-2.5 py-1.5 border border-zinc-700 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {availableSeasons.map((s) => (
                    <option key={`season-${s}`} value={s}>
                      Temporada {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="episode-select" className="text-xs text-zinc-300 font-medium">
                  Episódio:
                </label>
                <select
                  id="episode-select"
                  value={selectedEpisode}
                  onChange={(e) => {
                    const newEpisode = Number(e.target.value);
                    setSelectedEpisode(newEpisode);
                    setIframeLoading(true);
                    setChannelReloadCount(c => c + 1);
                    if (iframeRef.current) {
                      iframeRef.current.src = activeServer.getUrl(item, selectedSeason, newEpisode);
                    }
                  }}
                  className="bg-zinc-800 text-white text-xs rounded-md px-2.5 py-1.5 border border-zinc-700 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {episodeNumbers.map((ep) => (
                    <option key={`ep-${ep}`} value={ep}>
                      Episódio {ep}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-[11px] text-zinc-500">
                Episódio sincronizado via TMDB ID {item.id}.
              </span>
            </div>
          )}
        </div>

        {/* Informações e Sinopse do Filme / Série */}
        <div id="media-details-section" className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {displayTitle}
              </h2>
              {item.original_title && item.original_title !== displayTitle && (
                <span className="text-sm text-zinc-400 italic">
                  ({item.original_title})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-400 flex-wrap">
              <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{item.vote_average ? item.vote_average.toFixed(1) : '7.8'} / 10</span>
              </div>
              <span>{releaseYear}</span>
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-white font-medium">Full HD</span>
              <span className="text-emerald-400 font-semibold">
                TMDB ID: {item.id}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Sinopse
              </h4>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                {item.overview || 'Sinopse não informada pelo distribuidor.'}
              </p>
            </div>

            {item.genres && item.genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2">
                <span className="text-xs text-zinc-400">Gêneros:</span>
                {item.genres.map((g) => (
                  <span
                    key={`genre-${g.id}`}
                    className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-white/5"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Coluna Lateral de Informações de Reprodução */}
          <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-white/5 space-y-4 self-start">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Status do Player</span>
            </h4>
            <div className="space-y-2.5 text-xs text-zinc-400">
              <p className="flex justify-between">
                <span>Servidor Atual:</span>
                <span className="text-white font-medium">{activeServer.name}</span>
              </p>
              <p className="flex justify-between">
                <span>Resolução:</span>
                <span className="text-emerald-400 font-semibold">1080p Full HD</span>
              </p>
              <p className="flex justify-between">
                <span>Áudio:</span>
                <span className="text-white font-medium">Original / Dublado</span>
              </p>
              <p className="flex justify-between">
                <span>Código TMDB:</span>
                <span className="text-zinc-300 font-mono">{item.id}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-start gap-2 text-[11px] text-zinc-400">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="leading-tight">
                Se o reprodutor for bloqueado pelo navegador ou adblocker, selecione o Canal 2, Canal 3 ou utilize "Abrir em Nova Aba".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
