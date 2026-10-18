import { z } from 'zod';

/** Valida o ":id" da URL (inteiro positivo). */
export const idParamSchema = z.object({
  id: z.coerce.number({ message: 'Id inválido' }).int('Id inválido').positive('Id inválido'),
});

/** Converte "" e null em undefined (campos opcionais vindos de formulários). */
export const vazioParaUndefined = (valor: unknown) => (valor === '' || valor === null ? undefined : valor);

/** Aceita número com vírgula decimal (formato brasileiro): "22,5" → 22.5. */
export const virgulaParaPonto = (valor: unknown) => (typeof valor === 'string' ? valor.replace(',', '.') : valor);

/**
 * Data do calendário vinda do formulário ("2026-10-20").
 * Guardada ao meio-dia no horário local para não "voltar um dia" ao converter fuso.
 * rotulo: nome do campo para as mensagens, ex.: "Data prevista".
 */
export const dataCalendario = (rotulo: string) =>
  z
    .string({ message: `${rotulo} é obrigatória` })
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${rotulo} inválida (use AAAA-MM-DD)`)
    .transform((texto) => new Date(`${texto}T12:00:00`))
    .refine((data) => !Number.isNaN(data.getTime()), `${rotulo} inválida`);

/** Início (00:00) e fim (23:59:59) do dia de uma data, no horário local. */
export function limitesDoDia(data: Date) {
  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);
  fim.setMilliseconds(-1);
  return { inicio, fim };
}
