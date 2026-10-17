import { useMemo, useState } from 'react';
import { Clock, Droplets, MapPin, Plus, Search, Thermometer } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/shared/Buttons';
import { talhoes } from '../data/mockData';
import { toneClasses, toneDoTalhao } from '../lib/tones';

export function TalhoesPage() {
  const [busca, setBusca] = useState('');

  // Filtro local por enquanto; na integração vira GET /api/talhoes?busca=
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return talhoes;
    return talhoes.filter((t) => t.nome.toLowerCase().includes(termo) || t.cultura.toLowerCase().includes(termo));
  }, [busca]);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Talhões"
        subtitulo="Gestão de áreas e culturas"
        acoes={
          <>
            <SecondaryButton className="font-medium">Tabela</SecondaryButton>
            <PrimaryButton icone={<Plus size={16} />}>Novo Talhão</PrimaryButton>
          </>
        }
      />

      <Card className="p-3 flex items-center gap-3 shadow-none">
        <Search size={18} className="text-[#5C8065] ml-2" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar talhões"
          placeholder="Buscar por nome ou cultura..."
          className="bg-transparent border-none text-gray-200 text-sm focus:outline-none w-full font-mono placeholder-[#5C8065]"
        />
      </Card>

      {filtrados.length === 0 ? (
        <p className="text-sm font-mono text-[#5C8065]">Nenhum talhão encontrado para "{busca}".</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtrados.map((t) => (
            <Card key={t.nome} className="p-6 flex flex-col justify-between relative group hover:border-green-500/40 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.nome}</h3>
                    <div className="flex items-center gap-1 text-xs text-[#5C8065] font-mono mt-0.5">
                      <MapPin size={12} /> {t.local}
                    </div>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-full border bg-[#08100A] ${toneClasses[toneDoTalhao[t.status]].badge}`}>
                    {t.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                    <span className="text-[10px] font-mono text-[#5C8065] uppercase block mb-1">Cultura</span>
                    <span className="text-sm font-bold text-white font-mono">{t.cultura}</span>
                  </div>
                  <div className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                    <span className="text-[10px] font-mono text-[#5C8065] uppercase block mb-1">Área</span>
                    <span className="text-sm font-bold text-white font-mono">{t.area}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1A2E20] text-xs text-[#5C8065] font-mono">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Thermometer size={14} /> {t.temp}</span>
                  <span className="flex items-center gap-1"><Droplets size={14} /> {t.umidade}</span>
                </div>
                <span className="flex items-center gap-1"><Clock size={12} /> {t.data}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
