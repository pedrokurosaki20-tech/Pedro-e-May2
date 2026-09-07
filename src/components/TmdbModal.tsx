import React, { useState } from 'react';
import { X, Key, CheckCircle, ExternalLink, RefreshCw, AlertCircle, Code } from 'lucide-react';
import { getActiveTmdbKey, setStoredTmdbKey, TMDB_API_KEY } from '../config/tmdb';

interface TmdbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const TmdbModal: React.FC<TmdbModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getActiveTmdbKey());
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    const trimmed = apiKeyInput.trim();

    if (!trimmed) {
      setStoredTmdbKey('');
      setStatusMessage({
        type: 'info',
        text: 'Chave removida. O aplicativo continuará funcionando perfeitamente com o catálogo local de filmes e séries em alta.',
      });
      setIsTesting(false);
      onKeyUpdated();
      return;
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/authentication?api_key=${trimmed}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setStoredTmdbKey(trimmed);
        setStatusMessage({
          type: 'success',
          text: 'Chave validada com sucesso! O catálogo agora busca filmes e séries diretamente do TMDB.',
        });
        onKeyUpdated();
      } else {
        setStatusMessage({
          type: 'error',
          text: `Chave inválida segundo o TMDB: ${data.status_message || 'Verifique se copiou a chave v3 auth corretamente.'}`,
        });
      }
    } catch (err) {
      // Fallback em caso de bloqueio de CORS local
      setStoredTmdbKey(trimmed);
      setStatusMessage({
        type: 'success',
        text: 'Chave salva localmente! O sistema tentará utilizá-la nas próximas requisições.',
      });
      onKeyUpdated();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="tmdb-modal-card"
        className="relative w-full max-w-lg bg-[#181818] border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-5 text-white"
      >
        {/* Botão de Fechar */}
        <button
          id="close-tmdb-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Configuração da API TheMovieDB (TMDB)
            </h3>
            <p className="text-xs text-zinc-400">
              Conecte sua chave para buscar dados atualizados em tempo real
            </p>
          </div>
        </div>

        {/* Instruções claras no código */}
        <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
            <Code className="w-4 h-4 text-red-500" />
            <span>Onde inserir a chave no código:</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Você pode inserir sua chave diretamente no arquivo{' '}
            <code className="bg-black/50 text-red-400 px-1.5 py-0.5 rounded font-mono text-[11px]">
              /src/config/tmdb.ts
            </code>
            :
          </p>
          <pre className="bg-black/70 p-2.5 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto border border-white/5">
            {`// /src/config/tmdb.ts\nexport const TMDB_API_KEY = "${TMDB_API_KEY || 'SUA_CHAVE_AQUI'}";`}
          </pre>
        </div>

        {/* Ou inserir diretamente pelo formulário */}
        <div className="space-y-2">
          <label htmlFor="tmdb-key-input" className="block text-xs font-semibold text-zinc-300">
            Ou cole sua API Key abaixo para testar agora no Preview:
          </label>
          <div className="relative">
            <input
              id="tmdb-key-input"
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Ex: 3fd2beeb0d7042ba3d02a05d99e..."
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-red-500 text-white rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-none placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Feedback visual */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Ações e Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <a
            href="https://www.themoviedb.org/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 underline"
          >
            <span>Criar chave gratuita no TMDB</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="close-modal-secondary-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors flex-1 sm:flex-none"
            >
              Fechar
            </button>
            <button
              id="save-tmdb-key-btn"
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="px-4 py-2 rounded-lg bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none shadow-lg shadow-red-950/50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <span>Salvar e Atualizar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
