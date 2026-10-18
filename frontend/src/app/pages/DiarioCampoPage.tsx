import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Clock, MapPin, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { diarioService, type FiltrosDiario } from '../../services/diarioService';
import { talhoesService } from '../../services/talhoesService';
import { RegistroFormDialog } from '../components/diario/RegistroFormDialog';
import { Card } from '../components/shared/Card';
import { ConfirmarExclusao } from '../components/shared/ConfirmarExclusao';
import { ErroCarregamento, Vazio } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { rotuloDoDia } from '../lib/formatar';
import { permissoes, podeAlterarRegistro } from '../lib/permissoes';
import { nomeDaCategoriaRegistro, toneClasses, toneDaCategoriaRegistro } from '../lib/tones';
import type { CategoriaRegistro, RegistroDiario, Talhao } from '../types';

const selectClass =
  'bg-[#08100A] border border-[#1A2E20] text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 font-mono cursor-pointer';

export function DiarioCampoPage() {
  const { usuario } = useAuth();
  const { podeEditar } = permissoes(usuario!.perfil);

  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const [talhoes, setTalhoes] = useState<Pick<Talhao, 'id' | 'nome'>[]>([]);
  const [filtros, setFiltros] = useState<FiltrosDiario>({});
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState<{ aberto: boolean; registro?: RegistroDiario }>({ aberto: false });
  const [paraExcluir, setParaExcluir] = useState<RegistroDiario | null>(null);

  // GET /api/diario
  const carregar = useCallback(async (f: FiltrosDiario) => {
    setCarregando(true);
    setErro('');
    try {
      setRegistros(await diarioService.listar(f));
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(filtros);
  }, [filtros, carregar]);

  useEffect(() => {
    const espera = setTimeout(() => setFiltros((f) => ({ ...f, busca: busca.trim() || undefined })), 300);
    return () => clearTimeout(espera);
  }, [busca]);

  useEffect(() => {
    talhoesService.listar().then(setTalhoes).catch(() => setTalhoes([]));
  }, []);

  const temFiltro = Object.values(filtros).some(Boolean);

  const aoSalvar = (r: RegistroDiario, novo: boolean) => {
    setFormulario({ aberto: false });
    toast.success(novo ? 'Registro salvo no diário' : 'Registro atualizado');
    carregar(filtros);
  };

  const excluir = async () => {
    if (!paraExcluir) return;
    try {
      await diarioService.excluir(paraExcluir.id);
      toast.success('Registro excluído');
      carregar(filtros);
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível excluir');
    } finally {
      setParaExcluir(null);
    }
  };

  const conteudo = () => {
    if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={() => carregar(filtros)} />;
    if (!carregando && registros.length === 0) {
      return <Vazio mensagem={temFiltro ? 'Nenhum registro com esses filtros.' : 'Nenhum registro no diário ainda.'} />;
    }
    return (
      <div className={`grid gap-4 ${carregando ? 'opacity-60' : ''}`}>
        {registros.map((r) => {
          const proprio = r.autor.id === usuario!.id;
          const podeAlterar = podeAlterarRegistro(usuario!, r.autor.id);
          return (
            <Card key={r.id} className="p-6 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-lg font-bold text-white">{r.titulo}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  {podeAlterar && (
                    <>
                      <button type="button" onClick={() => setFormulario({ aberto: true, registro: r })} title="Editar" aria-label={`Editar ${r.titulo}`}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-[#122216] rounded-md cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => setParaExcluir(r)} title="Excluir" aria-label={`Excluir ${r.titulo}`}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded-md cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                  <span className={`ml-1 text-xs font-mono px-2 py-1 rounded bg-[#08100A] border ${toneClasses[toneDaCategoriaRegistro[r.categoria]].badge}`}>
                    {nomeDaCategoriaRegistro[r.categoria]}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-mono whitespace-pre-line">{r.texto}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#5C8065] mt-2">
                <span className="flex items-center gap-1"><Clock size={14} /> {rotuloDoDia(r.data)}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {r.autor.nome}{proprio && ' (você)'}</span>
                {r.talhao && <span className="flex items-center gap-1"><MapPin size={14} /> {r.talhao.nome}</span>}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Diário de Campo"
        subtitulo={`Registros agronômicos e observações${carregando ? '' : ` — ${registros.length} registro(s)`}`}
        acoes={podeEditar && <PrimaryButton icone={<Plus size={16} />} onClick={() => setFormulario({ aberto: true })}>Novo Registro</PrimaryButton>}
      />

      <Card className="p-3 flex flex-wrap items-center gap-3 shadow-none">
        <Search size={18} className="text-[#5C8065] ml-2" />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar no diário"
          placeholder="Buscar no título ou no texto..."
          className="bg-transparent border-none text-gray-200 text-sm focus:outline-none flex-1 min-w-40 font-mono placeholder-[#5C8065]" />
        <select aria-label="Filtrar por categoria" className={selectClass} value={filtros.categoria ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, categoria: (e.target.value || undefined) as CategoriaRegistro | undefined }))}>
          <option value="">Todas as categorias</option>
          {(Object.keys(nomeDaCategoriaRegistro) as CategoriaRegistro[]).map((c) => <option key={c} value={c}>{nomeDaCategoriaRegistro[c]}</option>)}
        </select>
        <select aria-label="Filtrar por talhão" className={selectClass} value={filtros.talhaoId ?? ''}
          onChange={(e) => setFiltros((f) => ({ ...f, talhaoId: e.target.value ? Number(e.target.value) : undefined }))}>
          <option value="">Todos os talhões</option>
          {talhoes.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        {temFiltro && (
          <button type="button" onClick={() => { setBusca(''); setFiltros({}); }}
            className="flex items-center gap-1 text-xs font-mono text-[#5C8065] hover:text-white cursor-pointer">
            <X size={14} /> Limpar
          </button>
        )}
      </Card>

      {conteudo()}

      <RegistroFormDialog aberto={formulario.aberto} registro={formulario.registro} talhoes={talhoes}
        onFechar={() => setFormulario({ aberto: false })} onSalvo={aoSalvar} />
      <ConfirmarExclusao aberto={!!paraExcluir} titulo="Excluir registro?"
        descricao={paraExcluir ? `"${paraExcluir.titulo}", de ${paraExcluir.autor.nome}. Esta ação não pode ser desfeita.` : ''}
        onCancelar={() => setParaExcluir(null)} onConfirmar={excluir} />
    </div>
  );
}
