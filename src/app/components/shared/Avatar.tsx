import { iniciais } from '../../lib/tones';

type AvatarProps = { nome: string; apagado?: boolean };

/** Círculo com as iniciais do usuário. */
export function Avatar({ nome, apagado = false }: AvatarProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full border border-[#1A2E20] flex items-center justify-center text-xs font-bold text-gray-300 font-mono ${apagado ? 'bg-[#08100A]' : 'bg-[#122216]'}`}
    >
      {iniciais(nome)}
    </div>
  );
}
