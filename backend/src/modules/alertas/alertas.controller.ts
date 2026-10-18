import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import { criarAlertaSchema, listarAlertasSchema } from './alertas.schema.js';
import * as alertasService from './alertas.service.js';

export async function listar(req: Request, res: Response) {
  const { situacao } = listarAlertasSchema.parse(req.query);
  res.json(await alertasService.listar(situacao));
}

export async function criar(req: Request, res: Response) {
  res.status(201).json(await alertasService.criar(criarAlertaSchema.parse(req.body)));
}

export async function encerrar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  res.json(await alertasService.encerrar(id));
}

export async function sincronizar(_req: Request, res: Response) {
  res.json(await alertasService.sincronizar());
}
