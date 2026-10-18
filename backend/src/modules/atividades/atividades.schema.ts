import { z } from 'zod';
import { dataCalendario } from '../../lib/validacao.js';

export const TIPOS_ATIVIDADE = ['PLANTIO', 'PULVERIZACAO', 'ADUBACAO', 'COLHEITA', 'IRRIGACAO'] as const;
export const STATUS_ATIVIDADE = ['AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA'] as const;
/** Situação exibida: o status gravado + "ATRASADA", calculada pela API (RN04). */
export const SITUACOES = ['AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA'] as const;

const id = (campo: string) => z.coerce.number({ message: `Selecione ${campo}` }).int().positive(`Selecione ${campo}`);

/** Corpo de POST /atividades. */
export const criarAtividadeSchema = z.object({
  tipo: z.enum(TIPOS_ATIVIDADE, { message: 'Selecione o tipo de atividade' }),
  talhaoId: id('o talhão'),
  responsavelId: id('o responsável'),
  dataPrevista: dataCalendario('Data prevista'),
  observacao: z.string().trim().max(500, 'Observação muito longa').optional(),
});

/** Corpo de PUT /atividades/:id. */
export const atualizarAtividadeSchema = criarAtividadeSchema.partial();

/** Corpo de PATCH /atividades/:id/status — iniciar ou concluir. */
export const alterarStatusSchema = z.object({
  status: z.enum(['EM_ANDAMENTO', 'CONCLUIDA'], { message: 'Status deve ser EM_ANDAMENTO ou CONCLUIDA' }),
});

/** Filtros de GET /atividades. */
export const listarAtividadesSchema = z.object({
  situacao: z.enum(SITUACOES).optional(),
  tipo: z.enum(TIPOS_ATIVIDADE).optional(),
  talhaoId: z.coerce.number().int().positive().optional(),
});

export type CriarAtividade = z.infer<typeof criarAtividadeSchema>;
export type AtualizarAtividade = z.infer<typeof atualizarAtividadeSchema>;
export type FiltrosAtividades = z.infer<typeof listarAtividadesSchema>;
