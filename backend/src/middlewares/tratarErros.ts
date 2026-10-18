import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { AppError } from '../lib/AppError.js';

/** Formato único de erro da API: { erro, codigo, detalhes? } */
type CorpoErro = { erro: string; codigo: string; detalhes?: unknown };

/** Rota inexistente → 404. */
export const rotaNaoEncontrada: RequestHandler = (req, res) => {
  const corpo: CorpoErro = { erro: `Rota não encontrada: ${req.method} ${req.path}`, codigo: 'ROTA_NAO_ENCONTRADA' };
  res.status(404).json(corpo);
};

/** Converte qualquer erro lançado nas rotas em uma resposta JSON padronizada. */
export const tratarErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  let status = 500;
  let corpo: CorpoErro = { erro: 'Erro interno no servidor', codigo: 'ERRO_INTERNO' };

  if (erro instanceof AppError) {
    status = erro.status;
    corpo = { erro: erro.message, codigo: erro.codigo, detalhes: erro.detalhes };
  } else if (erro instanceof ZodError) {
    // Dados enviados não passaram na validação → 400 com a lista de campos.
    status = 400;
    corpo = {
      erro: 'Dados inválidos',
      codigo: 'DADOS_INVALIDOS',
      detalhes: erro.issues.map((issue) => ({ campo: issue.path.join('.'), mensagem: issue.message })),
    };
  } else if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === 'P2002') {
      status = 409;
      corpo = { erro: 'Já existe um registro com esse valor único', codigo: 'REGISTRO_DUPLICADO' };
    } else if (erro.code === 'P2025') {
      status = 404;
      corpo = { erro: 'Registro não encontrado', codigo: 'NAO_ENCONTRADO' };
    } else if (erro.code === 'P2003') {
      status = 409;
      corpo = { erro: 'O registro está vinculado a outros dados', codigo: 'REGISTRO_VINCULADO' };
    }
  } else if (erro instanceof SyntaxError && 'body' in erro) {
    status = 400;
    corpo = { erro: 'JSON inválido no corpo da requisição', codigo: 'JSON_INVALIDO' };
  }

  if (status === 500) console.error(erro);
  res.status(status).json(corpo);
};
