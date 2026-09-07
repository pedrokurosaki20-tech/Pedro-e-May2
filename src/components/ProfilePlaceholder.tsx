import React from 'react';
import { User, Shield, Sliders, Bell, Laptop, Info } from 'lucide-react';

export const ProfilePlaceholder: React.FC = () => {
  return (
    <div id="profile-view" className="min-h-screen pt-20 sm:pt-24 pb-20 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-2xl bg-zinc-900/80 border border-white/5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#e50914] to-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/40 ring-4 ring-white/10">
              <User className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Perfil do Usuário
              </h1>
              <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-white/10 self-center sm:self-auto font-medium">
                Conta Principal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Gerencie suas preferências, listas salvas e conexões da plataforma.
            </p>
          </div>
        </div>

        {/* Notificação sutil da estrutura preparada */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
              Estrutura de Perfil Pronta
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Esta área foi estruturada para receber as configurações específicas de usuário, histórico e sincronização que serão configuradas internamente.
            </p>
          </div>
        </div>

        {/* Blocos de Estrutura Preparada (Placeholder sem funcionalidades ativas por enquanto) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5 text-zinc-200 font-bold text-sm">
              <Sliders className="w-4 h-4 text-[#e50914]" />
              <span>Preferências de Reprodução</span>
            </div>
            <p className="text-xs text-zinc-400">
              Opções de áudio padrão, legendas automáticas e qualidade de transmissão.
            </p>
            <div className="h-10 bg-zinc-800/50 rounded-lg border border-white/5 animate-pulse" />
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5 text-zinc-200 font-bold text-sm">
              <Laptop className="w-4 h-4 text-[#e50914]" />
              <span>Dispositivos Conectados</span>
            </div>
            <p className="text-xs text-zinc-400">
              Sessões ativas e controle de streaming simultâneo em múltiplos aparelhos.
            </p>
            <div className="h-10 bg-zinc-800/50 rounded-lg border border-white/5 animate-pulse" />
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5 text-zinc-200 font-bold text-sm">
              <Shield className="w-4 h-4 text-[#e50914]" />
              <span>Segurança & Privacidade</span>
            </div>
            <p className="text-xs text-zinc-400">
              Credenciais de acesso e parâmetros de segurança da conta.
            </p>
            <div className="h-10 bg-zinc-800/50 rounded-lg border border-white/5 animate-pulse" />
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5 text-zinc-200 font-bold text-sm">
              <Bell className="w-4 h-4 text-[#e50914]" />
              <span>Notificações & Avisos</span>
            </div>
            <p className="text-xs text-zinc-400">
              Avisos de novos episódios, lançamentos no catálogo e recomendações.
            </p>
            <div className="h-10 bg-zinc-800/50 rounded-lg border border-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
