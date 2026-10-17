import type { ReactNode } from 'react';
import { AlertTriangle, BarChart3, Box, DollarSign, Download, Layers } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { PageHeader } from '../components/shared/PageHeader';
import { SecondaryButton } from '../components/shared/Buttons';
import { alertasRapidos, custosMensais, indicadoresDashboard } from '../data/mockData';
import { toneClasses } from '../lib/tones';
import type { IndicadorDashboard } from '../types';

const icones: Record<IndicadorDashboard['icone'], ReactNode> = {
  talhoes: <Layers size={18} />,
  alertas: <AlertTriangle size={18} />,
  gastos: <DollarSign size={18} />,
  insumos: <Box size={18} />,
};

/** Topo da escala do gráfico, em milhares de reais. */
const ESCALA_MAX = 60;
const MARCAS_ESCALA = [60, 45, 30, 15, 0];

type DashboardPageProps = { onVerAlertas: () => void };

export function DashboardPage({ onVerAlertas }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Dashboard"
        subtitulo="Visão geral da fazenda — 10 de dezembro de 2026"
        acoes={<SecondaryButton icone={<Download size={16} />}>Exportar PDF</SecondaryButton>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicadoresDashboard.map((card) => {
          const tone = toneClasses[card.tone];
          return (
            <Card key={card.titulo} className="p-6 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-mono text-[#5C8065] tracking-widest uppercase">{card.titulo}</span>
                <div className={`p-2 rounded-lg border ${tone.iconBox}`}>{icones[card.icone]}</div>
              </div>
              <div>
                <div className="text-3xl xl:text-4xl font-bold text-white mb-1 font-mono whitespace-nowrap">{card.valor}</div>
                <div className={`text-sm font-mono ${tone.text}`}>{card.detalhe}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Custos por Categoria</h2>
              <p className="text-sm text-[#5C8065] font-mono">Jul — Dez 2026</p>
            </div>
            <BarChart3 className="text-[#5C8065]" size={20} />
          </div>
          <div className="flex items-end h-48 gap-4 border-b border-l border-[#1A2E20] pb-2 pl-2 relative ml-8">
            <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#5C8065] font-mono py-2">
              {MARCAS_ESCALA.map((marca) => (
                <span key={marca}>{marca}k</span>
              ))}
            </div>
            {custosMensais.map(({ mes, valor }) => (
              <div key={mes} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group" title={`R$ ${valor}k`}>
                <div
                  className="w-4 bg-[#D97736] rounded-t-sm transition-all duration-300 group-hover:bg-[#f39556]"
                  style={{ height: `${(valor / ESCALA_MAX) * 100}%` }}
                />
                <span className="text-xs text-[#5C8065] font-mono mt-2">{mes}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Alertas Rápidos</h2>
              <button type="button" onClick={onVerAlertas} className="text-xs font-mono text-[#5C8065] hover:text-green-500 cursor-pointer">
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {alertasRapidos.map((alerta) => (
                <div key={alerta.titulo} className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                  <div className={`flex items-center gap-2 text-xs font-mono mb-1 ${toneClasses[alerta.tone].text}`}>
                    <AlertTriangle size={14} /> {alerta.titulo}
                  </div>
                  <p className="text-xs text-[#5C8065] font-mono">{alerta.talhao}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
