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

/** Data local no formato do <input type="date">: "2026-10-20". */
export const paraInputData = (data: string | Date) => {
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** "Hoje", "Amanhã", "Ontem" ou a data "20/10/2026". */
export const rotuloDoDia = (iso: string) => {
  const dia = paraInputData(iso);
  const hoje = new Date();
  const deslocar = (dias: number) => paraInputData(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + dias));
  if (dia === deslocar(0)) return 'Hoje';
  if (dia === deslocar(1)) return 'Amanhã';
  if (dia === deslocar(-1)) return 'Ontem';
  return formatarData(iso);
};
