import { z } from 'zod';
import { dataCalendario } from '../../lib/validacao.js';

export const TIPOS_RELATORIO = ['CUSTOS', 'ATIVIDADES', 'ESTOQUE'] as const;

/** POST /api/relatorios — tipo e período (datas do calendário, AAAA-MM-DD). */
export const gerarRelatorioSchema = z.object({
  tipo: z.enum(TIPOS_RELATORIO, { message: 'Tipo deve ser CUSTOS, ATIVIDADES ou ESTOQUE' }),
  inicio: dataCalendario('Data inicial'),
  fim: dataCalendario('Data final'),
});

export type GerarRelatorio = z.infer<typeof gerarRelatorioSchema>;
