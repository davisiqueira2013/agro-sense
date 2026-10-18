import { z } from 'zod';
import { virgulaParaPonto } from '../../lib/validacao.js';

export const CATEGORIAS_INSUMO = ['SEMENTES', 'FERTILIZANTES', 'DEFENSIVOS', 'COMBUSTIVEL'] as const;
export const STATUS_INSUMO = ['NORMAL', 'ATENCAO', 'BAIXO'] as const;

const numero = (mensagem: string) => z.preprocess(virgulaParaPonto, z.coerce.number({ message: mensagem }));

const texto = (campo: string, max: number) =>
  z.string({ message: `Informe ${campo}` }).trim().min(1, `Informe ${campo}`).max(max, `${campo} muito longo`);

/** Corpo de POST /insumos. A quantidade inicial vira uma ENTRADA (RN06). */
export const criarInsumoSchema = z.object({
  nome: texto('o nome do insumo', 80),
  categoria: z.enum(CATEGORIAS_INSUMO, { message: 'Selecione a categoria' }),
  unidade: texto('a unidade', 10),
  estoqueMinimo: numero('Informe o estoque mínimo').pipe(z.number().min(0, 'O estoque mínimo não pode ser negativo')),
  custoUnitario: numero('Informe o custo unitário').pipe(z.number().min(0, 'O custo não pode ser negativo')),
  quantidadeInicial: numero('Quantidade inicial inválida').pipe(z.number().min(0, 'A quantidade não pode ser negativa')).optional(),
});

/** Corpo de PUT /insumos/:id — a quantidade NÃO é editável aqui (só por movimentação, RN06). */
export const atualizarInsumoSchema = criarInsumoSchema.omit({ quantidadeInicial: true }).partial();

/** Corpo de POST /insumos/:id/movimentacoes. */
export const movimentacaoSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SAIDA'], { message: 'Tipo deve ser ENTRADA ou SAIDA' }),
  quantidade: numero('Informe a quantidade').pipe(z.number().positive('A quantidade deve ser maior que zero')),
  /** Custo pago na entrada; se ausente, usa o custo atual do insumo. */
  custoUnitario: numero('Custo inválido').pipe(z.number().min(0, 'O custo não pode ser negativo')).optional(),
  atividadeId: z.coerce.number().int().positive().optional(),
});

export const listarInsumosSchema = z.object({
  busca: z.string().trim().optional(),
  categoria: z.enum(CATEGORIAS_INSUMO).optional(),
  status: z.enum(STATUS_INSUMO).optional(),
});

export type CriarInsumo = z.infer<typeof criarInsumoSchema>;
export type AtualizarInsumo = z.infer<typeof atualizarInsumoSchema>;
export type Movimentar = z.infer<typeof movimentacaoSchema>;
export type FiltrosInsumos = z.infer<typeof listarInsumosSchema>;
