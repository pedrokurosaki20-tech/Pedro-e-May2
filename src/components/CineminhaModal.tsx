import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Copy, 
  Check, 
  Activity, 
  Users, 
  Radio, 
  Play, 
  Pause, 
  Clock, 
  Code,
  Info
} from 'lucide-react';
import { CineminhaSyncEvent } from '../types';
import { listenCineminhaEvents, formatTime, simulatePartnerAction } from '../services/cineminhaSync';

interface CineminhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CineminhaModal: React.FC<CineminhaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [roomCode] = useState('AMOR-2026');
  const [eventLogs, setEventLogs] = useState<CineminhaSyncEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'architecture' | 'help'>('logs');

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = listenCineminhaEvents((event) => {
      setEventLogs((prev) => [event, ...prev].slice(0, 30));
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = (type: 'PLAY' | 'PAUSE' | 'SEEK') => {
    const time = Math.floor(Math.random() * 300) + 60;
    simulatePartnerAction(type, time, 533535, 'Deadpool & Wolverine', 'movie');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        id="cineminha-modal-card"
        className="relative w-full max-w-2xl bg-[#181818] border border-rose-900/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Botão de Fechar */}
        <button
          id="close-cineminha-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar modal do Cineminha"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-[#e50914] flex items-center justify-center shadow-lg shadow-rose-950/50">
            <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Sincronização Cineminha</span>
              <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-full">
                Protocolo Ativo
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Conexão em tempo real para sincronizar o vídeo entre o casal
            </p>
          </div>
        </div>

        {/* Status da Sala e Código de Conexão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-zinc-900/90 rounded-xl border border-white/5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
              Código da Sala do Casal
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold text-rose-400 tracking-wider">
                {roomCode}
              </span>
              <button
                id="copy-room-code-btn"
                onClick={copyRoomCode}
                className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Copiar código"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">
              Status do Parceiro(a)
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                <Users className="w-4 h-4" /> Conectado & Sincronizado
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'text-rose-400 border-b-2 border-rose-500 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Registro de Eventos ao Vivo ({eventLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'text-rose-400 border-b-2 border-rose-500 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Código & Integração App</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`pb-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'help'
                ? 'text-rose-400 border-b-2 border-rose-500 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Como Testar Agora</span>
          </button>
        </div>

        {/* Conteúdo da Tab: Logs de Eventos */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {/* Simuladores de teste rápido */}
            <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-zinc-400 font-medium">
                Simular ação remota do parceiro(a):
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulate('PLAY')}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Simular Play</span>
                </button>
                <button
                  onClick={() => handleSimulate('PAUSE')}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Pause className="w-3 h-3" />
                  <span>Simular Pause</span>
                </button>
                <button
                  onClick={() => handleSimulate('SEEK')}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  <span>Mudar Tempo</span>
                </button>
              </div>
            </div>

            {/* Lista de Logs */}
            <div className="h-48 overflow-y-auto space-y-2 pr-1 text-xs">
              {eventLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center py-6">
                  <Radio className="w-8 h-8 mb-2 opacity-50 text-rose-500 animate-pulse" />
                  <p>Aguardando ações no player...</p>
                  <span className="text-[11px]">Dê play, pause ou teste os botões acima</span>
                </div>
              ) : (
                eventLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.type === 'PLAY'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                            : log.type === 'PAUSE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="font-semibold text-white">{log.senderName}:</span>
                      <span className="text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
                        {log.message || `${log.mediaTitle} em ${formatTime(log.currentTime)}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Conteúdo da Tab: Arquitetura & Integração */}
        {activeTab === 'architecture' && (
          <div className="space-y-3 text-xs text-zinc-300">
            <p className="leading-relaxed">
              O módulo <code className="text-rose-400 font-mono">/src/services/cineminhaSync.ts</code> já implementa as funções prontas para conexão com o aplicativo Cineminha:
            </p>
            <pre className="p-3 bg-black/70 rounded-xl font-mono text-[11px] text-zinc-300 overflow-x-auto border border-white/5 leading-relaxed">
{`// 1. DISPARAR EVENTO (Play, Pause, Mudar de Tempo):
emitCineminhaEvent('PLAY', {
  currentTime: 120.5,
  isPlaying: true,
  mediaId: 533535,
  mediaTitle: 'Deadpool & Wolverine'
});

// 2. ESCUTAR EVENTOS DO PARCEIRO(A):
listenCineminhaEvents((event) => {
  if (event.type === 'PLAY') video.play();
  if (event.type === 'PAUSE') video.pause();
  if (event.type === 'SEEK') video.currentTime = event.currentTime;
});`}
            </pre>
            <p className="text-zinc-400 text-[11px]">
              Quando você desenvolver o app Cineminha móvel (React Native / Flutter / Kotlin), basta conectar essas duas funções a um servidor de WebSockets (ex: Socket.io) ou WebRTC DataChannel.
            </p>
          </div>
        )}

        {/* Conteúdo da Tab: Como Testar Agora */}
        {activeTab === 'help' && (
          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl space-y-2">
              <h4 className="font-bold text-rose-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-rose-400" />
                Como testar a sincronização entre 2 abas agora:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-zinc-300 leading-relaxed">
                <li>Abra este projeto em uma <strong>segunda aba</strong> do seu navegador.</li>
                <li>Na primeira aba, dê <strong>Play</strong> ou <strong>Pause</strong> no reprodutor de vídeo.</li>
                <li>Veja que a segunda aba recebe imediatamente o evento via <strong>BroadcastChannel</strong> nativo!</li>
                <li>Isso comprova que o protocolo de sincronização do Cineminha está 100% operacional.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
