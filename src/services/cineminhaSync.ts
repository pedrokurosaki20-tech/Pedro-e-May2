/**
 * ============================================================================
 * PREPARAÇÃO PARA O CINEMINHA (SINCRONIZAÇÃO EM TEMPO REAL)
 * ============================================================================
 * 
 * Este módulo estrutura a camada de sincronização em tempo real para o recurso
 * "Cineminha". Ele foi projetado para sincronizar a reprodução de filmes e séries
 * entre um casal ou amigos, garantindo que ambos assistam exatamente ao mesmo tempo.
 * 
 * ARQUITETURA DE SINCRONIZAÇÃO PREVISTA:
 * 1. Emissão de Eventos (Client -> Server / WebRTC / WebSocket):
 *    - Sempre que o usuário local der Play, Pause, ou adiantar/voltar o tempo (Seek),
 *      a função `emitCineminhaEvent()` dispara uma mensagem contendo o tipo de ação,
 *      o timestamp exato (em segundos) e o ID do conteúdo.
 * 
 * 2. Recepção de Eventos (Server -> Client):
 *    - A função `listenCineminhaEvents()` escuta eventos remotos do parceiro(a).
 *      No futuro, você poderá plugar aqui sua conexão WebSocket (Socket.io), Firebase
 *      Firestore real-time listener, ou WebRTC DataChannel do app Cineminha.
 * 
 * 3. Teste Imediato no Preview:
 *    - O módulo usa `BroadcastChannel` do navegador nativo e eventos customizados.
 *    - Se você abrir o site em duas abas ou janelas simultâneas, elas sincronizam
 *      automaticamente as ações de Play, Pause e Troca de Tempo!
 * ============================================================================
 */

import { CineminhaEventType, CineminhaSyncEvent, MediaType } from '../types';

const CINEMINHA_CHANNEL_NAME = 'cineminha_sync_v1';
const LISTENERS: Array<(event: CineminhaSyncEvent) => void> = [];

// Instância do BroadcastChannel para sincronizar abas no mesmo navegador
let broadcastChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CINEMINHA_CHANNEL_NAME);
    broadcastChannel.onmessage = (messageEvent) => {
      const syncEvent: CineminhaSyncEvent = messageEvent.data;
      notifyListeners(syncEvent);
    };
  }
} catch (e) {
  console.info('BroadcastChannel não suportado neste ambiente, usando eventos locais.', e);
}

function notifyListeners(event: CineminhaSyncEvent) {
  LISTENERS.forEach((callback) => {
    try {
      callback(event);
    } catch (err) {
      console.error('Erro ao executar listener do Cineminha:', err);
    }
  });
}

/**
 * EMITE UM EVENTO DE SINCRONIZAÇÃO DO CINEMINHA
 * 
 * @param type Tipo de ação ('PLAY', 'PAUSE', 'SEEK', 'BUFFER', 'MESSAGE')
 * @param details Detalhes adicionais do player (tempo atual em segundos, filme, etc.)
 * 
 * Exemplo de uso no Player:
 * emitCineminhaEvent('PLAY', { currentTime: 142.5, mediaId: 533535, mediaTitle: 'Deadpool & Wolverine' });
 */
