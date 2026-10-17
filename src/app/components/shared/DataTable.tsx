import type { ReactNode } from 'react';
import { Card } from './Card';

type DataTableProps = {
  colunas: string[];
  children: ReactNode;
};

/** Tabela no padrão visual do sistema; as linhas vêm como children. */
export function DataTable({ colunas, children }: DataTableProps) {
  return (
    <Card className="p-6">
      <table className="w-full text-left border-collapse">
        <thead>
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
