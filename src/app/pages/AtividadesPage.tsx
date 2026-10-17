import { AlertCircle, CalendarClock, CheckCircle2, Filter, Loader, Plus } from 'lucide-react';
import { DataTable } from '../components/shared/DataTable';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/shared/Buttons';
import { atividades } from '../data/mockData';
import { toneClasses, toneDaAtividade } from '../lib/tones';
import type { Atividade } from '../types';

const iconeDoStatus: Record<Atividade['status'], JSX.Element> = {
  Concluído: <CheckCircle2 size={16} />,
  'Em andamento': <Loader size={16} />,
  Atrasado: <AlertCircle size={16} />,
  Agendado: <CalendarClock size={16} />,
};

export function AtividadesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Atividades"
        subtitulo="Gestão de operações em campo"
        acoes={
          <>
            <SecondaryButton icone={<Filter size={16} />}>Filtrar</SecondaryButton>
            <PrimaryButton icone={<Plus size={16} />}>Nova Atividade</PrimaryButton>
          </>
        }
      />
      <DataTable colunas={['STATUS', 'TIPO', 'TALHÃO', 'DATA PREVISTA', 'RESPONSÁVEL']}>
        {atividades.map((a) => (
          <tr key={`${a.tipo}-${a.talhao}-${a.data}`} className="hover:bg-[#122216]/30 transition-colors">
            <td className={`py-4 ${toneClasses[toneDaAtividade[a.status]].text}`}>
              <span className="flex items-center gap-2">
                {iconeDoStatus[a.status]} {a.status}
              </span>
            </td>
            <td className="py-4 text-white font-semibold">{a.tipo}</td>
            <td className="py-4 text-gray-300">{a.talhao}</td>
            <td className="py-4 text-[#5C8065]">{a.data}</td>
            <td className="py-4 text-gray-300">{a.responsavel}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
