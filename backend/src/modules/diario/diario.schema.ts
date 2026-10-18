import { z } from 'zod';
import { dataCalendario } from '../../lib/validacao.js';

export const CATEGORIAS_REGISTRO = ['PRAGAS', 'SOLO', 'CLIMA', 'DOENCAS', 'GERAL'] as const;

/** Campos do registro, sem valores padrão (base para cadastro e edição). */
const camposRegistro = z.object({
  titulo: z.string({ message: 'Informe o título' }).trim().min(3, 'Título muito curto (mín. 3 caracteres)').max(120, 'Título muito longo'),
  texto: z.string({ message: 'Escreva a observação' }).trim().min(5, 'Observação muito curta (mín. 5 caracteres)').max(2000, 'Observação muito longa'),
  categoria: z.enum(CATEGORIAS_REGISTRO, { message: 'Categoria inválida' }),
  talhaoId: z.preprocess((v) => (v === '' || v === null ? undefined : v), z.coerce.number().int().positive().optional()),
  data: dataCalendario('Data').optional(),
});

/** Corpo de POST /diario. O autor NÃO vem do formulário: é sempre o usuário do token (RN10). */
export const criarRegistroSchema = camposRegistro.extend({ categoria: camposRegistro.shape.categoria.default('GERAL') });

/** Corpo de PUT /diario/:id (sem padrões). talhaoId null remove o vínculo com o talhão. */
export const atualizarRegistroSchema = camposRegistro.partial().extend({
  talhaoId: z.preprocess((v) => (v === '' ? null : v), z.coerce.number().int().positive().nullable().optional()),
});

export const listarRegistrosSchema = z.object({
  busca: z.string().trim().optional(),
  categoria: z.enum(CATEGORIAS_REGISTRO).optional(),
  talhaoId: z.coerce.number().int().positive().optional(),
});

export type CriarRegistro = z.infer<typeof criarRegistroSchema>;
export type AtualizarRegistro = z.infer<typeof atualizarRegistroSchema>;
export type FiltrosRegistros = z.infer<typeof listarRegistrosSchema>;
