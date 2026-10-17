// Mapeia cada cor semântica para classes Tailwind escritas por extenso.
// O Tailwind só gera classes que aparecem literalmente no código; por isso
// não se pode montar nomes como `text-${cor}-500` em tempo de execução.

import type { AlertaClimatico, Atividade, Insumo, Talhao, Tone } from '../types';

type ToneClasses = {
  text: string;
  iconBox: string;
  border: string;
  badge: string;
  accentBar: string;
};

export const toneClasses: Record<Tone, ToneClasses> = {
  green: {
    text: 'text-green-500',
    iconBox: 'bg-green-950/40 text-green-500 border-green-900/30',
    border: 'border-green-900/50',
    badge: 'text-green-400 border-green-900/40',
    accentBar: 'border-l-green-500',
  },
  yellow: {
    text: 'text-yellow-500',
    iconBox: 'bg-yellow-950/40 text-yellow-500 border-yellow-900/30',
    border: 'border-yellow-900/50',
    badge: 'text-yellow-500 border-yellow-900/40',
    accentBar: 'border-l-yellow-500',
  },
  red: {
    text: 'text-red-500',
    iconBox: 'bg-red-950/40 text-red-500 border-red-900/30',
    border: 'border-red-900/50',
    badge: 'text-red-500 border-red-900/50',
    accentBar: 'border-l-red-500',
  },
  blue: {
    text: 'text-blue-500',
    iconBox: 'bg-blue-950/40 text-blue-500 border-blue-900/30',
    border: 'border-blue-900/50',
    badge: 'text-blue-400 border-blue-900/40',
    accentBar: 'border-l-blue-500',
  },
  gray: {
    text: 'text-gray-500',
    iconBox: 'bg-[#08100A] text-gray-500 border-[#1A2E20]',
    border: 'border-[#1A2E20]',
    badge: 'text-gray-500 border-[#1A2E20]',
    accentBar: 'border-l-gray-500',
  },
};

export const toneDoTalhao: Record<Talhao['status'], Tone> = {
  Ativo: 'green',
  'Em preparo': 'yellow',
  Colhido: 'blue',
};

export const toneDaAtividade: Record<Atividade['status'], Tone> = {
  Concluído: 'green',
  'Em andamento': 'yellow',
  Atrasado: 'red',
  Agendado: 'blue',
};

export const toneDoInsumo: Record<Insumo['status'], Tone> = {
  Normal: 'green',
  Atenção: 'yellow',
  Baixo: 'red',
};

export const toneDoAlerta: Record<AlertaClimatico['severidade'], Tone> = {
  Crítico: 'red',
  Atenção: 'yellow',
  Aviso: 'blue',
};

/** Iniciais do nome, ex.: "Rodrigo Figueiredo" → "RF". */
export const iniciais = (nome: string) =>
  nome
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
