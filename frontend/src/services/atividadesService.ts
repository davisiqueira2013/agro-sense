import type { Atividade, AtividadeEntrada, SituacaoAtividade, TipoAtividade } from '../app/types';
import { api } from './api';

export type FiltrosAtividades = { situacao?: SituacaoAtividade; tipo?: TipoAtividade; talhaoId?: number };

export const atividadesService = {
  /** GET /api/atividades?situacao=&tipo=&talhaoId= */
  listar: (filtros: FiltrosAtividades = {}) => {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) if (valor) params.set(chave, String(valor));
    const query = params.toString();
    return api<Atividade[]>(`/atividades${query ? `?${query}` : ''}`);
  },

  /** POST /api/atividades */
  criar: (dados: AtividadeEntrada) => api<Atividade>('/atividades', { method: 'POST', body: JSON.stringify(dados) }),

  /** PUT /api/atividades/:id */
  atualizar: (id: number, dados: Partial<AtividadeEntrada>) =>
    api<Atividade>(`/atividades/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  /** PATCH /api/atividades/:id/status — RN04: iniciar ou concluir. */
  alterarStatus: (id: number, status: 'EM_ANDAMENTO' | 'CONCLUIDA') =>
    api<Atividade>(`/atividades/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  /** DELETE /api/atividades/:id */
  excluir: (id: number) => api<void>(`/atividades/${id}`, { method: 'DELETE' }),
};
