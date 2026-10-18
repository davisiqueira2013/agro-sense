import type { AlertaClimatico, AlertaEntrada, ResultadoSincronizacao } from '../app/types';
import { api } from './api';

export type SituacaoFiltro = 'ativos' | 'encerrados' | 'todos';

export const alertasService = {
  /** GET /api/alertas?situacao= */
  listar: (situacao: SituacaoFiltro = 'ativos') => api<AlertaClimatico[]>(`/alertas?situacao=${situacao}`),

  /** POST /api/alertas — registro manual */
  criar: (dados: AlertaEntrada) => api<AlertaClimatico>('/alertas', { method: 'POST', body: JSON.stringify(dados) }),

  /** PATCH /api/alertas/:id/encerrar */
  encerrar: (id: number) => api<AlertaClimatico>(`/alertas/${id}/encerrar`, { method: 'PATCH' }),

  /** POST /api/alertas/sincronizar — RN09: previsão do Open-Meteo */
  sincronizar: () => api<ResultadoSincronizacao>('/alertas/sincronizar', { method: 'POST' }),
};
