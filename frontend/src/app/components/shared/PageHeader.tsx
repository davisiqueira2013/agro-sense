import type { ReactNode } from 'react';

type PageHeaderProps = {
  titulo: string;
  subtitulo: string;
  /** Botões de ação exibidos à direita do título. */
  acoes?: ReactNode;
};

export function PageHeader({ titulo, subtitulo, acoes }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-wide">{titulo}</h1>
        <p className="text-[#5C8065] text-sm font-mono">{subtitulo}</p>
      </div>
      {acoes && <div className="flex flex-wrap gap-3 shrink-0">{acoes}</div>}
    </div>
  );
}
