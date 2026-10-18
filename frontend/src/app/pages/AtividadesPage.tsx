import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, CalendarClock, CheckCheck, CheckCircle2, Loader, Pencil, Play, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { atividadesService, type FiltrosAtividades } from '../../services/atividadesService';
import { talhoesService } from '../../services/talhoesService';
import { usuariosService } from '../../services/usuariosService';
import { AtividadeFormDialog } from '../components/atividades/AtividadeFormDialog';
import { Card } from '../components/shared/Card';
import { ConfirmarExclusao } from '../components/shared/ConfirmarExclusao';
import { DataTable } from '../components/shared/DataTable';
import { ErroCarregamento, Vazio } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { formatarData, rotuloDoDia } from '../lib/formatar';
import { permissoes } from '../lib/permissoes';
import { nomeDaSituacao, nomeDoTipoAtividade, toneClasses, toneDaSituacao } from '../lib/tones';
import type { Atividade, Responsavel, SituacaoAtividade, Talhao, TipoAtividade } from '../types';

const iconeDaSituacao: Record<SituacaoAtividade, JSX.Element> = {
  CONCLUIDA: <CheckCircle2 size={16} />,
  EM_ANDAMENTO: <Loader size={16} />,
  ATRASADA: <AlertCircle size={16} />,
  AGENDADA: <CalendarClock size={16} />,
};

const selectClass =
  'bg-[#08100A] border border-[#1A2E20] text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 font-mono cursor-pointer';

const botaoAcao =
  'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border border-transparent cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait';

