// Formatação em português do Brasil para valores vindos da API.

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** 45.2 → "45,2" */
export const formatarNumero = (valor: number) => numero.format(valor);

/** "2026-10-18T10:00:00Z" → "18/10/2026" */
export const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** "2026-10-18T10:00:00Z" → "18/10 07:00" */
export const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

/** "22,5" ou "22.5" → 22.5 (NaN se inválido). */
export const lerNumero = (texto: string) => Number(texto.trim().replace(',', '.'));
