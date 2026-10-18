import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import { atualizarTalhaoSchema, criarTalhaoSchema, listarTalhoesSchema } from './talhoes.schema.js';
import * as talhoesService from './talhoes.service.js';

export async function listar(req: Request, res: Response) {
  res.json(await talhoesService.listar(listarTalhoesSchema.parse(req.query)));
}

export async function buscarPorId(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await talhoesService.buscarPorId(id));
}

export async function criar(req: Request, res: Response) {
  const talhao = await talhoesService.criar(criarTalhaoSchema.parse(req.body));
  res.status(201).json(talhao);
}

export async function atualizar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await talhoesService.atualizar(id, atualizarTalhaoSchema.parse(req.body)));
}

export async function excluir(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await talhoesService.excluir(id);
  res.status(204).end();
}
