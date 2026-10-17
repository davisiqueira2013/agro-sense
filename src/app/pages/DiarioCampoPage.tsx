import { Clock, Plus, Users } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { registrosDiario } from '../data/mockData';

export function DiarioCampoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Diário de Campo"
        subtitulo="Registros agronômicos e observações"
        acoes={<PrimaryButton icone={<Plus size={16} />}>Novo Registro</PrimaryButton>}
      />
      <div className="grid gap-4">
        {registrosDiario.map((nota) => (
          <Card key={nota.titulo} className="p-6 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-white">{nota.titulo}</h3>
              <span className="text-xs font-mono px-2 py-1 rounded bg-[#122216] border border-[#1A2E20] text-gray-300">{nota.tag}</span>
            </div>
            <p className="text-sm text-gray-400 font-mono">{nota.texto}</p>
            <div className="flex items-center gap-4 text-xs font-mono text-[#5C8065] mt-2">
              <span className="flex items-center gap-1"><Clock size={14} /> {nota.data}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {nota.autor}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
