import type { Request, Response } from 'express';
import { loginSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response) {
  const dados = loginSchema.parse(req.body);
  res.json(await authService.login(dados));
}

export async function me(req: Request, res: Response) {
  res.json(await authService.buscarUsuarioLogado(req.usuario!.id));
}