export function AtividadesPage() {
  const { usuario } = useAuth();
  const { podeEditar, podeExcluir } = permissoes(usuario!.perfil);

  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [talhoes, setTalhoes] = useState<Pick<Talhao, 'id' | 'nome'>[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [filtros, setFiltros] = useState<FiltrosAtividades>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<{ aberto: boolean; atividade?: Atividade }>({ aberto: false });
  const [paraExcluir, setParaExcluir] = useState<Atividade | null>(null);

  // GET /api/atividades com os filtros escolhidos.
  const carregar = useCallback(async (f: FiltrosAtividades) => {
    setCarregando(true);
    setErro('');
    try {
      setAtividades(await atividadesService.listar(f));
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(filtros);
  }, [filtros, carregar]);

  // Opções dos filtros e do formulário: talhões e responsáveis vêm da API.
  useEffect(() => {
    talhoesService.listar().then(setTalhoes).catch(() => setTalhoes([]));
    usuariosService.responsaveis().then(setResponsaveis).catch(() => setResponsaveis([]));
  }, []);

  const mudarFiltro = (chave: keyof FiltrosAtividades, valor: string) =>
    setFiltros((atual) => ({ ...atual, [chave]: valor ? (chave === 'talhaoId' ? Number(valor) : valor) : undefined }));

  const temFiltro = Object.values(filtros).some(Boolean);

  // PATCH /api/atividades/:id/status — RN04 (e RN05 ao iniciar pulverização).
  const alterarStatus = async (a: Atividade, status: 'EM_ANDAMENTO' | 'CONCLUIDA') => {
    setProcessando(a.id);
    try {
      await atividadesService.alterarStatus(a.id, status);
      toast.success(`${nomeDoTipoAtividade[a.tipo]} no ${a.talhao.nome} ${status === 'CONCLUIDA' ? 'concluída' : 'iniciada'}`);
      await carregar(filtros);
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível alterar o status');
    } finally {
      setProcessando(null);
    }
  };

  const aoSalvar = (a: Atividade, nova: boolean) => {
    setFormulario({ aberto: false });
    toast.success(`${nomeDoTipoAtividade[a.tipo]} no ${a.talhao.nome} ${nova ? 'agendada' : 'atualizada'}`);
    carregar(filtros);
  };

  const excluir = async () => {
    if (!paraExcluir) return;
    try {
      await atividadesService.excluir(paraExcluir.id);
      toast.success('Atividade excluída');
      carregar(filtros);
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível excluir');
    } finally {
      setParaExcluir(null);
    }
  };

  const conteudo = () => {
    if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={() => carregar(filtros)} />;
    if (!carregando && atividades.length === 0) {
      return <Vazio mensagem={temFiltro ? 'Nenhuma atividade com esses filtros.' : 'Nenhuma atividade agendada.'} />;
    }

    return (
      <div className={carregando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <DataTable colunas={['STATUS', 'TIPO', 'TALHÃO', 'DATA PREVISTA', 'RESPONSÁVEL', ...(podeEditar ? ['AÇÕES'] : [])]}>
          {atividades.map((a) => {
            const concluida = a.status === 'CONCLUIDA';
            const ocupado = processando === a.id;
            return (
              <tr key={a.id} className="hover:bg-[#122216]/30 transition-colors align-top">
                <td className={`py-4 pr-3 ${toneClasses[toneDaSituacao[a.situacao]].text}`}>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    {iconeDaSituacao[a.situacao]} {nomeDaSituacao[a.situacao]}
                  </span>
                </td>
                <td className="py-4 pr-3">
                  <span className="text-white font-semibold">{nomeDoTipoAtividade[a.tipo]}</span>
                  {a.observacao && <p className="text-xs text-[#5C8065] mt-1 max-w-56 truncate" title={a.observacao}>{a.observacao}</p>}
                </td>
                <td className="py-4 pr-3 text-gray-300 whitespace-nowrap">{a.talhao.nome}</td>
                <td className="py-4 pr-3 text-[#5C8065] whitespace-nowrap">
                  {rotuloDoDia(a.dataPrevista)}
                  {a.dataConclusao && <p className="text-xs text-green-600 mt-1">concluída {formatarData(a.dataConclusao)}</p>}
                </td>
                <td className="py-4 pr-3 text-gray-300 whitespace-nowrap">{a.responsavel.nome}</td>
                {podeEditar && (
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {a.status === 'AGENDADA' && (
                        <button type="button" disabled={ocupado} onClick={() => alterarStatus(a, 'EM_ANDAMENTO')}
                          className={`${botaoAcao} text-yellow-500 hover:border-yellow-900/60 hover:bg-yellow-950/30`}>
                          <Play size={13} /> Iniciar
                        </button>
                      )}
                      {!concluida && (
                        <button type="button" disabled={ocupado} onClick={() => alterarStatus(a, 'CONCLUIDA')}
                          className={`${botaoAcao} text-green-500 hover:border-green-900/60 hover:bg-green-950/30`}>
                          <CheckCheck size={13} /> Concluir
                        </button>
                      )}
                      {!concluida && (
                        <button type="button" onClick={() => setFormulario({ aberto: true, atividade: a })}
                          aria-label={`Editar atividade ${a.id}`} title="Editar"
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-[#122216] rounded-md cursor-pointer">
                          <Pencil size={14} />
                        </button>
                      )}
                      {podeExcluir && (
                        <button type="button" onClick={() => setParaExcluir(a)}
                          aria-label={`Excluir atividade ${a.id}`} title="Excluir"
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded-md cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </DataTable>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Atividades"
        subtitulo={`Gestão de operações em campo${carregando ? '' : ` — ${atividades.length} atividade(s)`}`}
        acoes={
          podeEditar && (
            <PrimaryButton icone={<Plus size={16} />} onClick={() => setFormulario({ aberto: true })}>
              Nova Atividade
            </PrimaryButton>
          )
        }
      />

      <Card className="p-3 flex flex-wrap items-center gap-3 shadow-none">
        <span className="text-xs font-mono text-[#5C8065] uppercase tracking-wider ml-1">Filtros</span>
        <select aria-label="Filtrar por situação" className={selectClass} value={filtros.situacao ?? ''} onChange={(e) => mudarFiltro('situacao', e.target.value)}>
          <option value="">Todas as situações</option>
          {(Object.keys(nomeDaSituacao) as SituacaoAtividade[]).map((s) => (
            <option key={s} value={s}>{nomeDaSituacao[s]}</option>
          ))}
        </select>
        <select aria-label="Filtrar por tipo" className={selectClass} value={filtros.tipo ?? ''} onChange={(e) => mudarFiltro('tipo', e.target.value)}>
          <option value="">Todos os tipos</option>
          {(Object.keys(nomeDoTipoAtividade) as TipoAtividade[]).map((t) => (
            <option key={t} value={t}>{nomeDoTipoAtividade[t]}</option>
          ))}
        </select>
        <select aria-label="Filtrar por talhão" className={selectClass} value={filtros.talhaoId ?? ''} onChange={(e) => mudarFiltro('talhaoId', e.target.value)}>
          <option value="">Todos os talhões</option>
          {talhoes.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        {temFiltro && (
          <button type="button" onClick={() => setFiltros({})}
            className="flex items-center gap-1 text-xs font-mono text-[#5C8065] hover:text-white cursor-pointer">
            <X size={14} /> Limpar
          </button>
        )}
      </Card>

      {conteudo()}

      <AtividadeFormDialog
        aberto={formulario.aberto}
        atividade={formulario.atividade}
        talhoes={talhoes}
        responsaveis={responsaveis}
        onFechar={() => setFormulario({ aberto: false })}
        onSalvo={aoSalvar}
      />

      <ConfirmarExclusao
        aberto={!!paraExcluir}
        titulo="Excluir atividade?"
        descricao={paraExcluir ? `${nomeDoTipoAtividade[paraExcluir.tipo]} no ${paraExcluir.talhao.nome} (${rotuloDoDia(paraExcluir.dataPrevista)}). Esta ação não pode ser desfeita.` : ''}
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={excluir}
      />
    </div>
  );
}
