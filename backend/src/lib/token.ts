import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Perfil } from '../generated/prisma/client.js';
import { env } from './env.js';

/** Dados guardados dentro do token JWT. */
export type PayloadToken = { sub: string; nome: string; perfil: Perfil };

export function gerarToken(usuario: { id: number; nome: string; perfil: Perfil }) {
  const payload = { nome: usuario.nome, perfil: usuario.perfil };
  const opcoes: SignOptions = { subject: String(usuario.id), expiresIn: env.JWT_EXPIRA_EM as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, opcoes);
}

/** Lança erro se o token for inválido ou estiver expirado. */
export function verificarToken(token: string): PayloadToken {
  return jwt.verify(token, env.JWT_SECRET) as PayloadToken;
}
