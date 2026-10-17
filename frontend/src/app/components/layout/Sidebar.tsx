import { Leaf, LogOut } from 'lucide-react';
import { menuItems } from '../../navigation';
import type { TabId } from '../../types';
import { Avatar } from '../shared/Avatar';

type SidebarProps = {
  abaAtual: TabId;
  onTrocarAba: (aba: TabId) => void;
  usuario: { nome: string; perfil: string; fazenda: string };
  /** Contadores exibidos ao lado de itens do menu (ex.: alertas ativos). */
  badges?: Partial<Record<TabId, number>>;
  onSair: () => void;
};

export function Sidebar({ abaAtual, onTrocarAba, usuario, badges = {}, onSair }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0A120C] border-r border-[#1A2E20] flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="flex items-center gap-3 p-6 border-b border-[#1A2E20]">
        <div className="p-2 border border-[#1A2E20] rounded-lg bg-[#0C170F]">
          <Leaf className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight font-mono">Agro Sense</h2>
          <p className="text-[#5C8065] text-xs font-mono">{usuario.fazenda}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const ativo = abaAtual === item.id;
          const badge = badges[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTrocarAba(item.id)}
              aria-current={ativo ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                ativo
                  ? 'bg-[#122216] border-[#1A3320] text-green-400 font-medium'
                  : 'border-transparent text-gray-400 hover:bg-[#122216]/40 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.id}</span>
              </div>
              {!!badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1A2E20] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar nome={usuario.nome} />
          <div>
            <p className="text-sm font-medium text-white leading-tight">{usuario.nome}</p>
            <p className="text-xs text-[#5C8065] font-mono">{usuario.perfil}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSair}
          title="Sair"
          aria-label="Sair"
          className="p-2 text-gray-500 hover:text-white hover:bg-[#122216] rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
