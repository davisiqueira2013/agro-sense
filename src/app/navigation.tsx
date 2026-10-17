import type { ReactNode } from 'react';
import { Activity, BookOpen, CloudLightning, FileText, Layers, LayoutGrid, Package, Users } from 'lucide-react';
import type { TabId } from './types';

export type MenuItem = { id: TabId; icon: ReactNode };

/** Itens do menu lateral, na ordem em que aparecem. */
export const menuItems: MenuItem[] = [
  { id: 'Dashboard', icon: <LayoutGrid size={20} /> },
  { id: 'Talhões', icon: <Layers size={20} /> },
  { id: 'Atividades', icon: <Activity size={20} /> },
  { id: 'Diário de Campo', icon: <BookOpen size={20} /> },
  { id: 'Estoque', icon: <Package size={20} /> },
  { id: 'Alertas Climáticos', icon: <CloudLightning size={20} /> },
  { id: 'Relatórios PDF', icon: <FileText size={20} /> },
  { id: 'Usuários', icon: <Users size={20} /> },
];