export function emitCineminhaEvent(
  type: CineminhaEventType,
  details: {
    currentTime: number;
    isPlaying: boolean;
    mediaId: number;
    mediaTitle: string;
    mediaType: MediaType;
    season?: number;
    episode?: number;
    senderName?: string;
    message?: string;
  }
): CineminhaSyncEvent {
  const syncEvent: CineminhaSyncEvent = {
    id: `cine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    mediaId: details.mediaId,
    mediaTitle: details.mediaTitle,
    mediaType: details.mediaType,
    currentTime: Math.max(0, Math.round(details.currentTime * 10) / 10),
    isPlaying: details.isPlaying,
    senderName: details.senderName || 'Você',
    timestamp: Date.now(),
    season: details.season,
    episode: details.episode,
    message: details.message,
  };

  // 1. Transmite via BroadcastChannel (sincroniza outras abas no mesmo navegador)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(syncEvent);
    } catch (err) {
      console.warn('Falha ao enviar mensagem via BroadcastChannel:', err);
    }
  }

  // 2. Notifica os listeners registrados na página atual
  notifyListeners(syncEvent);

  // 3. Ponto de extensão futuro para enviar para o aplicativo móvel Cineminha
  // Exemplo:
  // if (cineminhaSocket && cineminhaSocket.connected) {
  //   cineminhaSocket.emit('room:action', syncEvent);
  // }

  return syncEvent;
}

/**
 * ESCUTA EVENTOS DE SINCRONIZAÇÃO EMITIDOS PELO PARCEIRO OU PELO SISTEMA
 * 
 * @param callback Função chamada sempre que um evento de sincronização ocorrer
 * @returns Função de cleanup para desinscrever o listener quando o componente desmontar
 * 
 * Exemplo de uso no React:
 * useEffect(() => {
 *   const unsubscribe = listenCineminhaEvents((event) => {
 *     console.log('Evento do Cineminha recebido:', event);
 *     if (event.type === 'PAUSE') pauseVideo();
 *   });
 *   return () => unsubscribe();
 * }, []);
 */
export function listenCineminhaEvents(
  callback: (event: CineminhaSyncEvent) => void
): () => void {
  LISTENERS.push(callback);
  
  return () => {
    const index = LISTENERS.indexOf(callback);
    if (index !== -1) {
      LISTENERS.splice(index, 1);
    }
  };
}

/**
 * SINCRONIZA O ESTADO DE REPRODUÇÃO EM UM ÚNICO COMANDO
 * Útil para enviar uma "foto" do estado atual quando um novo parceiro entra na sala.
 */
export function syncPlaybackState(
  currentTime: number,
  isPlaying: boolean,
  mediaId: number,
  mediaTitle: string,
  mediaType: MediaType,
  partnerName = 'Você'
): CineminhaSyncEvent {
  return emitCineminhaEvent(isPlaying ? 'PLAY' : 'PAUSE', {
    currentTime,
    isPlaying,
    mediaId,
    mediaTitle,
    mediaType,
    senderName: partnerName,
  });
}

/**
 * SIMULA UMA AÇÃO DO PARCEIRO(A) PARA TESTES
 * Permite que o desenvolvedor/usuário teste a sincronia instantaneamente no preview
 * sem precisar de um segundo dispositivo conectado.
 */
export function simulatePartnerAction(
  type: CineminhaEventType,
  currentTime: number,
  mediaId: number,
  mediaTitle: string,
  mediaType: MediaType,
  partnerName = 'Meu Amor ❤️'
): CineminhaSyncEvent {
  const syncEvent: CineminhaSyncEvent = {
    id: `partner_${Date.now()}`,
    type,
    mediaId,
    mediaTitle,
    mediaType,
    currentTime,
    isPlaying: type === 'PLAY',
    senderName: partnerName,
    timestamp: Date.now(),
    message: `Ação remota simulada: ${type} em ${formatTime(currentTime)}`,
  };

  notifyListeners(syncEvent);
  return syncEvent;
}

/**
 * Formata segundos em string MM:SS ou HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ============================================================================
 * ESTRUTURA INTERNA CONFIDENCIAL - EVENTOS DO CINEMINHA EM SEGUNDO PLANO
 * ============================================================================
 * Funções JavaScript internas vazias associadas aos eventos do player de vídeo.
 * Mantidas estruturadas e comentadas em segundo plano, sem botões ou avisos
 * visuais na interface pública, prontas para conexões invisíveis futuras.
 * ============================================================================
 */

/**
 * Disparado internamente ao iniciar ou retomar a reprodução (Play)
 */
export function onPlayerPlay(mediaId?: number, currentTime?: number): void {
  // [ESTRUTURA INTERNA]: Executado em segundo plano ao dar Play
  // Mantido silencioso e confidencial para futuras conexões em background
}

/**
 * Disparado internamente ao pausar a reprodução (Pause)
 */
export function onPlayerPause(mediaId?: number, currentTime?: number): void {
  // [ESTRUTURA INTERNA]: Executado em segundo plano ao dar Pause
  // Mantido silencioso e confidencial para futuras conexões em background
}

/**
 * Disparado internamente ao alterar o tempo de reprodução (Seek/Time Change)
 */
export function onPlayerTimeChange(mediaId?: number, newTime?: number): void {
  // [ESTRUTURA INTERNA]: Executado em segundo plano ao alterar o tempo
  // Mantido silencioso e confidencial para futuras conexões em background
}

/**
 * Disparado internamente ao avançar ou retroceder a timeline
 */
export function onPlayerSeek(mediaId?: number, newTime?: number): void {
  // [ESTRUTURA INTERNA]: Executado em segundo plano no evento de seek
  onPlayerTimeChange(mediaId, newTime);
}

/**
 * Disparado internamente ao concluir a reprodução do vídeo
 */
export function onPlayerEnded(mediaId?: number): void {
  // [ESTRUTURA INTERNA]: Executado em segundo plano ao término da mídia
}

