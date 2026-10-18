import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError, errosDeCampo } from '../../../services/api';
import { diarioService } from '../../../services/diarioService';
import { paraInputData } from '../../lib/formatar';
import { nomeDaCategoriaRegistro } from '../../lib/tones';
import type { CategoriaRegistro, RegistroDiario, Talhao } from '../../types';
import { BotoesFormulario, ErroCampo, ErroFormulario, inputClass, labelClass } from '../shared/Formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Campos = { titulo: string; categoria: CategoriaRegistro; talhaoId: string; data: string; texto: string };

const vazio = (): Campos => ({ titulo: '', categoria: 'GERAL', talhaoId: '', data: paraInputData(new Date()), texto: '' });

const doRegistro = (r: RegistroDiario): Campos => ({
  titulo: r.titulo,
  categoria: r.categoria,
  talhaoId: r.talhao ? String(r.talhao.id) : '',
  data: paraInputData(r.data),
  texto: r.texto,
});

type Props = {
  aberto: boolean;
  registro?: RegistroDiario;
  talhoes: Pick<Talhao, 'id' | 'nome'>[];
  onFechar: () => void;
  onSalvo: (registro: RegistroDiario, novo: boolean) => void;
};

export function RegistroFormDialog({ aberto, registro, talhoes, onFechar, onSalvo }: Props) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<Campos>({ defaultValues: vazio() });
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (aberto) {
      reset(registro ? doRegistro(registro) : vazio());
      setErroGeral('');
    }
  }, [aberto, registro, reset]);

  const salvar = async (c: Campos) => {
    setErroGeral('');
    const dados = {
      titulo: c.titulo.trim(),
      texto: c.texto.trim(),
      categoria: c.categoria,
      data: c.data,
      // Na edição, "nenhum talhão" precisa ser enviado como null para remover o vínculo.
      talhaoId: c.talhaoId ? Number(c.talhaoId) : registro ? null : undefined,
    };
    try {
      const salvo = registro ? await diarioService.atualizar(registro.id, dados) : await diarioService.criar(dados);
      onSalvo(salvo, !registro);
    } catch (erro) {
      if (!(erro instanceof ApiError)) return setErroGeral('Erro inesperado ao salvar.');
      const campos = errosDeCampo(erro.detalhes);
      if (campos.length) campos.forEach(({ campo, mensagem }) => setError(campo as keyof Campos, { message: mensagem }));
      else setErroGeral(erro.message); // ex.: RN10 — 403 se não for o autor
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{registro ? 'Editar registro' : 'Novo registro'}</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            {registro ? `Registro de ${registro.autor.nome}.` : 'O registro fica assinado com o seu nome (RN10).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(salvar)} noValidate className="space-y-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-6">
              <label htmlFor="titulo" className={labelClass}>Título *</label>
              <input id="titulo" placeholder="Ex.: Identificação de praga inicial" className={inputClass}
                {...register('titulo', { required: 'Informe o título', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } })} />
              <ErroCampo mensagem={errors.titulo?.message} />
            </div>
            <div className="col-span-2">
              <label htmlFor="categoria" className={labelClass}>Categoria</label>
              <select id="categoria" className={inputClass} {...register('categoria')}>
                {(Object.keys(nomeDaCategoriaRegistro) as CategoriaRegistro[]).map((c) => (
                  <option key={c} value={c}>{nomeDaCategoriaRegistro[c]}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="talhaoId" className={labelClass}>Talhão</label>
              <select id="talhaoId" className={inputClass} {...register('talhaoId')}>
                <option value="">Nenhum (geral)</option>
                {talhoes.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="data" className={labelClass}>Data</label>
              <input id="data" type="date" className={inputClass} {...register('data')} />
              <ErroCampo mensagem={errors.data?.message} />
            </div>
            <div className="col-span-6">
              <label htmlFor="texto" className={labelClass}>Observação *</label>
              <textarea id="texto" rows={5} placeholder="Descreva o que foi observado em campo..." className={`${inputClass} resize-none`}
                {...register('texto', { required: 'Escreva a observação', minLength: { value: 5, message: 'Mínimo de 5 caracteres' } })} />
              <ErroCampo mensagem={errors.texto?.message} />
            </div>
          </div>

          <ErroFormulario mensagem={erroGeral} />
          <BotoesFormulario enviando={isSubmitting} textoConfirmar={registro ? 'Salvar alterações' : 'Salvar registro'} onCancelar={onFechar} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
