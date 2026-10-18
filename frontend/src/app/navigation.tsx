import type { ReactNode } from 'react';
import { Activity, BookOpen, CloudLightning, FileText, Layers, LayoutGrid, Package, Users } from 'lucide-react';
import type { Perfil, TabId } from './types';

/** perfis: quem vê o item (ausente = todos os perfis). */
export type MenuItem = { id: TabId; icon: ReactNode; perfis?: Perfil[] };

/** Itens do menu lateral, na ordem em que aparecem. */
export const menuItems: MenuItem[] = [
  { id: 'Dashboard', icon: <LayoutGrid size={20} /> },
  { id: 'Talhões', icon: <Layers size={20} /> },
  { id: 'Atividades', icon: <Activity size={20} /> },
  { id: 'Diário de Campo', icon: <BookOpen size={20} /> },
  { id: 'Estoque', icon: <Package size={20} /> },
  { id: 'Alertas Climáticos', icon: <CloudLightning size={20} /> },
  { id: 'Relatórios PDF', icon: <FileText size={20} /> },
  // RN02 — só administradores gerenciam usuários.
  { id: 'Usuários', icon: <Users size={20} />, perfis: ['ADMIN'] },
];

/** Itens do menu que o perfil pode acessar. */
export const menuDoPerfil = (perfil: Perfil) => menuItems.filter((item) => !item.perfis || item.perfis.includes(perfil));

export const nomeDoPerfil: Record<Perfil, string> = {
  ADMIN: 'Administrador',
  TECNICO: 'Técnico',
  LEITOR: 'Leitor',
};
