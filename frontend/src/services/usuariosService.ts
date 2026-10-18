import type { Responsavel, Usuario, UsuarioEntrada } from '../app/types';
import { api } from './api';

export const usuariosService = {
  /** GET /api/usuarios/responsaveis — usuários ativos para os campos de seleção. */
  responsaveis: () => api<Responsavel[]>('/usuarios/responsaveis'),

  /** GET /api/usuarios (ADMIN) */
  listar: () => api<Usuario[]>('/usuarios'),

  /** POST /api/usuarios (ADMIN) */
  criar: (dados: UsuarioEntrada) => api<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(dados) }),

  /** PUT /api/usuarios/:id (ADMIN) — senha opcional */
  atualizar: (id: number, dados: Partial<UsuarioEntrada>) =>
    api<Usuario>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),

  /** PATCH /api/usuarios/:id/status (ADMIN) — RN11 */
  alterarStatus: (id: number, ativo: boolean) =>
    api<Usuario>(`/usuarios/${id}/status`, { method: 'PATCH', body: JSON.stringify({ ativo }) }),
};
