import { z } from 'zod';

/** Valida o ":id" da URL (inteiro positivo). */
export const idParamSchema = z.object({
  id: z.coerce.number({ message: 'Id inválido' }).int('Id inválido').positive('Id inválido'),
});

/** Converte "" e null em undefined (campos opcionais vindos de formulários). */
export const vazioParaUndefined = (valor: unknown) => (valor === '' || valor === null ? undefined : valor);

/** Aceita número com vírgula decimal (formato brasileiro): "22,5" → 22.5. */
export const virgulaParaPonto = (valor: unknown) => (typeof valor === 'string' ? valor.replace(',', '.') : valor);
