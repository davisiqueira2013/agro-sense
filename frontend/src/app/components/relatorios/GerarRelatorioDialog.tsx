import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FilePlus } from 'lucide-react';
import { ApiError, errosDeCampo } from '../../../services/api';
import { relatoriosService } from '../../../services/relatoriosService';
import { paraInputData } from '../../lib/formatar';
import { TIPOS_RELATORIO } from '../../lib/relatorios';
import type { Relatorio, TipoRelatorio } from '../../types';
import { BotoesFormulario, ErroCampo, ErroFormulario, inputClass, labelClass } from '../shared/Formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Campos = { tipo: TipoRelatorio; inicio: string; fim: string };


type Props = { aberto: boolean; onFechar: () => void; onGerado: (relatorio: Relatorio) => void };

/** Gera um relatório em PDF no servidor (POST /api/relatorios — RN12). */
export function GerarRelatorioDialog({ aberto, onFechar, onGerado }: Props) {
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm<Campos>();
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (aberto) {
      const hoje = new Date();
      reset({ tipo: 'CUSTOS', inicio: paraInputData(new Date(hoje.getFullYear(), hoje.getMonth(), 1)), fim: paraInputData(hoje) });
      setErroGeral('');
    }
  }, [aberto, reset]);

  if (!aberto) return null;

  const tipoEscolhido = TIPOS_RELATORIO.find((t) => t.valor === watch('tipo'));

  const gerar = async (c: Campos) => {
    setErroGeral('');
    try {
      onGerado(await relatoriosService.gerar(c));
    } catch (erro) {
      if (!(erro instanceof ApiError)) return setErroGeral('Erro inesperado.');
      const campos = errosDeCampo(erro.detalhes);
      if (campos.length) campos.forEach(({ campo, mensagem }) => setError(campo as keyof Campos, { message: mensagem }));
      else setErroGeral(erro.message); // ex.: período inválido (422)
    }
  };

  return (
    <Dialog open onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <FilePlus className="text-green-500" size={20} /> Gerar relatório
          </DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            O PDF é montado no servidor com os dados do período escolhido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(gerar)} noValidate className="space-y-4">
          <div>
            <label htmlFor="tipo" className={labelClass}>Tipo *</label>
            <select id="tipo" className={`${inputClass} cursor-pointer`} {...register('tipo', { required: 'Escolha o tipo' })}>
              {TIPOS_RELATORIO.map((t) => <option key={t.valor} value={t.valor}>{t.nome}</option>)}
            </select>
            {tipoEscolhido && <p className="text-xs font-mono text-[#5C8065] mt-1">{tipoEscolhido.descricao}</p>}
            <ErroCampo mensagem={errors.tipo?.message} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inicio" className={labelClass}>Data inicial *</label>
              <input id="inicio" type="date" className={inputClass} {...register('inicio', { required: 'Informe a data inicial' })} />
              <ErroCampo mensagem={errors.inicio?.message} />
            </div>
            <div>
              <label htmlFor="fim" className={labelClass}>Data final *</label>
              <input id="fim" type="date" className={inputClass} {...register('fim', { required: 'Informe a data final' })} />
              <ErroCampo mensagem={errors.fim?.message} />
            </div>
          </div>
          <ErroFormulario mensagem={erroGeral} />
          <BotoesFormulario enviando={isSubmitting} textoConfirmar="Gerar PDF" onCancelar={onFechar} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
