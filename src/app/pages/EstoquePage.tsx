import { Plus } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { insumos, resumoEstoque } from '../data/mockData';
import { toneClasses, toneDoInsumo } from '../lib/tones';
import type { Tone } from '../types';

const cardsResumo: { titulo: string; valor: string; tone: Tone }[] = [
  { titulo: 'TOTAL DE ITENS', valor: resumoEstoque.totalItens, tone: 'green' },
  { titulo: 'ABAIXO DO MÍNIMO', valor: resumoEstoque.abaixoMinimo, tone: 'red' },
  { titulo: 'VALOR ESTIMADO', valor: resumoEstoque.valorEstimado, tone: 'yellow' },
];

export function EstoquePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Estoque"
        subtitulo="Controle de insumos e materiais"
        acoes={<PrimaryButton icone={<Plus size={16} />}>Adicionar Insumo</PrimaryButton>}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardsResumo.map((card) => (
          <Card key={card.titulo} className={`p-5 border-l-4 shadow-none ${toneClasses[card.tone].accentBar}`}>
            <p className="text-xs font-mono text-[#5C8065] mb-1">{card.titulo}</p>
            <p className="text-3xl font-bold text-white font-mono">{card.valor}</p>
          </Card>
        ))}
      </div>
      <DataTable colunas={['INSUMO', 'CATEGORIA', 'QUANTIDADE', 'STATUS']}>
        {insumos.map((i) => (
          <tr key={i.nome} className="hover:bg-[#122216]/30 transition-colors">
            <td className="py-4 text-white font-semibold">{i.nome}</td>
            <td className="py-4 text-gray-400">{i.categoria}</td>
            <td className="py-4 text-white">{i.quantidade}</td>
            <td className={`py-4 font-bold ${toneClasses[toneDoInsumo[i.status]].text}`}>{i.status}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
