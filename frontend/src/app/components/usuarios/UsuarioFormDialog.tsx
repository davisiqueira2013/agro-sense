import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ApiError, errosDeCampo } from '../../../services/api';
import { usuariosService } from '../../../services/usuariosService';
import { nomeDoPerfil } from '../../navigation';
import type { Perfil, Usuario, UsuarioEntrada } from '../../types';
import { BotoesFormulario, ErroCampo, ErroFormulario, inputClass, labelClass } from '../shared/Formulario';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

type Campos = { nome: string; email: string; cargo: string; perfil: Perfil; senha: string };

const vazio: Campos = { nome: '', email: '', cargo: '', perfil: 'TECNICO', senha: '' };

const DESCRICAO_PERFIL: Record<Perfil, string> = {
  ADMIN: 'Acesso total, inclusive usuários e exclusões',
  TECNICO: 'Cadastra e edita dados de campo, sem excluir',
  LEITOR: 'Somente consulta',
};

type Props = {
  aberto: boolean;
  usuario?: Usuario;
  /** O próprio administrador logado: o perfil fica travado (RN11). */
  ehVoce: boolean;
  onFechar: () => void;
  onSalvo: (usuario: Usuario, novo: boolean) => void;
};

export function UsuarioFormDialog({ aberto, usuario, ehVoce, onFechar, onSalvo }: Props) {
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm<Campos>({ defaultValues: vazio });
  const [erroGeral, setErroGeral] = useState('');

  useEffect(() => {
    if (aberto) {
      reset(usuario ? { nome: usuario.nome, email: usuario.email, cargo: usuario.cargo, perfil: usuario.perfil, senha: '' } : vazio);
      setErroGeral('');
    }
  }, [aberto, usuario, reset]);

  const perfil = watch('perfil');

  const salvar = async (c: Campos) => {
    setErroGeral('');
    const dados: UsuarioEntrada = {
      nome: c.nome.trim(),
      email: c.email.trim(),
      cargo: c.cargo.trim(),
      perfil: c.perfil,
      ...(c.senha && { senha: c.senha }),
    };
    try {
      const salvo = usuario ? await usuariosService.atualizar(usuario.id, dados) : await usuariosService.criar(dados);
      onSalvo(salvo, !usuario);
    } catch (erro) {
      if (!(erro instanceof ApiError)) return setErroGeral('Erro inesperado ao salvar.');
      const campos = errosDeCampo(erro.detalhes);
      if (campos.length) campos.forEach(({ campo, mensagem }) => setError(campo as keyof Campos, { message: mensagem }));
      else if (erro.codigo === 'EMAIL_DUPLICADO') setError('email', { message: erro.message });
      else setErroGeral(erro.message);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(abrir) => !abrir && !isSubmitting && onFechar()}>
      <DialogContent className="bg-[#0C170F] border-[#1A2E20] text-gray-200 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{usuario ? `Editar ${usuario.nome}` : 'Novo usuário'}</DialogTitle>
          <DialogDescription className="text-[#5C8065] font-mono text-xs">
            {usuario ? 'Deixe a senha em branco para mantê-la.' : 'O usuário entra com o e-mail e a senha definidos aqui.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(salvar)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="nome" className={labelClass}>Nome *</label>
              <input id="nome" placeholder="Marina Costa" className={inputClass}
                {...register('nome', { required: 'Informe o nome', minLength: { value: 3, message: 'Mínimo de 3 caracteres' } })} />
              <ErroCampo mensagem={errors.nome?.message} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="cargo" className={labelClass}>Cargo *</label>
              <input id="cargo" placeholder="Técnica Agrícola" className={inputClass} {...register('cargo', { required: 'Informe o cargo' })} />
              <ErroCampo mensagem={errors.cargo?.message} />
            </div>
            <div className="col-span-2">
              <label htmlFor="email" className={labelClass}>E-mail *</label>
              <input id="email" type="email" autoComplete="off" placeholder="nome@agrosense.com.br" className={inputClass}
                {...register('email', { required: 'Informe o e-mail', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'E-mail inválido' } })} />
              <ErroCampo mensagem={errors.email?.message} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="perfil" className={labelClass}>Perfil *</label>
              <select id="perfil" className={inputClass} disabled={ehVoce} {...register('perfil')}>
                {(Object.keys(nomeDoPerfil) as Perfil[]).map((p) => <option key={p} value={p}>{nomeDoPerfil[p]}</option>)}
              </select>
              <p className="text-[11px] font-mono text-[#5C8065] mt-1">
                {ehVoce ? 'Você não pode alterar o seu próprio perfil.' : DESCRICAO_PERFIL[perfil]}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="senha" className={labelClass}>{usuario ? 'Nova senha' : 'Senha *'}</label>
              <input id="senha" type="password" autoComplete="new-password" placeholder={usuario ? 'manter a atual' : 'mínimo 8 caracteres'} className={inputClass}
                {...register('senha', {
                  required: usuario ? false : 'Informe a senha',
                  validate: (v) => !v || v.length >= 8 || 'A senha deve ter no mínimo 8 caracteres',
                })} />
              <ErroCampo mensagem={errors.senha?.message} />
            </div>
          </div>

          <ErroFormulario mensagem={erroGeral} />
          <BotoesFormulario enviando={isSubmitting} textoConfirmar={usuario ? 'Salvar alterações' : 'Cadastrar usuário'} onCancelar={onFechar} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
