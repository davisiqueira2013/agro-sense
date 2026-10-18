// Dados fictícios do protótipo (Fase 01).
// Todos os módulos, exceto Relatórios, já vêm da API.
// Cada array restante será substituído por uma chamada à API na Fase 02,
// por meio da camada src/services. Mantê-los separados das telas
// permite trocar a fonte de dados sem alterar os componentes visuais.

import type {
  Relatorio,
} from '../types';

export const relatorios: Relatorio[] = [
  { nome: 'Fechamento de Custos Mensal', data: '01 Dez 2026', tamanho: '2.4 MB' },
  { nome: 'Produtividade por Talhão', data: '15 Nov 2026', tamanho: '4.1 MB' },
  { nome: 'Histórico de Atividades (Semestre)', data: '01 Nov 2026', tamanho: '1.8 MB' },
  { nome: 'Inventário de Estoque Atualizado', data: '30 Out 2026', tamanho: '850 KB' },
];

/** Nome da propriedade exibido na barra lateral. */
export const NOME_FAZENDA = 'Fazenda Figueiredo';

