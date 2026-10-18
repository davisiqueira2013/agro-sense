import type { CategoriaInsumo, Insumo, InsumoEntrada, Movimentacao, ResumoEstoque, StatusInsumo, TipoMovimentacao } from '../app/types';
import { api } from './api';

export type FiltrosInsumos = { busca?: string; categoria?: CategoriaInsumo; status?: StatusInsumo };

export const insumosService = {
  /** GET /api/insumos?busca=&categoria=&status= */
  listar: (filtros: FiltrosInsumos = {}) => {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) if (valor) params.set(chave, String(valor));
    const query = params.toString();
    return api<Insumo[]>(`/insumos${query ? `?${query}` : ''}`);
  },

  /** GET /api/insumos/resumo */
  resumo: () => api<ResumoEstoque>('/insumos/resumo'),

  /** POST /api/insumos */
  criar: (dados: InsumoEntrada) => api<Insumo>('/insumos', { method: 'POST', body: JSON.stringify(dados) }),

  /** PUT /api/insumos/:id (não altera a quantidade) */
  atualizar: (id: number, dados: Partial<InsumoEntrada>) =>
    api<Insumo>(`/insumos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  /** POST /api/insumos/:id/movimentacoes — RN06: entrada ou saída em transação. */
  movimentar: (id: number, dados: { tipo: TipoMovimentacao; quantidade: number; custoUnitario?: number }) =>
    api<Insumo>(`/insumos/${id}/movimentacoes`, { method: 'POST', body: JSON.stringify(dados) }),

  /** GET /api/insumos/:id/movimentacoes */
  historico: (id: number) => api<Movimentacao[]>(`/insumos/${id}/movimentacoes`),
};
