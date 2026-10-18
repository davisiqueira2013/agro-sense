import type { CustoMensal, ResumoDashboard } from '../app/types';
import { api } from './api';

export const dashboardService = {
  /** GET /api/dashboard/resumo — RN08 */
  resumo: () => api<ResumoDashboard>('/dashboard/resumo'),

  /** GET /api/dashboard/custos?meses= — RN08 */
  custos: (meses = 6) => api<CustoMensal[]>(`/dashboard/custos?meses=${meses}`),
};
