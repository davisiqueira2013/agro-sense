import type { UsuarioLogado } from '../app/types';
import { api } from './api';

type LoginResposta = { token: string; usuario: UsuarioLogado };

export const authService = {
  /** POST /api/auth/login */
  login: (email: string, senha: string) =>
    api<LoginResposta>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  /** GET /api/auth/me — confere se o token salvo ainda vale. */
  me: () => api<UsuarioLogado>('/auth/me'),
};
