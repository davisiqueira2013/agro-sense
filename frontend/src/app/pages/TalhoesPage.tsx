import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Clock, Droplets, LayoutGrid, List, MapPin, Pencil, Plus, Search, Thermometer, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { talhoesService } from '../../services/talhoesService';
import { Card } from '../components/shared/Card';
import { ConfirmarExclusao } from '../components/shared/ConfirmarExclusao';
import { DataTable } from '../components/shared/DataTable';
import { Carregando, ErroCarregamento, Vazio } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton, SecondaryButton } from '../components/shared/Buttons';
import { TalhaoFormDialog } from '../components/talhoes/TalhaoFormDialog';
import { formatarDataHora, formatarNumero } from '../lib/formatar';
import { permissoes } from '../lib/permissoes';
import { nomeDoStatusTalhao, toneClasses, toneDoTalhao } from '../lib/tones';
import type { Talhao } from '../types';

type Visao = 'cards' | 'tabela';

export function TalhoesPage() {
  const { usuario } = useAuth();
  const { podeEditar, podeExcluir } = permissoes(usuario!.perfil);

  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [visao, setVisao] = useState<Visao>('cards');
  const [formulario, setFormulario] = useState<{ aberto: boolean; talhao?: Talhao }>({ aberto: false });
  const [paraExcluir, setParaExcluir] = useState<Talhao | null>(null);

  // GET /api/talhoes?busca=
  const carregar = useCallback(async (termo: string) => {
    setCarregando(true);
    setErro('');
    try {
      setTalhoes(await talhoesService.listar(termo));
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca no servidor 300 ms depois que o usuário para de digitar.
  useEffect(() => {
    const espera = setTimeout(() => carregar(busca), busca ? 300 : 0);
    return () => clearTimeout(espera);
  }, [busca, carregar]);

  const aoSalvar = (talhao: Talhao, novo: boolean) => {
    setFormulario({ aberto: false });
    toast.success(novo ? `${talhao.nome} cadastrado` : `${talhao.nome} atualizado`);
    carregar(busca);
  };

  // DELETE /api/talhoes/:id — RN03: a API recusa (409) se houver atividades.
  const excluir = async () => {
    if (!paraExcluir) return;
    try {
      await talhoesService.excluir(paraExcluir.id);
      toast.success(`${paraExcluir.nome} excluído`);
      setParaExcluir(null);
      carregar(busca);
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível excluir');
      setParaExcluir(null);
    }
  };

  const acoes = (t: Talhao) =>
    (podeEditar || podeExcluir) && (
      <div className="flex items-center gap-1">
        {podeEditar && (
          <button
            type="button"
            onClick={() => setFormulario({ aberto: true, talhao: t })}
            aria-label={`Editar ${t.nome}`}
            title="Editar"
            className="p-1.5 text-gray-500 hover:text-white hover:bg-[#122216] rounded-md cursor-pointer"
          >
            <Pencil size={15} />
          </button>
        )}
        {podeExcluir && (
          <button
            type="button"
            onClick={() => setParaExcluir(t)}
            aria-label={`Excluir ${t.nome}`}
            title="Excluir"
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950/30 rounded-md cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    );

  const badge = (t: Talhao) => (
    <span className={`text-xs font-mono px-2.5 py-1 rounded-full border bg-[#08100A] whitespace-nowrap ${toneClasses[toneDoTalhao[t.status]].badge}`}>
      {nomeDoStatusTalhao[t.status]}
    </span>
  );

  const conteudo = () => {
    if (carregando && talhoes.length === 0) return <Carregando />;
    if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={() => carregar(busca)} />;
    if (talhoes.length === 0) {
      return <Vazio mensagem={busca ? `Nenhum talhão encontrado para "${busca}".` : 'Nenhum talhão cadastrado ainda.'} />;
    }

    if (visao === 'tabela') {
      return (
        <DataTable colunas={['NOME', 'MUNICÍPIO', 'CULTURA', 'ÁREA', 'STATUS', 'ATIVIDADES', '']}>
          {talhoes.map((t) => (
            <tr key={t.id} className="hover:bg-[#122216]/30 transition-colors">
              <td className="py-3 text-white font-semibold">{t.nome}</td>
              <td className="py-3 text-gray-400">{t.municipio}, {t.uf}</td>
              <td className="py-3 text-gray-300">{t.cultura}</td>
              <td className="py-3 text-white">{formatarNumero(t.areaHa)} ha</td>
              <td className="py-3">{badge(t)}</td>
              <td className="py-3 text-[#5C8065]">{t._count.atividades}</td>
              <td className="py-3">{acoes(t)}</td>
            </tr>
          ))}
        </DataTable>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {talhoes.map((t) => (
          <Card key={t.id} className="p-6 flex flex-col justify-between hover:border-green-500/40 transition-colors">
            <div>
              <div className="flex justify-between items-start gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{t.nome}</h3>
                  <div className="flex items-center gap-1 text-xs text-[#5C8065] font-mono mt-0.5">
                    <MapPin size={12} /> {t.municipio}, {t.uf}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {acoes(t)}
                  {badge(t)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                  <span className="text-[10px] font-mono text-[#5C8065] uppercase block mb-1">Cultura</span>
                  <span className="text-sm font-bold text-white font-mono">{t.cultura}</span>
                </div>
                <div className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                  <span className="text-[10px] font-mono text-[#5C8065] uppercase block mb-1">Área</span>
                  <span className="text-sm font-bold text-white font-mono">{formatarNumero(t.areaHa)} ha</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1A2E20] text-xs text-[#5C8065] font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1" title="Temperatura">
                  <Thermometer size={14} /> {t.temperaturaAtual === null ? '—' : `${formatarNumero(t.temperaturaAtual)}°C`}
                </span>
                <span className="flex items-center gap-1" title="Umidade">
                  <Droplets size={14} /> {t.umidadeAtual === null ? '—' : `${formatarNumero(t.umidadeAtual)}%`}
                </span>
              </div>
              <span className="flex items-center gap-1" title="Última atualização do clima">
                <Clock size={12} /> {t.climaAtualizadoEm ? formatarDataHora(t.climaAtualizadoEm) : 'sem dados de clima'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const totalArea = talhoes.reduce((soma, t) => soma + t.areaHa, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Talhões"
        subtitulo={
          carregando && talhoes.length === 0
            ? 'Gestão de áreas e culturas'
            : `Gestão de áreas e culturas — ${talhoes.length} talhão(ões), ${formatarNumero(totalArea)} ha`
        }
        acoes={
          <>
            <SecondaryButton
              className="font-medium"
              icone={visao === 'cards' ? <List size={16} /> : <LayoutGrid size={16} />}
              onClick={() => setVisao(visao === 'cards' ? 'tabela' : 'cards')}
            >
              {visao === 'cards' ? 'Tabela' : 'Cards'}
            </SecondaryButton>
            {podeEditar && (
              <PrimaryButton icone={<Plus size={16} />} onClick={() => setFormulario({ aberto: true })}>
                Novo Talhão
              </PrimaryButton>
            )}
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

      {conteudo()}

      <TalhaoFormDialog
        aberto={formulario.aberto}
        talhao={formulario.talhao}
        onFechar={() => setFormulario({ aberto: false })}
        onSalvo={aoSalvar}
      />

      <ConfirmarExclusao
        aberto={!!paraExcluir}
        titulo={`Excluir ${paraExcluir?.nome ?? ''}?`}
        descricao={
          paraExcluir && paraExcluir._count.atividades > 0
            ? `Este talhão tem ${paraExcluir._count.atividades} atividade(s) registrada(s). O sistema não permite excluí-lo para preservar o histórico.`
            : 'Esta ação não pode ser desfeita.'
        }
        onCancelar={() => setParaExcluir(null)}
        onConfirmar={excluir}
      />
    </div>
  );
}
