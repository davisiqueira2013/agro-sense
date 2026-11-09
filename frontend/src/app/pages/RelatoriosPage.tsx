import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, FilePlus, FileText, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { relatoriosService } from '../../services/relatoriosService';
import { GerarRelatorioDialog } from '../components/relatorios/GerarRelatorioDialog';
import { Card } from '../components/shared/Card';
import { ConfirmarExclusao } from '../components/shared/ConfirmarExclusao';
import { Carregando, ErroCarregamento, Vazio } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { formatarData, formatarDataHora } from '../lib/formatar';
import { permissoes } from '../lib/permissoes';
import { TIPOS_RELATORIO } from '../lib/relatorios';
import type { Relatorio } from '../types';

const tamanho = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`);

export function RelatoriosPage() {
  const { usuario } = useAuth();
  const { podeEditar, podeExcluir } = permissoes(usuario!.perfil);

  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState<number | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Relatorio | null>(null);

  // GET /api/relatorios
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setRelatorios(await relatoriosService.listar());
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const baixar = async (r: Relatorio) => {
    setBaixando(r.id);
    try {
      await relatoriosService.baixar(r);
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível baixar o relatório');
    } finally {
      setBaixando(null);
    }
  };

  const aoGerar = (r: Relatorio) => {
    setGerando(false);
    toast.success('Relatório gerado', { description: r.titulo });
    carregar();
    baixar(r);
  };

  const excluir = async () => {
    if (!paraExcluir) return;
    try {
      await relatoriosService.excluir(paraExcluir.id);
      toast.success('Relatório excluído');
      carregar();
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível excluir');
    } finally {
      setParaExcluir(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Relatórios PDF"
        subtitulo={`Gerados no servidor com os dados do período — ${relatorios.length} relatório(s)`}
        acoes={podeEditar && (
          <PrimaryButton icone={<FilePlus size={16} />} onClick={() => setGerando(true)}>Gerar Relatório</PrimaryButton>
        )}
      />

      {carregando ? (
        <Carregando linhas={2} />
      ) : erro ? (
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregar} />
      ) : relatorios.length === 0 ? (
        <Vazio mensagem={podeEditar ? 'Nenhum relatório gerado ainda. Use "Gerar Relatório".' : 'Nenhum relatório gerado ainda.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatorios.map((r) => (
            <Card key={r.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:border-[#5C8065] transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-[#122216] border border-[#1A2E20] rounded-lg text-green-500 shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{TIPOS_RELATORIO.find((t) => t.valor === r.tipo)?.nome ?? r.tipo}</h3>
                  <p className="text-xs font-mono text-gray-400">
                    {formatarData(r.periodoInicio)} a {formatarData(r.periodoFim)}
                  </p>
                  <p className="text-xs font-mono text-[#5C8065]">
                    Gerado em {formatarDataHora(r.geradoEm)} por {r.geradoPor.nome} • {tamanho(r.tamanhoBytes)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 shrink-0 max-sm:border-t max-sm:border-[#1A2E20] max-sm:pt-2">
                <button
                  type="button"
                  aria-label={`Baixar ${r.titulo}`}
                  onClick={() => baixar(r)}
                  disabled={baixando === r.id}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#122216] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {baixando === r.id ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                </button>
                {podeExcluir && (
                  <button
                    type="button"
                    aria-label={`Excluir ${r.titulo}`}
                    onClick={() => setParaExcluir(r)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-[#122216] rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <GerarRelatorioDialog aberto={gerando} onFechar={() => setGerando(false)} onGerado={aoGerar} />
      <ConfirmarExclusao
        aberto={paraExcluir !== null}
        titulo="Excluir relatório?"
        descricao={paraExcluir ? `"${paraExcluir.titulo}" será removido. Esta ação não pode ser desfeita.` : ''}
        onConfirmar={excluir}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
