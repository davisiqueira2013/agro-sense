import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, AlertTriangle, Box, CloudLightning, DollarSign, Layers, Wind } from 'lucide-react';
import { ApiError } from '../../services/api';
import { dashboardService } from '../../services/dashboardService';
import { GraficoCustos } from '../components/dashboard/GraficoCustos';
import { Card } from '../components/shared/Card';
import { ErroCarregamento } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { formatarMoedaInteira } from '../lib/formatar';
import { toneClasses } from '../lib/tones';
import type { CustoMensal, ResumoDashboard, Severidade, Tone } from '../types';

const toneDaSeveridade: Record<Severidade, Tone> = { CRITICO: 'red', ATENCAO: 'yellow', AVISO: 'blue' };
const nomeDaSeveridade: Record<Severidade, string> = { CRITICO: 'Crítico', ATENCAO: 'Atenção', AVISO: 'Aviso' };
const iconeDaSeveridade: Record<Severidade, ReactNode> = {
  CRITICO: <AlertCircle size={14} />,
  ATENCAO: <CloudLightning size={14} />,
  AVISO: <Wind size={14} />,
};

const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`;

type DashboardPageProps = { onVerAlertas: () => void; onVerAtividades: () => void };

export function DashboardPage({ onVerAlertas, onVerAtividades }: DashboardPageProps) {
  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [custos, setCustos] = useState<CustoMensal[]>([]);
  const [erro, setErro] = useState('');

  // GET /api/dashboard/resumo + GET /api/dashboard/custos (RN08)
  const carregar = useCallback(async () => {
    setErro('');
    try {
      const [r, c] = await Promise.all([dashboardService.resumo(), dashboardService.custos(6)]);
      setResumo(r);
      setCustos(c);
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  if (erro) {
    return (
      <div className="space-y-6">
        <PageHeader titulo="Dashboard" subtitulo={`Visão geral da fazenda — ${hoje}`} />
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregar} />
      </div>
    );
  }

  const sev = resumo?.alertas.porSeveridade;
  const cards: { titulo: string; valor: string; detalhe: string; tone: Tone; icone: ReactNode }[] = resumo
    ? [
        {
          titulo: 'Total de Talhões',
          valor: String(resumo.talhoes.total),
          detalhe: `${plural(resumo.talhoes.ativos, 'ativo', 'ativos')} agora`,
          tone: 'green',
          icone: <Layers size={18} />,
        },
        {
          titulo: 'Alertas Ativos',
          valor: String(resumo.alertas.ativos),
          detalhe: sev ? `${sev.CRITICO} crítico, ${sev.ATENCAO} atenção, ${sev.AVISO} aviso` : '',
          tone: resumo.alertas.ativos > 0 ? 'red' : 'green',
          icone: <AlertTriangle size={18} />,
        },
        {
          titulo: 'Gasto do Mês',
          valor: formatarMoedaInteira(resumo.gastoMes.valor),
          detalhe: `Compras em ${resumo.gastoMes.referencia}`,
          tone: 'yellow',
          icone: <DollarSign size={18} />,
        },
        {
          titulo: 'Insumos Críticos',
          valor: String(resumo.insumos.criticos),
          detalhe: `abaixo do mínimo · ${resumo.insumos.emAtencao} em atenção`,
          tone: resumo.insumos.criticos > 0 ? 'red' : 'green',
          icone: <Box size={18} />,
        },
      ]
    : [];

  const atrasadas = resumo?.atividades.atrasadas ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader titulo="Dashboard" subtitulo={`Visão geral da fazenda — ${hoje}`} />

      {resumo && (atrasadas > 0 || resumo.atividades.hoje > 0) && (
        <button
          type="button"
          onClick={onVerAtividades}
          className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1A2E20] bg-[#0A140D] hover:border-[#5C8065] cursor-pointer font-mono text-sm"
        >
          {atrasadas > 0 && (
            <span className="flex items-center gap-2 text-red-400">
              <AlertCircle size={16} /> {plural(atrasadas, 'atividade atrasada', 'atividades atrasadas')}
            </span>
          )}
          {resumo.atividades.hoje > 0 && (
            <span className="text-yellow-500">{plural(resumo.atividades.hoje, 'atividade prevista para hoje', 'atividades previstas para hoje')}</span>
          )}
          <span className="ml-auto text-xs text-[#5C8065]">Ver atividades →</span>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {!resumo &&
          Array.from({ length: 4 }, (_, i) => <Card key={i} className="p-6 h-40 animate-pulse" aria-busy="true" />)}
        {cards.map((card) => {
          const tone = toneClasses[card.tone];
          return (
            <Card key={card.titulo} className="p-6 flex flex-col justify-between h-40">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-mono text-[#5C8065] tracking-widest uppercase">{card.titulo}</span>
                <div className={`p-2 rounded-lg border ${tone.iconBox}`}>{card.icone}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1 font-mono whitespace-nowrap">{card.valor}</div>
                <div className={`text-xs font-mono ${tone.text}`}>{card.detalhe}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white mb-1">Custos por Categoria</h2>
            <p className="text-sm text-[#5C8065] font-mono">Compras de insumos nos últimos 6 meses</p>
          </div>
          {resumo ? <GraficoCustos dados={custos} /> : <div className="h-56 animate-pulse bg-[#08100A] rounded-lg" />}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Alertas Rápidos</h2>
            <button type="button" onClick={onVerAlertas} className="text-xs font-mono text-[#5C8065] hover:text-green-500 cursor-pointer">
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {resumo?.alertasRapidos.length === 0 && (
              <p className="text-sm font-mono text-[#5C8065]">Nenhum alerta climático ativo.</p>
            )}
            {resumo?.alertasRapidos.map((alerta) => (
              <div key={alerta.id} className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                <div className={`flex items-center gap-2 text-xs font-mono mb-1 ${toneClasses[toneDaSeveridade[alerta.severidade]].text}`}>
                  {iconeDaSeveridade[alerta.severidade]} {alerta.titulo}
                  <span className="ml-auto text-[10px] uppercase opacity-80">{nomeDaSeveridade[alerta.severidade]}</span>
                </div>
                <p className="text-xs text-[#5C8065] font-mono">
                  {alerta.todaFazenda ? 'Toda a fazenda' : alerta.talhoes.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
