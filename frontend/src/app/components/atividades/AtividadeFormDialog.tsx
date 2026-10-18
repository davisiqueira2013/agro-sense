import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Loader2, Wind } from 'lucide-react';
import { ApiError } from '../../../services/api';
import { atividadesService } from '../../../services/atividadesService';
import { paraInputData } from '../../lib/formatar';
import { nomeDoTipoAtividade } from '../../lib/tones';
import type { Atividade, AtividadeEntrada, Responsavel, Talhao, TipoAtividade } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Campos = {
  tipo: TipoAtividade | '';
  talhaoId: string;
  responsavelId: string;
  dataPrevista: string;
  observacao: string;
};

const vazio = (): Campos => ({ tipo: '', talhaoId: '', responsavelId: '', dataPrevista: paraInputData(new Date()), observacao: '' });

const daAtividade = (a: Atividade): Campos => ({
  tipo: a.tipo,
  talhaoId: String(a.talhao.id),
  responsavelId: String(a.responsavel.id),
  dataPrevista: paraInputData(a.dataPrevista),
  observacao: a.observacao ?? '',
});

type Props = {
  aberto: boolean;
  atividade?: Atividade;
  talhoes: Pick<Talhao, 'id' | 'nome'>[];
  responsaveis: Responsavel[];
  onFechar: () => void;
  onSalvo: (atividade: Atividade, nova: boolean) => void;
};

const inputClass =
  'w-full bg-[#08100A] border border-[#1A2E20] text-gray-200 text-sm rounded-lg p-2.5 focus:outline-none focus:border-green-500 transition-colors font-mono placeholder-[#3E5A45] [color-scheme:dark]';
const labelClass = 'block text-xs font-mono text-[#5C8065] mb-1.5 uppercase tracking-wider';

export function AtividadeFormDialog({ aberto, atividade, talhoes, responsaveis, onFechar, onSalvo }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({ defaultValues: vazio() });
  const [erroGeral, setErroGeral] = useState<{ mensagem: string; vento: boolean } | null>(null);

  useEffect(() => {
    if (aberto) {
      reset(atividade ? daAtividade(atividade) : vazio());
      setErroGeral(null);
    }
  }, [aberto, atividade, reset]);

  const salvar = async (campos: Campos) => {
    setErroGeral(null);
    const dados: AtividadeEntrada = {
      tipo: campos.tipo as TipoAtividade,
      talhaoId: Number(campos.talhaoId),
      responsavelId: Number(campos.responsavelId),
      dataPrevista: campos.dataPrevista,
      ...(campos.observacao.trim() && { observacao: campos.observacao.trim() }),
    };

    try {
      const salva = atividade ? await atividadesService.atualizar(atividade.id, dados) : await atividadesService.criar(dados);
      onSalvo(salva, !atividade);
    } catch (erro) {
      if (!(erro instanceof ApiError)) {
        setErroGeral({ mensagem: 'Erro inesperado ao salvar.', vento: false });
        return;
      }
      if (Array.isArray(erro.detalhes)) {
        for (const { campo, mensagem } of erro.detalhes as { campo: keyof Campos; mensagem: string }[]) {
          setError(campo, { message: mensagem });
        }
      } else {
        // Ex.: RN05 (409, vento forte) ou responsável inativo (422).
        setErroGeral({ mensagem: erro.message, vento: erro.codigo === 'PULVERIZACAO_BLOQUEADA_VENTO' });
      }
    }
  };

  const erroDe = (campo: keyof Campos) =>
    errors[campo] && <p className="text-xs font-mono text-red-400 mt-1">{errors[campo]?.message}</p>;

  const tipo = watch('tipo');

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{atividade ? 'Editar atividade' : 'Nova atividade'}</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            {atividade ? 'Altere os dados da operação e salve.' : 'Agende uma operação de campo para um talhão.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(salvar)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="tipo" className={labelClass}>Tipo *</label>
              <select id="tipo" className={inputClass} {...register('tipo', { required: 'Selecione o tipo' })}>
                <option value="">Selecione...</option>
                {(Object.keys(nomeDoTipoAtividade) as TipoAtividade[]).map((t) => (
                  <option key={t} value={t}>{nomeDoTipoAtividade[t]}</option>
                ))}
              </select>
              {erroDe('tipo')}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="talhaoId" className={labelClass}>Talhão *</label>
              <select id="talhaoId" className={inputClass} {...register('talhaoId', { required: 'Selecione o talhão' })}>
                <option value="">Selecione...</option>
                {talhoes.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
              {erroDe('talhaoId')}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="responsavelId" className={labelClass}>Responsável *</label>
              <select id="responsavelId" className={inputClass} {...register('responsavelId', { required: 'Selecione o responsável' })}>
                <option value="">Selecione...</option>
                {responsaveis.map((r) => (
                  <option key={r.id} value={r.id}>{r.nome} — {r.cargo}</option>
                ))}
              </select>
              {erroDe('responsavelId')}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="dataPrevista" className={labelClass}>Data prevista *</label>
              <input id="dataPrevista" type="date" className={inputClass} {...register('dataPrevista', { required: 'Informe a data' })} />
              {erroDe('dataPrevista')}
            </div>
            <div className="col-span-2">
              <label htmlFor="observacao" className={labelClass}>Observação</label>
              <textarea
                id="observacao"
                rows={3}
                placeholder="Ex.: aplicar no início da manhã"
                className={`${inputClass} resize-none`}
                {...register('observacao', { maxLength: { value: 500, message: 'Máximo de 500 caracteres' } })}
              />
              {erroDe('observacao')}
            </div>
          </div>

          {tipo === 'PULVERIZACAO' && !erroGeral && (
            <p className="flex items-center gap-2 text-[11px] font-mono text-[#5C8065]">
              <Wind size={14} /> Pulverizações não podem ser agendadas em talhões com alerta de vento forte na data (RN05).
            </p>
          )}

          {erroGeral && (
            <div role="alert" className="flex gap-3 p-3 rounded-lg border border-red-900/60 bg-red-950/30 text-sm font-mono text-red-300">
              {erroGeral.vento ? <Wind size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
              <span>{erroGeral.mensagem}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#08100A] border border-[#1A2E20] rounded-lg text-sm text-gray-300 hover:bg-[#122216] cursor-pointer font-mono"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium cursor-pointer disabled:opacity-70"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {atividade ? 'Salvar alterações' : 'Agendar atividade'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
