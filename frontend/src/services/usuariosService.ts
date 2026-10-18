import type { Responsavel } from '../app/types';
import { api } from './api';

export const usuariosService = {
  /** GET /api/usuarios/responsaveis — usuários ativos para os campos de seleção. */
  responsaveis: () => api<Responsavel[]>('/usuarios/responsaveis'),
};
