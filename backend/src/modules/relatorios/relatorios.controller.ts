import type { Request, Response } from 'express';
import { idParamSchema } from '../../lib/validacao.js';
import { gerarRelatorioSchema } from './relatorios.schema.js';
import * as relatoriosService from './relatorios.service.js';

export async function listar(_req: Request, res: Response) {
  res.json(await relatoriosService.listar());
}

export async function gerar(req: Request, res: Response) {
  res.status(201).json(await relatoriosService.gerar(gerarRelatorioSchema.parse(req.body), req.usuario!.id));
}

export async function baixar(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  const { arquivo, conteudo } = await relatoriosService.baixar(id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${arquivo}"`);
  res.setHeader('Content-Length', conteudo.length);
  res.send(conteudo);
}

export async function excluir(req: Request, res: Response) {
  const { id } = idParamSchema.parse(req.params);
  await relatoriosService.excluir(id);
  res.status(204).end();
}
