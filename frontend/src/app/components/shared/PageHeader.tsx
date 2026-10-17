import type { ReactNode } from 'react';

type PageHeaderProps = {
  titulo: string;
  subtitulo: string;
  /** Botões de ação exibidos à direita do título. */
  acoes?: ReactNode;
};

export function PageHeader({ titulo, subtitulo, acoes }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">{titulo}</h1>
        <p className="text-[#5C8065] text-sm font-mono">{subtitulo}</p>
      </div>
      {acoes && <div className="flex gap-3">{acoes}</div>}
    </div>
  );
}
