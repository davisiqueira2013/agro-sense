import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import { alterarStatusSchema, atualizarUsuarioSchema, criarUsuarioSchema } from './usuarios.schema.js';
import * as usuariosService from './usuarios.service.js';

export async function listar(_req: Request, res: Response) {
  res.json(await usuariosService.listar());
}

export async function responsaveis(_req: Request, res: Response) {
  res.json(await usuariosService.responsaveis());
}

export async function criar(req: Request, res: Response) {
  res.status(201).json(await usuariosService.criar(criarUsuarioSchema.parse(req.body)));
}

export async function atualizar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await usuariosService.atualizar(id, atualizarUsuarioSchema.parse(req.body), req.usuario!.id));
}

export async function alterarStatus(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { ativo } = alterarStatusSchema.parse(req.body);
  res.json(await usuariosService.alterarStatus(id, ativo, req.usuario!.id));
}
