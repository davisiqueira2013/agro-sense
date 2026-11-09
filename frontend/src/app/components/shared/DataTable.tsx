import type { ReactNode } from 'react';
import { Card } from './Card';

type DataTableProps = {
  colunas: string[];
  children: ReactNode;
};

/**
 * Classes aplicadas no celular (abaixo de md): cada linha vira um cartão e cada
 * célula mostra o nome da coluna à esquerda, lido do atributo data-label da <td>.
 */
const MODO_CARTAO = [
  'max-md:block',
  'max-md:[&_tbody]:block max-md:[&_tbody]:space-y-3 max-md:[&_tbody]:divide-y-0',
  'max-md:[&_tr]:block max-md:[&_tr]:rounded-lg max-md:[&_tr]:border max-md:[&_tr]:border-[#1A2E20] max-md:[&_tr]:bg-[#08100A] max-md:[&_tr]:px-4 max-md:[&_tr]:py-2',
  'max-md:[&_td]:flex max-md:[&_td]:items-start max-md:[&_td]:justify-between max-md:[&_td]:gap-4 max-md:[&_td]:py-1.5 max-md:[&_td]:pr-0 max-md:[&_td]:text-right',
  'max-md:[&_td]:before:content-[attr(data-label)] max-md:[&_td]:before:text-[11px] max-md:[&_td]:before:text-[#5C8065] max-md:[&_td]:before:uppercase max-md:[&_td]:before:text-left max-md:[&_td]:before:shrink-0',
  'max-md:[&_td:not([data-label])]:before:content-none max-md:[&_td:not([data-label])]:justify-end',
].join(' ');

/** Tabela no padrão visual do sistema; as linhas vêm como children. Use data-label em cada <td> para o modo cartão no celular. */
export function DataTable({ colunas, children }: DataTableProps) {
  return (
    <Card className="p-3 sm:p-6 md:overflow-x-auto">
      <table className={`w-full md:min-w-[640px] text-left border-collapse ${MODO_CARTAO}`}>
        <thead className="max-md:hidden">
          <tr className="border-b border-[#1A2E20] text-xs font-mono text-[#5C8065]">
            {colunas.map((coluna) => (
              <th key={coluna} className="pb-3 font-medium">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2E20]/50 text-sm font-mono">{children}</tbody>
      </table>
    </Card>
  );
}
