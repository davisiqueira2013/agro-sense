import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowDownToLine, ArrowUpFromLine, History, Pencil, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { insumosService, type FiltrosInsumos } from '../../services/insumosService';
import { HistoricoDialog } from '../components/estoque/HistoricoDialog';
import { InsumoFormDialog } from '../components/estoque/InsumoFormDialog';
import { MovimentacaoDialog } from '../components/estoque/MovimentacaoDialog';
import { Card } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { ErroCarregamento, Vazio } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { formatarMoeda, formatarNumero } from '../lib/formatar';
import { permissoes } from '../lib/permissoes';
import { nomeDaCategoria, nomeDoStatusInsumo, toneClasses, toneDoInsumo } from '../lib/tones';
import type { CategoriaInsumo, Insumo, ResumoEstoque, StatusInsumo, TipoMovimentacao, Tone } from '../types';

const selectClass =
  'bg-[#08100A] border border-[#1A2E20] text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 font-mono cursor-pointer';
const botaoAcao =
  'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border border-transparent cursor-pointer transition-colors';

export function EstoquePage() {
  const { usuario } = useAuth();
  const { podeEditar } = permissoes(usuario!.perfil);

  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [resumo, setResumo] = useState<ResumoEstoque | null>(null);
  const [filtros, setFiltros] = useState<FiltrosInsumos>({});
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState<{ aberto: boolean; insumo?: Insumo }>({ aberto: false });
  const [movimento, setMovimento] = useState<{ insumo: Insumo; tipo: TipoMovimentacao } | null>(null);
  const [historico, setHistorico] = useState<Insumo | null>(null);

  // GET /api/insumos + GET /api/insumos/resumo
  const carregar = useCallback(async (f: FiltrosInsumos) => {
    setCarregando(true);
    setErro('');
    try {
      const [lista, totais] = await Promise.all([insumosService.listar(f), insumosService.resumo()]);
      setInsumos(lista);
      setResumo(totais);
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(filtros);
  }, [filtros, carregar]);

  // Busca por nome: espera 300 ms depois de parar de digitar.
  useEffect(() => {
    const espera = setTimeout(() => setFiltros((f) => ({ ...f, busca: busca.trim() || undefined })), 300);
    return () => clearTimeout(espera);
  }, [busca]);

  const temFiltro = Object.values(filtros).some(Boolean);

  const aoRegistrar = (insumo: Insumo, tipo: TipoMovimentacao, quantidade: number) => {
    setMovimento(null);
    const verbo = tipo === 'ENTRADA' ? 'Entrada' : 'Saída';
    toast.success(`${verbo} de ${formatarNumero(quantidade)} ${insumo.unidade} registrada`, {
      description: `${insumo.nome}: novo saldo ${formatarNumero(insumo.quantidade)} ${insumo.unidade} (${nomeDoStatusInsumo[insumo.status]})`,
    });
    carregar(filtros);
  };

  const aoSalvar = (insumo: Insumo, novo: boolean) => {
    setFormulario({ aberto: false });
    toast.success(`${insumo.nome} ${novo ? 'cadastrado' : 'atualizado'}`);
    carregar(filtros);
  };

  const cards: { titulo: string; valor: string; detalhe?: string; tone: Tone; filtro?: StatusInsumo }[] = [
    { titulo: 'TOTAL DE ITENS', valor: resumo ? String(resumo.totalItens) : '—', tone: 'green' },
    { titulo: 'ABAIXO DO MÍNIMO', valor: resumo ? String(resumo.abaixoMinimo) : '—', detalhe: resumo ? `+ ${resumo.emAtencao} em atenção` : undefined, tone: 'red', filtro: 'BAIXO' },
    { titulo: 'VALOR ESTIMADO', valor: resumo ? formatarMoeda(resumo.valorEstimado) : '—', tone: 'yellow' },
  ];

  const conteudo = () => {
    if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={() => carregar(filtros)} />;
    if (!carregando && insumos.length === 0) {
      return <Vazio mensagem={temFiltro ? 'Nenhum insumo com esses filtros.' : 'Nenhum insumo cadastrado.'} />;
    }
    return (
      <div className={carregando ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <DataTable colunas={['INSUMO', 'CATEGORIA', 'QUANTIDADE', 'CUSTO UNIT.', 'STATUS', 'AÇÕES']}>
          {insumos.map((i) => (
            <tr key={i.id} className="hover:bg-[#122216]/30 transition-colors">
              <td className="py-3 pr-3 text-white font-semibold">{i.nome}</td>
              <td className="py-3 pr-3 text-gray-400">{nomeDaCategoria[i.categoria]}</td>
              <td className="py-3 pr-3 whitespace-nowrap">
                <span className="text-white">{formatarNumero(i.quantidade)} {i.unidade}</span>
                <p className="text-[11px] text-[#5C8065]">mín. {formatarNumero(i.estoqueMinimo)} {i.unidade}</p>
              </td>
              <td className="py-3 pr-3 text-gray-400 whitespace-nowrap">{formatarMoeda(i.custoUnitario)}</td>
              <td className={`py-3 pr-3 font-bold ${toneClasses[toneDoInsumo[i.status]].text}`}>{nomeDoStatusInsumo[i.status]}</td>
              <td className="py-2">
                <div className="flex items-center gap-1">
                  {podeEditar && (
                    <>
                      <button type="button" onClick={() => setMovimento({ insumo: i, tipo: 'ENTRADA' })}
                        className={`${botaoAcao} text-green-500 hover:border-green-900/60 hover:bg-green-950/30`}>
                        <ArrowDownToLine size={13} /> Entrada
                      </button>
                      <button type="button" onClick={() => setMovimento({ insumo: i, tipo: 'SAIDA' })}
                        className={`${botaoAcao} text-yellow-500 hover:border-yellow-900/60 hover:bg-yellow-950/30`}>
                        <ArrowUpFromLine size={13} /> Saída
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => setHistorico(i)} title="Histórico" aria-label={`Histórico de ${i.nome}`}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-[#122216] rounded-md cursor-pointer">
                    <History size={14} />
                  </button>
                  {podeEditar && (
                    <button type="button" onClick={() => setFormulario({ aberto: true, insumo: i })} title="Editar" aria-label={`Editar ${i.nome}`}
                      className="p-1.5 text-gray-500 hover:text-white hover:bg-[#122216] rounded-md cursor-pointer">
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Estoque"
        subtitulo="Controle de insumos e materiais"
        acoes={podeEditar && (
          <PrimaryButton icone={<Plus size={16} />} onClick={() => setFormulario({ aberto: true })}>Adicionar Insumo</PrimaryButton>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card
            key={card.titulo}
            onClick={card.filtro ? () => setFiltros((f) => ({ ...f, status: f.status === card.filtro ? undefined : card.filtro })) : undefined}
            className={`p-5 border-l-4 shadow-none ${toneClasses[card.tone].accentBar} ${card.filtro ? 'cursor-pointer hover:bg-[#0C170F]' : ''}`}
            title={card.filtro ? 'Clique para filtrar' : undefined}
          >
            <p className="text-xs font-mono text-[#5C8065] mb-1">{card.titulo}</p>
            <p className="text-3xl font-bold text-white font-mono">{card.valor}</p>
            {card.detalhe && <p className="text-xs font-mono text-yellow-500 mt-1">{card.detalhe}</p>}
          </Card>
        ))}
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-3 shadow-none">
        <Search size={18} className="text-[#5C8065] ml-2" />
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar insumos"
          placeholder="Buscar insumo..."
          className="bg-transparent border-none text-gray-200 text-sm focus:outline-none flex-1 min-w-40 font-mono placeholder-[#5C8065]"
        />
        <select aria-label="Filtrar por categoria" className={selectClass} value={filtros.categoria ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, categoria: (e.target.value || undefined) as CategoriaInsumo | undefined }))}>
          <option value="">Todas as categorias</option>
          {(Object.keys(nomeDaCategoria) as CategoriaInsumo[]).map((c) => <option key={c} value={c}>{nomeDaCategoria[c]}</option>)}
        </select>
        <select aria-label="Filtrar por status" className={selectClass} value={filtros.status ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, status: (e.target.value || undefined) as StatusInsumo | undefined }))}>
          <option value="">Todos os status</option>
          {(Object.keys(nomeDoStatusInsumo) as StatusInsumo[]).map((s) => <option key={s} value={s}>{nomeDoStatusInsumo[s]}</option>)}
        </select>
        {temFiltro && (
          <button type="button" onClick={() => { setBusca(''); setFiltros({}); }}
            className="flex items-center gap-1 text-xs font-mono text-[#5C8065] hover:text-white cursor-pointer">
            <X size={14} /> Limpar
          </button>
        )}
      </Card>

      {conteudo()}

      <InsumoFormDialog aberto={formulario.aberto} insumo={formulario.insumo} onFechar={() => setFormulario({ aberto: false })} onSalvo={aoSalvar} />
      <MovimentacaoDialog insumo={movimento?.insumo ?? null} tipo={movimento?.tipo ?? 'ENTRADA'} onFechar={() => setMovimento(null)} onRegistrado={aoRegistrar} />
      <HistoricoDialog insumo={historico} onFechar={() => setHistorico(null)} />
    </div>
  );
}
