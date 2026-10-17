import { Bell } from 'lucide-react';
import type { TabId } from '../../types';
import { Avatar } from '../shared/Avatar';

type HeaderProps = {
  abaAtual: TabId;
  nomeUsuario: string;
  temNotificacao: boolean;
};

export function Header({ abaAtual, nomeUsuario, temNotificacao }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[#1A2E20] flex items-center justify-between px-8 bg-[#08100A]/50 backdrop-blur sticky top-0 z-10">
      <div className="text-sm font-mono text-[#5C8065]">
        Módulo ativo: <span className="text-white font-bold">{abaAtual}</span>
      </div>
      <div className="flex items-center gap-6">
        <button type="button" aria-label="Notificações" className="text-gray-400 hover:text-white transition-colors relative cursor-pointer">
          <Bell size={20} />
          {temNotificacao && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
        <Avatar nome={nomeUsuario} />
      </div>
    </header>
  );
}
