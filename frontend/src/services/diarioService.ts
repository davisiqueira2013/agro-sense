import type { CategoriaRegistro, RegistroDiario, RegistroEntrada } from '../app/types';
import { api } from './api';

export type FiltrosDiario = { busca?: string; categoria?: CategoriaRegistro; talhaoId?: number };

export const diarioService = {
  /** GET /api/diario?busca=&categoria=&talhaoId= */
  listar: (filtros: FiltrosDiario = {}) => {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) if (valor) params.set(chave, String(valor));
    const query = params.toString();
    return api<RegistroDiario[]>(`/diario${query ? `?${query}` : ''}`);
  },

  /** POST /api/diario — o autor é definido pela API (RN10). */
  criar: (dados: RegistroEntrada) => api<RegistroDiario>('/diario', { method: 'POST', body: JSON.stringify(dados) }),

  /** PUT /api/diario/:id */
  atualizar: (id: number, dados: Partial<RegistroEntrada>) =>
    api<RegistroDiario>(`/diario/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  /** DELETE /api/diario/:id */
  excluir: (id: number) => api<void>(`/diario/${id}`, { method: 'DELETE' }),
};
