import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';
import { ApiError } from '../../../services/api';
import { insumosService } from '../../../services/insumosService';
import { formatarData, formatarMoeda, formatarNumero } from '../../lib/formatar';
import { nomeDoTipoAtividade } from '../../lib/tones';
import type { Insumo, Movimentacao } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

/** Histórico de movimentações do insumo (GET /api/insumos/:id/movimentacoes). */
export function HistoricoDialog({ insumo, onFechar }: { insumo: Insumo | null; onFechar: () => void }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!insumo) return;
    setMovimentacoes(null);
    setErro('');
    insumosService
      .historico(insumo.id)
      .then(setMovimentacoes)
      .catch((e) => setErro(e instanceof ApiError ? e.message : 'Erro ao carregar o histórico'));
  }, [insumo]);

  if (!insumo) return null;

  return (
    <Dialog open onOpenChange={(abrir) => !abrir && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Histórico — {insumo.nome}</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            Saldo atual {formatarNumero(insumo.quantidade)} {insumo.unidade} · últimas 50 movimentações
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto">
          {erro && <p className="text-sm font-mono text-red-400">{erro}</p>}
          {!movimentacoes && !erro && (
            <p className="flex items-center gap-2 text-sm font-mono text-[#5C8065]"><Loader2 size={16} className="animate-spin" /> Carregando...</p>
          )}
          {movimentacoes?.length === 0 && <p className="text-sm font-mono text-[#5C8065]">Nenhuma movimentação registrada.</p>}
          {movimentacoes && movimentacoes.length > 0 && (
            <table className="w-full text-left text-sm font-mono">
              <thead>
                <tr className="text-xs text-[#5C8065] border-b border-[#1A2E20]">
                  <th className="pb-2 font-medium">DATA</th>
                  <th className="pb-2 font-medium">TIPO</th>
                  <th className="pb-2 font-medium text-right">QTD.</th>
                  <th className="pb-2 font-medium text-right">CUSTO UNIT.</th>
                  <th className="pb-2 font-medium pl-4">POR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2E20]/50">
                {movimentacoes.map((m) => {
                  const entrada = m.tipo === 'ENTRADA';
                  return (
                    <tr key={m.id}>
                      <td className="py-2 text-gray-400">{formatarData(m.data)}</td>
                      <td className={`py-2 ${entrada ? 'text-green-500' : 'text-yellow-500'}`}>
                        <span className="flex items-center gap-1.5">
                          {entrada ? <ArrowDownToLine size={13} /> : <ArrowUpFromLine size={13} />} {entrada ? 'Entrada' : 'Saída'}
                        </span>
                        {m.atividade && <span className="text-[10px] text-[#5C8065]">{nomeDoTipoAtividade[m.atividade.tipo]}</span>}
                      </td>
                      <td className="py-2 text-right text-white">
                        {entrada ? '+' : '−'}{formatarNumero(m.quantidade)} {insumo.unidade}
                      </td>
                      <td className="py-2 text-right text-gray-400">{formatarMoeda(m.custoUnitario)}</td>
                      <td className="py-2 pl-4 text-gray-300">{m.usuario.nome}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
