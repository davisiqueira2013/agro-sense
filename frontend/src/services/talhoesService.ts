import type { Talhao, TalhaoEntrada } from '../app/types';
import { api } from './api';

export const talhoesService = {
  /** GET /api/talhoes?busca= */
  listar: (busca = '') => api<Talhao[]>(`/talhoes${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),

  /** POST /api/talhoes */
  criar: (dados: TalhaoEntrada) => api<Talhao>('/talhoes', { method: 'POST', body: JSON.stringify(dados) }),

  /** PUT /api/talhoes/:id */
  atualizar: (id: number, dados: Partial<TalhaoEntrada>) =>
    api<Talhao>(`/talhoes/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  /** DELETE /api/talhoes/:id */
  excluir: (id: number) => api<void>(`/talhoes/${id}`, { method: 'DELETE' }),
};
