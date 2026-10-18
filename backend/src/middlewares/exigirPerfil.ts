import type { RequestHandler } from 'express';
import type { Perfil } from '../generated/prisma/client.js';
import { AppError } from '../lib/AppError.js';

/**
 * RN02 — Restringe a rota aos perfis informados. Usar depois de "autenticar".
 * Exemplo: router.post('/', exigirPerfil('ADMIN', 'TECNICO'), controller.criar)
 */
export const exigirPerfil =
  (...perfis: Perfil[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      throw new AppError(403, 'SEM_PERMISSAO', 'Seu perfil não tem permissão para esta ação');
    }
    next();
  };
