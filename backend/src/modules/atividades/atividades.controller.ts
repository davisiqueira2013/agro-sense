import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import {
  alterarStatusSchema,
  atualizarAtividadeSchema,
  criarAtividadeSchema,
  listarAtividadesSchema,
} from './atividades.schema.js';
import * as atividadesService from './atividades.service.js';

export async function listar(req: Request, res: Response) {
  res.json(await atividadesService.listar(listarAtividadesSchema.parse(req.query)));
}

export async function buscarPorId(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await atividadesService.buscarPorId(id));
}

export async function criar(req: Request, res: Response) {
  res.status(201).json(await atividadesService.criar(criarAtividadeSchema.parse(req.body)));
}

export async function atualizar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await atividadesService.atualizar(id, atualizarAtividadeSchema.parse(req.body)));
}

export async function alterarStatus(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { status } = alterarStatusSchema.parse(req.body);
  res.json(await atividadesService.alterarStatus(id, status));
}

export async function excluir(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await atividadesService.excluir(id);
  res.status(204).end();
}
