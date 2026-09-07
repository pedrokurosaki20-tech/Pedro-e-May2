import React from 'react';
import { Film, ExternalLink } from 'lucide-react';
import { AppTab } from './Header';

interface FooterProps {
  onSelectTab?: (tab: AppTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer id="main-footer" className="bg-[#0f0f0f] border-t border-zinc-800/80 text-zinc-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Marca e Descrição */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center shadow-md shadow-red-950/40">
              <Film className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-2xl text-white tracking-wider leading-none">CINESTREAM</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Streaming Platform</span>
            </div>
          </div>

          <div className="text-zinc-500 text-xs">
            <span>Experiência completa em streaming de filmes, séries e animes em alta definição.</span>
          </div>
        </div>

        {/* Links de Apoio */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-zinc-500">
          <div>
            <h5 className="text-zinc-300 font-bold mb-2.5 text-xs uppercase tracking-wider">Navegação</h5>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('home')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('movies')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Filmes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('tv')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Séries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('animes')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Animes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab && onSelectTab('profile')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Perfil
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-zinc-300 font-bold mb-2.5 text-xs uppercase tracking-wider">Servidores Embed</h5>
            <ul className="space-y-1.5">
              <li><span className="hover:text-white transition-colors">Canal 1 (VidSrc To)</span></li>
              <li><span className="hover:text-white transition-colors">Canal 2 (Embed.su)</span></li>
              <li><span className="hover:text-white transition-colors">Canal 3 (VidSrc CC)</span></li>
              <li><span className="hover:text-white transition-colors">Canal 4 (AutoEmbed)</span></li>
            </ul>
          </div>
          <div>
            <h5 className="text-zinc-300 font-bold mb-2.5 text-xs uppercase tracking-wider">Transmissão</h5>
            <ul className="space-y-1.5">
              <li><span className="hover:text-white transition-colors">Ultra Alta Resolução (4K)</span></li>
              <li><span className="hover:text-white transition-colors">Full HD 1080p</span></li>
              <li><span className="hover:text-white transition-colors">Suporte a Legendas</span></li>
              <li><span className="hover:text-white transition-colors">Modo Cinema</span></li>
            </ul>
          </div>
          <div>
            <h5 className="text-zinc-300 font-bold mb-2.5 text-xs uppercase tracking-wider">Informações</h5>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.themoviedb.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Metadados TMDB</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="hover:text-white transition-colors">Termos & Privacidade</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer TMDB Legal e Direitos */}
        <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px]">
          <p>
            CineStream © {new Date().getFullYear()} • Todos os direitos reservados.
          </p>
          <p>
            Plataforma otimizada para navegadores desktop e mobile.
          </p>
        </div>
      </div>
    </footer>
  );
};
