import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../lib/AppError.js';
import { prisma } from '../lib/prisma.js';
import { verificarToken } from '../lib/token.js';

/**
 * Exige o cabeçalho "Authorization: Bearer <token>".
 * Valida o JWT, confere se o usuário ainda existe e está ativo,
 * e disponibiliza os dados em req.usuario.
 */
export const autenticar: RequestHandler = async (req, _res, next) => {
  const cabecalho = req.headers.authorization;
  if (!cabecalho?.startsWith('Bearer ')) {
    throw new AppError(401, 'TOKEN_AUSENTE', 'Faça login para continuar');
  }

  let usuarioId: number;
  try {
    usuarioId = Number(verificarToken(cabecalho.slice(7)).sub);
  } catch (erro) {
    if (erro instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'TOKEN_EXPIRADO', 'Sua sessão expirou. Faça login novamente');
    }
    throw new AppError(401, 'TOKEN_INVALIDO', 'Sessão inválida. Faça login novamente');
  }

  // Consulta o banco para que um usuário desativado perca o acesso na hora.
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true, perfil: true, ativo: true },
  });
  if (!usuario || !usuario.ativo) {
    throw new AppError(401, 'USUARIO_SEM_ACESSO', 'Usuário sem acesso ao sistema');
  }

  req.usuario = { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil };
  next();
};
