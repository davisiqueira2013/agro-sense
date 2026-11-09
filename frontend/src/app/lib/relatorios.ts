import type { TipoRelatorio } from '../types';

/** Tipos de relatório (RN12), com o texto exibido na interface. */
export const TIPOS_RELATORIO: { valor: TipoRelatorio; nome: string; descricao: string }[] = [
  { valor: 'CUSTOS', nome: 'Custos', descricao: 'Compras de insumos por categoria, por mês e item a item' },
  { valor: 'ATIVIDADES', nome: 'Atividades', descricao: 'Atividades previstas no período, com situação e responsável' },
  { valor: 'ESTOQUE', nome: 'Estoque', descricao: 'Posição atual de cada insumo e movimentações do período' },
];
