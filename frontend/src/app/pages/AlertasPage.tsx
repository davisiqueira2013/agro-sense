import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CloudRain, Loader2, MapPin, PenLine, Plus, RefreshCw, Satellite, Snowflake, Wind } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { alertasService, type SituacaoFiltro } from '../../services/alertasService';
import { talhoesService } from '../../services/talhoesService';
import { NovoAlertaDialog } from '../components/alertas/NovoAlertaDialog';
import { Card } from '../components/shared/Card';
import { ErroCarregamento, Vazio } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/shared/Buttons';
import { formatarData, formatarDataHora } from '../lib/formatar';
import { permissoes } from '../lib/permissoes';
import { nomeDaSeveridade, toneClasses, toneDaSeveridade } from '../lib/tones';
import type { AlertaClimatico, Talhao, TipoAlerta } from '../types';

const iconeDoTipo: Record<TipoAlerta, ReactNode> = {
  GEADA: <Snowflake size={24} />,
  CHUVA_INTENSA: <CloudRain size={24} />,
  VENTO_FORTE: <Wind size={24} />,
};

const ABAS: { id: SituacaoFiltro; rotulo: string }[] = [
  { id: 'ativos', rotulo: 'Ativos' },
  { id: 'encerrados', rotulo: 'Encerrados' },
];

const periodo = (a: AlertaClimatico) => {
  const inicio = formatarData(a.inicio);
  if (!a.fim) return `desde ${inicio}`;
  const fim = formatarData(a.fim);
  return inicio === fim ? inicio : `${inicio} a ${fim}`;
};

type Props = { onAlteracao?: () => void };

export function AlertasPage({ onAlteracao }: Props) {
  const { usuario } = useAuth();
  const { podeEditar } = permissoes(usuario!.perfil);

  const [aba, setAba] = useState<SituacaoFiltro>('ativos');
  const [alertas, setAlertas] = useState<AlertaClimatico[]>([]);
  const [talhoes, setTalhoes] = useState<Pick<Talhao, 'id' | 'nome'>[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sincronizando, setSincronizando] = useState(false);
  const [encerrando, setEncerrando] = useState<number | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);

  const carregar = useCallback(async (situacao: SituacaoFiltro) => {
    setCarregando(true);
    setErro('');
    try {
      setAlertas(await alertasService.listar(situacao));
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(aba);
  }, [aba, carregar]);

  useEffect(() => {
    talhoesService.listar().then(setTalhoes).catch(() => setTalhoes([]));
  }, []);

  const recarregarTudo = async () => {
    await carregar(aba);
    onAlteracao?.();
  };

  // POST /api/alertas/sincronizar — RN09: previsão do Open-Meteo
  const sincronizar = async () => {
    setSincronizando(true);
    try {
      const r = await alertasService.sincronizar();
      const { criados, atualizados, encerrados } = r.alertas;
      const partes = [
        criados && `${criados} novo(s)`,
        atualizados && `${atualizados} atualizado(s)`,
        encerrados && `${encerrados} encerrado(s)`,
      ].filter(Boolean);
      toast.success(`Previsão atualizada para ${r.talhoesConsultados} talhão(ões)`, {
        description: partes.length ? `Alertas: ${partes.join(', ')}.` : 'Nenhum risco novo nas próximas 48 horas.',
      });
      if (r.falhas.length) toast.warning(`Sem previsão para: ${r.falhas.map((f) => f.talhao).join(', ')}`);
      if (r.semCoordenadas.length) toast.info(`Sem coordenadas cadastradas: ${r.semCoordenadas.join(', ')}`);
      await recarregarTudo();
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível consultar a previsão');
    } finally {
      setSincronizando(false);
    }
  };

  const encerrar = async (a: AlertaClimatico) => {
    setEncerrando(a.id);
    try {
      await alertasService.encerrar(a.id);
      toast.success(`Alerta "${a.titulo}" encerrado`);
      await recarregarTudo();
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível encerrar');
    } finally {
      setEncerrando(null);
    }
  };

  const conteudo = () => {
    if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={() => carregar(aba)} />;
    if (!carregando && alertas.length === 0) {
      return <Vazio mensagem={aba === 'ativos' ? 'Nenhum alerta ativo. Use "Atualizar previsão" para consultar o tempo.' : 'Nenhum alerta encerrado.'} />;
    }
    return (
      <div className={`grid gap-4 ${carregando ? 'opacity-60' : ''}`}>
        {alertas.map((a) => {
          const tone = toneClasses[toneDaSeveridade[a.severidade]];
          const ativo = a.situacao === 'ATIVO';
          return (
            <Card key={a.id} className={`p-6 flex gap-4 ${ativo ? tone.border : 'opacity-70'}`}>
              <div className={`p-3 rounded-full h-fit border ${tone.iconBox}`}>
                {a.severidade === 'CRITICO' ? <AlertCircle size={24} /> : iconeDoTipo[a.tipo]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{a.titulo}</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border bg-[#08100A] ${tone.badge}`}>
                    {nomeDaSeveridade[a.severidade]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#5C8065] uppercase">
                    {a.origem === 'PREVISAO' ? <><Satellite size={12} /> Previsão Open-Meteo</> : <><PenLine size={12} /> Registrado pela equipe</>}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#5C8065] mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {a.todaFazenda ? 'Toda a fazenda' : a.talhoes.map((t) => t.nome).join(', ')}
                  </span>
                  <span>{ativo ? periodo(a) : `encerrado em ${a.fim ? formatarDataHora(a.fim) : '—'}`}</span>
                </p>
                <p className="text-sm text-gray-300 font-mono">{a.descricao}</p>
              </div>
              {podeEditar && ativo && (
                <button type="button" onClick={() => encerrar(a)} disabled={encerrando === a.id}
                  className="self-start shrink-0 px-3 py-1.5 rounded-md text-xs font-mono text-gray-400 border border-[#1A2E20] hover:text-white hover:bg-[#122216] cursor-pointer disabled:opacity-50">
                  {encerrando === a.id ? 'Encerrando...' : 'Encerrar'}
                </button>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Alertas Climáticos"
        subtitulo="Monitoramento meteorológico e riscos — previsão via Open-Meteo"
        acoes={podeEditar && (
          <>
            <SecondaryButton
              onClick={sincronizar}
              disabled={sincronizando}
              icone={sincronizando ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            >
              {sincronizando ? 'Consultando...' : 'Atualizar previsão'}
            </SecondaryButton>
            <PrimaryButton icone={<Plus size={16} />} onClick={() => setNovoAberto(true)}>Novo Alerta</PrimaryButton>
          </>
        )}
      />

      <div className="flex items-center gap-2" role="tablist">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} onClick={() => setAba(a.id)}
            className={`px-4 py-2 rounded-lg text-sm font-mono border cursor-pointer transition-colors ${
              aba === a.id ? 'bg-[#122216] border-[#1A3320] text-green-400' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}>
            {a.rotulo}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-mono text-[#5C8065] hidden md:block">
          RN09: geada &lt; 2 °C · chuva &gt; 50 mm/24 h · rajadas &gt; 40 km/h
        </span>
      </div>

      {conteudo()}

      <NovoAlertaDialog
        aberto={novoAberto}
        talhoes={talhoes}
        onFechar={() => setNovoAberto(false)}
        onCriado={async (alerta) => {
          setNovoAberto(false);
          toast.success(`Alerta "${alerta.titulo}" registrado`);
          if (aba !== 'ativos') setAba('ativos');
          else await recarregarTudo();
          onAlteracao?.();
        }}
      />
    </div>
  );
}
