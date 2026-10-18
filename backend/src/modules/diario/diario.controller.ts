import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import { atualizarRegistroSchema, criarRegistroSchema, listarRegistrosSchema } from './diario.schema.js';
import * as diarioService from './diario.service.js';

export async function listar(req: Request, res: Response) {
  res.json(await diarioService.listar(listarRegistrosSchema.parse(req.query)));
}

export async function criar(req: Request, res: Response) {
  res.status(201).json(await diarioService.criar(criarRegistroSchema.parse(req.body), req.usuario!.id));
}

export async function atualizar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await diarioService.atualizar(id, atualizarRegistroSchema.parse(req.body), req.usuario!));
}

export async function excluir(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await diarioService.excluir(id, req.usuario!);
  res.status(204).end();
}
