import { Bell, Menu } from 'lucide-react';
import type { TabId } from '../../types';
import { Avatar } from '../shared/Avatar';

type HeaderProps = {
  abaAtual: TabId;
  nomeUsuario: string;
  temNotificacao: boolean;
  /** Abre o menu lateral no celular/tablet. */
  onAbrirMenu: () => void;
};

export function Header({ abaAtual, nomeUsuario, temNotificacao, onAbrirMenu }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#1A2E20] flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 bg-[#08100A]/80 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menu"
          aria-controls="menu-principal"
          className="-ml-2 p-2 text-gray-300 hover:text-white hover:bg-[#122216] rounded-lg cursor-pointer lg:hidden"
        >
          <Menu size={22} />
        </button>
        <div className="text-sm font-mono text-[#5C8065] truncate">
          <span className="hidden sm:inline">Módulo ativo: </span>
          <span className="text-white font-bold">{abaAtual}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <button type="button" aria-label="Notificações" className="text-gray-400 hover:text-white transition-colors relative cursor-pointer">
          <Bell size={20} />
          {temNotificacao && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
        <Avatar nome={nomeUsuario} />
      </div>
    </header>
  );
}
