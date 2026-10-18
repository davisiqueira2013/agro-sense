import { z } from 'zod';
import { vazioParaUndefined, virgulaParaPonto } from '../../lib/validacao.js';

export const STATUS_TALHAO = ['EM_PREPARO', 'ATIVO', 'COLHIDO'] as const;

const texto = (campo: string, max = 80) =>
  z.string({ message: `Informe ${campo}` }).trim().min(1, `Informe ${campo}`).max(max, `${campo} muito longo`);

const coordenada = (min: number, max: number, campo: string) =>
  z.preprocess(
    vazioParaUndefined,
    z.preprocess(virgulaParaPonto, z.coerce.number({ message: `${campo} inválida` }).min(min, `${campo} inválida`).max(max, `${campo} inválida`)).optional(),
  );

/** Corpo de POST /talhoes. RN03: nome obrigatório e área maior que zero. */
export const criarTalhaoSchema = z.object({
  nome: texto('o nome do talhão', 60),
  municipio: texto('o município'),
  uf: z
    .string({ message: 'Informe a UF' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'UF deve ter 2 letras (ex.: PR)'),
  cultura: texto('a cultura', 40),
  areaHa: z.preprocess(
    virgulaParaPonto,
    z.coerce.number({ message: 'Informe a área em hectares' }).positive('A área deve ser maior que zero').max(100000, 'Área muito grande'),
  ),
  status: z.enum(STATUS_TALHAO, { message: 'Status inválido' }).default('EM_PREPARO'),
  latitude: coordenada(-90, 90, 'Latitude'),
  longitude: coordenada(-180, 180, 'Longitude'),
});

/** Corpo de PUT /talhoes/:id — mesmos campos, todos opcionais. */
export const atualizarTalhaoSchema = criarTalhaoSchema.partial();

/** Filtros de GET /talhoes. */
export const listarTalhoesSchema = z.object({
  busca: z.string().trim().optional(),
  status: z.enum(STATUS_TALHAO).optional(),
});

export type CriarTalhao = z.infer<typeof criarTalhaoSchema>;
export type AtualizarTalhao = z.infer<typeof atualizarTalhaoSchema>;
export type FiltrosTalhoes = z.infer<typeof listarTalhoesSchema>;
