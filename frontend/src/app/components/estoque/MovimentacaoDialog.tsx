import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { ApiError, errosDeCampo } from '../../../services/api';
import { insumosService } from '../../../services/insumosService';
import { formatarMoeda, formatarNumero, lerNumero } from '../../lib/formatar';
import type { Insumo, TipoMovimentacao } from '../../types';
import { BotoesFormulario, ErroCampo, ErroFormulario, inputClass, labelClass } from '../shared/Formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Campos = { quantidade: string; custoUnitario: string };

type Props = {
  insumo: Insumo | null;
  tipo: TipoMovimentacao;
  onFechar: () => void;
  onRegistrado: (insumo: Insumo, tipo: TipoMovimentacao, quantidade: number) => void;
};

/** Registra entrada ou saída de estoque (POST /api/insumos/:id/movimentacoes). */
export function MovimentacaoDialog({ insumo, tipo, onFechar, onRegistrado }: Props) {
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm<Campos>();
  const [erroGeral, setErroGeral] = useState('');
  const entrada = tipo === 'ENTRADA';

  useEffect(() => {
    if (insumo) {
      reset({ quantidade: '', custoUnitario: String(insumo.custoUnitario).replace('.', ',') });
      setErroGeral('');
    }
  }, [insumo, reset]);

  if (!insumo) return null;

  const quantidade = lerNumero(watch('quantidade') ?? '');
  const saldoPrevisto = Number.isFinite(quantidade) && quantidade > 0
    ? insumo.quantidade + (entrada ? quantidade : -quantidade)
    : null;

  const registrar = async (c: Campos) => {
    setErroGeral('');
    const qtd = lerNumero(c.quantidade);
    try {
      const atualizado = await insumosService.movimentar(insumo.id, {
        tipo,
        quantidade: qtd,
        ...(entrada && c.custoUnitario.trim() && { custoUnitario: lerNumero(c.custoUnitario) }),
      });
      onRegistrado(atualizado, tipo, qtd);
    } catch (erro) {
      if (!(erro instanceof ApiError)) return setErroGeral('Erro inesperado.');
      const campos = errosDeCampo(erro.detalhes);
      if (campos.length) campos.forEach(({ campo, mensagem }) => setError(campo as keyof Campos, { message: mensagem }));
      else setErroGeral(erro.message); // ex.: RN06 — saldo insuficiente (422)
    }
  };

  return (
    <Dialog open onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            {entrada ? <ArrowDownToLine className="text-green-500" size={20} /> : <ArrowUpFromLine className="text-yellow-500" size={20} />}
            {entrada ? 'Entrada de estoque' : 'Saída de estoque'}
          </DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            {insumo.nome} — saldo atual: {formatarNumero(insumo.quantidade)} {insumo.unidade}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(registrar)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className={entrada ? 'col-span-1' : 'col-span-2'}>
              <label htmlFor="quantidade" className={labelClass}>Quantidade ({insumo.unidade}) *</label>
              <input id="quantidade" inputMode="decimal" autoFocus placeholder="0" className={inputClass}
                {...register('quantidade', {
                  required: 'Informe a quantidade',
                  validate: (v) => lerNumero(v) > 0 || 'A quantidade deve ser maior que zero',
                })} />
              <ErroCampo mensagem={errors.quantidade?.message} />
            </div>
            {entrada && (
              <div>
                <label htmlFor="custoUnitario" className={labelClass}>Custo unit. (R$)</label>
                <input id="custoUnitario" inputMode="decimal" className={inputClass} {...register('custoUnitario')} />
                <ErroCampo mensagem={errors.custoUnitario?.message} />
              </div>
            )}
          </div>

          {saldoPrevisto !== null && (
            <p className={`text-xs font-mono ${saldoPrevisto < 0 ? 'text-red-400' : 'text-[#5C8065]'}`}>
              Saldo após a operação: {formatarNumero(saldoPrevisto)} {insumo.unidade}
              {entrada && Number.isFinite(lerNumero(watch('custoUnitario') ?? ''))
                ? ` · total da compra ${formatarMoeda(quantidade * lerNumero(watch('custoUnitario')))}`
                : ''}
            </p>
          )}

          <ErroFormulario mensagem={erroGeral} />
          <BotoesFormulario enviando={isSubmitting} textoConfirmar={entrada ? 'Registrar entrada' : 'Registrar saída'} onCancelar={onFechar} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
