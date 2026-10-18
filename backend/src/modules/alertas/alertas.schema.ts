import { z } from 'zod';
import { dataCalendario } from '../../lib/validacao.js';

export const TIPOS_ALERTA = ['GEADA', 'CHUVA_INTENSA', 'VENTO_FORTE'] as const;
export const SEVERIDADES = ['CRITICO', 'ATENCAO', 'AVISO'] as const;

export const listarAlertasSchema = z.object({
  situacao: z.enum(['ativos', 'encerrados', 'todos']).default('ativos'),
});

/** Corpo de POST /alertas — registro manual feito pela equipe. */
export const criarAlertaSchema = z
  .object({
    tipo: z.enum(TIPOS_ALERTA, { message: 'Selecione o tipo de alerta' }),
    severidade: z.enum(SEVERIDADES, { message: 'Severidade inválida' }).optional(),
    titulo: z.string().trim().max(80, 'Título muito longo').optional(),
    descricao: z.string({ message: 'Descreva o alerta' }).trim().min(5, 'Descreva o alerta (mín. 5 caracteres)').max(500, 'Descrição muito longa'),
    talhaoIds: z.array(z.coerce.number().int().positive()).min(1, 'Selecione ao menos um talhão'),
    inicio: dataCalendario('Data de início'),
    fim: dataCalendario('Data de fim').optional(),
  })
  .refine((d) => !d.fim || d.fim >= d.inicio, { message: 'A data de fim deve ser igual ou posterior ao início', path: ['fim'] });

export type CriarAlerta = z.infer<typeof criarAlertaSchema>;
