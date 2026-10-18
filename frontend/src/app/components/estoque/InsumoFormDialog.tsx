import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError, errosDeCampo } from '../../../services/api';
import { insumosService } from '../../../services/insumosService';
import { lerNumero } from '../../lib/formatar';
import { nomeDaCategoria } from '../../lib/tones';
import type { CategoriaInsumo, Insumo, InsumoEntrada } from '../../types';
import { BotoesFormulario, ErroCampo, ErroFormulario, inputClass, labelClass } from '../shared/Formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

const UNIDADES = ['kg', 'L', 'un', 'sc', 't', 'mL', 'g'];

type Campos = {
  nome: string;
  categoria: CategoriaInsumo | '';
  unidade: string;
  estoqueMinimo: string;
  custoUnitario: string;
  quantidadeInicial: string;
};

const vazio: Campos = { nome: '', categoria: '', unidade: 'kg', estoqueMinimo: '', custoUnitario: '', quantidadeInicial: '' };
const comVirgula = (n: number) => String(n).replace('.', ',');

const doInsumo = (i: Insumo): Campos => ({
  nome: i.nome,
  categoria: i.categoria,
  unidade: i.unidade,
  estoqueMinimo: comVirgula(i.estoqueMinimo),
  custoUnitario: comVirgula(i.custoUnitario),
  quantidadeInicial: '',
});

const naoNegativo = (v: string) => (v.trim() === '' ? true : lerNumero(v) >= 0 || 'Informe um número maior ou igual a zero');

type Props = { aberto: boolean; insumo?: Insumo; onFechar: () => void; onSalvo: (insumo: Insumo, novo: boolean) => void };

export function InsumoFormDialog({ aberto, insumo, onFechar, onSalvo }: Props) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Campos>({ defaultValues: vazio });
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (aberto) {
      reset(insumo ? doInsumo(insumo) : vazio);
      setErroGeral('');
    }
  }, [aberto, insumo, reset]);

  const salvar = async (c: Campos) => {
    setErroGeral('');
    const dados: InsumoEntrada = {
      nome: c.nome.trim(),
      categoria: c.categoria as CategoriaInsumo,
      unidade: c.unidade,
      estoqueMinimo: lerNumero(c.estoqueMinimo),
      custoUnitario: lerNumero(c.custoUnitario),
      ...(!insumo && c.quantidadeInicial.trim() && { quantidadeInicial: lerNumero(c.quantidadeInicial) }),
    };
    try {
      const salvo = insumo ? await insumosService.atualizar(insumo.id, dados) : await insumosService.criar(dados);
      onSalvo(salvo, !insumo);
    } catch (erro) {
      if (!(erro instanceof ApiError)) return setErroGeral('Erro inesperado ao salvar.');
      const campos = errosDeCampo(erro.detalhes);
      if (campos.length) campos.forEach(({ campo, mensagem }) => setError(campo as keyof Campos, { message: mensagem }));
      else if (erro.codigo === 'INSUMO_DUPLICADO') setError('nome', { message: erro.message });
      else setErroGeral(erro.message);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{insumo ? `Editar ${insumo.nome}` : 'Novo insumo'}</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            {insumo
              ? 'A quantidade em estoque só muda por entrada ou saída (RN06).'
              : 'Cadastre o insumo. A quantidade inicial é registrada como uma entrada.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(salvar)} noValidate className="space-y-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-6">
              <label htmlFor="nome" className={labelClass}>Nome *</label>
              <input id="nome" placeholder="Fertilizante NPK 20-05-20" className={inputClass} {...register('nome', { required: 'Informe o nome do insumo' })} />
              <ErroCampo mensagem={errors.nome?.message} />
            </div>
            <div className="col-span-4">
              <label htmlFor="categoria" className={labelClass}>Categoria *</label>
              <select id="categoria" className={inputClass} {...register('categoria', { required: 'Selecione a categoria' })}>
                <option value="">Selecione...</option>
                {(Object.keys(nomeDaCategoria) as CategoriaInsumo[]).map((c) => (
                  <option key={c} value={c}>{nomeDaCategoria[c]}</option>
                ))}
              </select>
              <ErroCampo mensagem={errors.categoria?.message} />
            </div>
            <div className="col-span-2">
              <label htmlFor="unidade" className={labelClass}>Unidade *</label>
              <select id="unidade" className={inputClass} {...register('unidade')}>
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className={insumo ? 'col-span-3' : 'col-span-2'}>
              <label htmlFor="estoqueMinimo" className={labelClass}>Estoque mínimo *</label>
              <input id="estoqueMinimo" inputMode="decimal" placeholder="400" className={inputClass}
                {...register('estoqueMinimo', { required: 'Informe o mínimo', validate: naoNegativo })} />
              <ErroCampo mensagem={errors.estoqueMinimo?.message} />
            </div>
            <div className={insumo ? 'col-span-3' : 'col-span-2'}>
              <label htmlFor="custoUnitario" className={labelClass}>Custo unit. (R$) *</label>
              <input id="custoUnitario" inputMode="decimal" placeholder="4,20" className={inputClass}
                {...register('custoUnitario', { required: 'Informe o custo', validate: naoNegativo })} />
              <ErroCampo mensagem={errors.custoUnitario?.message} />
            </div>
            {!insumo && (
              <div className="col-span-2">
                <label htmlFor="quantidadeInicial" className={labelClass}>Qtd. inicial</label>
                <input id="quantidadeInicial" inputMode="decimal" placeholder="0" className={inputClass}
                  {...register('quantidadeInicial', { validate: naoNegativo })} />
                <ErroCampo mensagem={errors.quantidadeInicial?.message} />
              </div>
            )}
          </div>

          <ErroFormulario mensagem={erroGeral} />
          <BotoesFormulario enviando={isSubmitting} textoConfirmar={insumo ? 'Salvar alterações' : 'Cadastrar insumo'} onCancelar={onFechar} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
