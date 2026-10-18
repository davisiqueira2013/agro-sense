import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError, errosDeCampo } from '../../../services/api';
import { alertasService } from '../../../services/alertasService';
import { paraInputData } from '../../lib/formatar';
import { nomeDaSeveridade, nomeDoTipoAlerta } from '../../lib/tones';
import type { AlertaClimatico, Severidade, Talhao, TipoAlerta } from '../../types';
import { BotoesFormulario, ErroCampo, ErroFormulario, inputClass, labelClass } from '../shared/Formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

/** Severidade sugerida para cada tipo (a mesma que a API usa como padrão). */
const SEVERIDADE_PADRAO: Record<TipoAlerta, Severidade> = { GEADA: 'CRITICO', CHUVA_INTENSA: 'ATENCAO', VENTO_FORTE: 'AVISO' };

type Campos = { tipo: TipoAlerta | ''; severidade: Severidade | ''; descricao: string; inicio: string; fim: string };

type Props = {
  aberto: boolean;
  talhoes: Pick<Talhao, 'id' | 'nome'>[];
  onFechar: () => void;
  onCriado: (alerta: AlertaClimatico) => void;
};

/** Registro manual de alerta pela equipe (POST /api/alertas). */
export function NovoAlertaDialog({ aberto, talhoes, onFechar, onCriado }: Props) {
  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<Campos>();
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [erroTalhoes, setErroTalhoes] = useState('');
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (aberto) {
      const hoje = paraInputData(new Date());
      reset({ tipo: '', severidade: '', descricao: '', inicio: hoje, fim: hoje });
      setSelecionados([]);
      setErroTalhoes('');
      setErroGeral('');
    }
  }, [aberto, reset]);

  const tipo = watch('tipo');
  // Ao escolher o tipo, sugere a severidade padrão.
  useEffect(() => {
    if (tipo) setValue('severidade', SEVERIDADE_PADRAO[tipo]);
  }, [tipo, setValue]);

  const alternar = (id: number) => setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  const todos = talhoes.length > 0 && selecionados.length === talhoes.length;

  const salvar = async (c: Campos) => {
    setErroGeral('');
    if (selecionados.length === 0) {
      setErroTalhoes('Selecione ao menos um talhão');
      return;
    }
    try {
      const alerta = await alertasService.criar({
        tipo: c.tipo as TipoAlerta,
        severidade: (c.severidade || undefined) as Severidade | undefined,
        descricao: c.descricao.trim(),
        talhaoIds: selecionados,
        inicio: c.inicio,
        ...(c.fim && { fim: c.fim }),
      });
      onCriado(alerta);
    } catch (erro) {
      if (!(erro instanceof ApiError)) return setErroGeral('Erro inesperado.');
      const campos = errosDeCampo(erro.detalhes);
      if (campos.length) campos.forEach(({ campo, mensagem }) => (campo === 'talhaoIds' ? setErroTalhoes(mensagem) : setError(campo as keyof Campos, { message: mensagem })));
      else setErroGeral(erro.message);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Novo alerta</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            Registre um risco observado pela equipe. Alertas de vento forte bloqueiam pulverizações (RN05).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(salvar)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipo" className={labelClass}>Tipo *</label>
              <select id="tipo" className={inputClass} {...register('tipo', { required: 'Selecione o tipo' })}>
                <option value="">Selecione...</option>
                {(Object.keys(nomeDoTipoAlerta) as TipoAlerta[]).map((t) => <option key={t} value={t}>{nomeDoTipoAlerta[t]}</option>)}
              </select>
              <ErroCampo mensagem={errors.tipo?.message} />
            </div>
            <div>
              <label htmlFor="severidade" className={labelClass}>Severidade</label>
              <select id="severidade" className={inputClass} {...register('severidade')}>
                <option value="">Padrão do tipo</option>
                {(Object.keys(nomeDaSeveridade) as Severidade[]).map((s) => <option key={s} value={s}>{nomeDaSeveridade[s]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="inicio" className={labelClass}>Início *</label>
              <input id="inicio" type="date" className={inputClass} {...register('inicio', { required: 'Informe o início' })} />
              <ErroCampo mensagem={errors.inicio?.message} />
            </div>
            <div>
              <label htmlFor="fim" className={labelClass}>Fim</label>
              <input id="fim" type="date" className={inputClass} {...register('fim')} />
              <ErroCampo mensagem={errors.fim?.message} />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className={labelClass + ' mb-0'}>Talhões afetados *</span>
                <button type="button" onClick={() => setSelecionados(todos ? [] : talhoes.map((t) => t.id))}
                  className="text-xs font-mono text-[#5C8065] hover:text-green-500 cursor-pointer">
                  {todos ? 'Desmarcar todos' : 'Toda a fazenda'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {talhoes.map((t) => {
                  const marcado = selecionados.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => alternar(t.id)} aria-pressed={marcado}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition-colors ${
                        marcado ? 'bg-green-950/40 border-green-700 text-green-400' : 'bg-[#08100A] border-[#1A2E20] text-gray-400 hover:border-[#5C8065]'
                      }`}>
                      {t.nome}
                    </button>
                  );
                })}
              </div>
              <ErroCampo mensagem={erroTalhoes} />
            </div>
            <div className="col-span-2">
              <label htmlFor="descricao" className={labelClass}>Descrição *</label>
              <textarea id="descricao" rows={3} placeholder="Ex.: rajadas fortes observadas no fim da tarde" className={`${inputClass} resize-none`}
                {...register('descricao', { required: 'Descreva o alerta', minLength: { value: 5, message: 'Mínimo de 5 caracteres' } })} />
              <ErroCampo mensagem={errors.descricao?.message} />
            </div>
          </div>

          <ErroFormulario mensagem={erroGeral} />
          <BotoesFormulario enviando={isSubmitting} textoConfirmar="Registrar alerta" onCancelar={onFechar} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
