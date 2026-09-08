import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Tv, Star, CheckCircle2, ShieldAlert } from 'lucide-react';
import { MediaItem, EmbedServer, CineminhaSyncEvent } from '../types';
import { PLAYER_SERVER_GROUPS } from '../data/embedServers';
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
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [resolvedServer, setResolvedServer] = useState<EmbedServer | null>(null);

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
  const probeCleanupRef = useRef<(() => void) | null>(null);
  const fallbackIndexRef = useRef<number>(0);

  const displayTitle = item.title || item.name || 'Filme';
  const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4) || '2024';

  const embedUrl = resolvedServer?.getUrl(item, selectedSeason, selectedEpisode) || '';

  useEffect(() => {
    let cancelled = false;
    const probeFrames: HTMLIFrameElement[] = [];
    const timeoutIds: number[] = [];
    let groupIndex = 0;
    let settled = false;

    const cleanup = () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      probeFrames.forEach((frame) => frame.remove());
      probeFrames.length = 0;
    };
    probeCleanupRef.current?.();
    probeCleanupRef.current = cleanup;
    setIframeLoading(true);
    setResolvedServer(null);
    fallbackIndexRef.current = 0;
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }

    const runGroup = () => {
      if (cancelled || settled || groupIndex >= PLAYER_SERVER_GROUPS.length) {
        if (!settled && iframeRef.current) setIframeLoading(false);
        return;
      }

      const servers = PLAYER_SERVER_GROUPS[groupIndex++];
      let pending = servers.length;
      const tryServer = (server: EmbedServer) => {
        if (cancelled || settled) return;
        const frame = document.createElement('iframe');
        const url = server.getUrl(item, selectedSeason, selectedEpisode);
        frame.style.display = 'none';
        frame.onload = () => {
          if (cancelled || settled) return;
          settled = true;
          cleanup();
          fallbackIndexRef.current = PLAYER_SERVER_GROUPS.flat().indexOf(server);
          setResolvedServer(server);
          setIframeLoading(false);
          if (iframeRef.current) {
            iframeRef.current.src = 'about:blank';
            requestAnimationFrame(() => {
              if (!cancelled && iframeRef.current) iframeRef.current.src = url;
            });
          }
        };
        frame.onerror = () => {
          pending -= 1;
          if (pending === 0) runGroup();
        };
        probeFrames.push(frame);
        document.body.appendChild(frame);
        timeoutIds.push(window.setTimeout(() => {
          if (settled || cancelled) return;
          frame.remove();
          pending -= 1;
          if (pending === 0) runGroup();
        }, 7000));
        frame.src = url;
      };
      servers.forEach(tryServer);
    };

    runGroup();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [item.id, item.media_type, selectedSeason, selectedEpisode]);

  const handleIframeError = () => {
    const servers = PLAYER_SERVER_GROUPS.flat();
    const nextIndex = fallbackIndexRef.current + 1;
    const nextServer = servers[nextIndex];
    if (!nextServer || !iframeRef.current) {
      setIframeLoading(false);
      return;
    }

    fallbackIndexRef.current = nextIndex;
    const nextUrl = nextServer.getUrl(item, selectedSeason, selectedEpisode);
    setIframeLoading(true);
    setResolvedServer(nextServer);
    iframeRef.current.src = 'about:blank';
    requestAnimationFrame(() => {
      if (iframeRef.current) iframeRef.current.src = nextUrl;
    });
  };

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
  }, [resolvedServer, embedUrl]);

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
                Buscando o melhor player disponível...
              </p>
              <span className="text-xs text-zinc-500 mt-1">Carregando stream estável</span>
            </div>
          )}

          {/* Iframe do Servidor Embed sem restrições de sandbox (Permite execução nativa) */}
          <iframe
            ref={iframeRef}
            id="streaming-iframe"
            key={embedUrl || 'player-loading'}
            src={embedUrl}
            title={`Player ${displayTitle}`}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={handleIframeError}
            onLoad={() => setIframeLoading(false)}
          />
        </div>

        <div id="player-controls" className="mt-4 p-3.5 sm:p-4 bg-zinc-900/90 rounded-xl border border-white/5 space-y-3">
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
                    if (iframeRef.current) iframeRef.current.src = '';
                    setSelectedSeason(newSeason);
                    setSelectedEpisode(1);
                    setIframeLoading(true);
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
                    if (iframeRef.current) iframeRef.current.src = '';
                    setSelectedEpisode(newEpisode);
                    setIframeLoading(true);
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
                <span className="text-white font-medium">{resolvedServer?.name || 'Selecionando player'}</span>
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
                Se o reprodutor for bloqueado pelo navegador ou adblocker, a fila tentará automaticamente o próximo servidor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
