import { Download, FilePlus, FileText } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { relatorios } from '../data/mockData';

export function RelatoriosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Relatórios PDF"
        subtitulo="Exportação de dados e histórico"
        acoes={<PrimaryButton icone={<FilePlus size={16} />}>Gerar Relatório</PrimaryButton>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatorios.map((rel) => (
          <Card key={rel.nome} className="p-5 flex justify-between items-center hover:border-[#5C8065] transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#122216] border border-[#1A2E20] rounded-lg text-green-500">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white">{rel.nome}</h3>
                <p className="text-xs font-mono text-[#5C8065]">
                  Gerado em: {rel.data} • {rel.tamanho}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label={`Baixar ${rel.nome}`}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#122216] rounded-lg transition-colors cursor-pointer"
            >
              <Download size={20} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
