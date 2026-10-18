import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import { atualizarInsumoSchema, criarInsumoSchema, listarInsumosSchema, movimentacaoSchema } from './insumos.schema.js';
import * as insumosService from './insumos.service.js';

export async function listar(req: Request, res: Response) {
  res.json(await insumosService.listar(listarInsumosSchema.parse(req.query)));
}

export async function resumo(_req: Request, res: Response) {
  res.json(await insumosService.resumo());
}

export async function buscarPorId(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await insumosService.buscarPorId(id));
}

export async function criar(req: Request, res: Response) {
  res.status(201).json(await insumosService.criar(criarInsumoSchema.parse(req.body), req.usuario!.id));
}

export async function atualizar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await insumosService.atualizar(id, atualizarInsumoSchema.parse(req.body)));
}

export async function movimentar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.status(201).json(await insumosService.movimentar(id, movimentacaoSchema.parse(req.body), req.usuario!.id));
}

export async function historico(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await insumosService.historico(id));
}
