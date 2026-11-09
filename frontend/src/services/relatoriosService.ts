import { API_URL } from '../config';
import type { Relatorio, TipoRelatorio } from '../app/types';
import { api, ApiError, tokenStorage } from './api';

export const relatoriosService = {
  /** GET /api/relatorios */
  listar: () => api<Relatorio[]>('/relatorios'),

  /** POST /api/relatorios — RN12: o PDF é gerado no servidor e gravado no banco. */
  gerar: (dados: { tipo: TipoRelatorio; inicio: string; fim: string }) =>
    api<Relatorio>('/relatorios', { method: 'POST', body: JSON.stringify(dados) }),

  /** DELETE /api/relatorios/:id (ADMIN) */
  excluir: (id: number) => api<void>(`/relatorios/${id}`, { method: 'DELETE' }),

  /**
   * GET /api/relatorios/:id/pdf — baixa o PDF.
   * Não usa o cliente JSON: a resposta é binária, então lê como Blob e
   * dispara o download pelo navegador.
   */
  baixar: async (relatorio: Pick<Relatorio, 'id' | 'arquivo'>) => {
    const token = tokenStorage.ler();
    let resposta: Response;
    try {
      resposta = await fetch(`${API_URL}/relatorios/${relatorio.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      throw new ApiError(0, 'SEM_CONEXAO', 'Não foi possível conectar à API. Verifique se o backend está rodando.');
    }
    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      throw new ApiError(resposta.status, corpo.codigo ?? 'ERRO', corpo.erro ?? 'Não foi possível baixar o relatório');
    }
    const url = URL.createObjectURL(await resposta.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = relatorio.arquivo;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
