import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Power, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../services/api';
import { usuariosService } from '../../services/usuariosService';
import { Avatar } from '../components/shared/Avatar';
import { ConfirmarExclusao } from '../components/shared/ConfirmarExclusao';
import { DataTable } from '../components/shared/DataTable';
import { ErroCarregamento } from '../components/shared/Estados';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { UsuarioFormDialog } from '../components/usuarios/UsuarioFormDialog';
import { nomeDoPerfil } from '../navigation';
import type { Perfil, Usuario } from '../types';

const corDoPerfil: Record<Perfil, string> = {
  ADMIN: 'text-green-400 border-green-900/50',
  TECNICO: 'text-blue-400 border-blue-900/40',
  LEITOR: 'text-gray-400 border-[#1A2E20]',
};

export function UsuariosPage() {
  const { usuario: logado } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [formulario, setFormulario] = useState<{ aberto: boolean; usuario?: Usuario }>({ aberto: false });
  const [paraDesativar, setParaDesativar] = useState<Usuario | null>(null);
  const [processando, setProcessando] = useState<number | null>(null);

  // GET /api/usuarios (somente ADMIN)
  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setUsuarios(await usuariosService.listar());
    } catch (falha) {
      setErro(falha instanceof ApiError ? falha.message : 'Erro inesperado');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // PATCH /api/usuarios/:id/status — RN11
  const alterarStatus = async (u: Usuario, ativo: boolean) => {
    setProcessando(u.id);
    try {
      await usuariosService.alterarStatus(u.id, ativo);
      toast.success(ativo ? `${u.nome} reativado` : `${u.nome} desativado`, {
        description: ativo ? undefined : 'O acesso foi bloqueado imediatamente.',
      });
      await carregar();
    } catch (falha) {
      toast.error(falha instanceof ApiError ? falha.message : 'Não foi possível alterar o status');
    } finally {
      setProcessando(null);
      setParaDesativar(null);
    }
  };

  const aoSalvar = (u: Usuario, novo: boolean) => {
    setFormulario({ aberto: false });
    toast.success(novo ? `${u.nome} cadastrado` : `${u.nome} atualizado`);
    carregar();
  };

  const ativos = usuarios.filter((u) => u.ativo).length;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Usuários"
        subtitulo={`Gerenciamento de acessos e permissões${carregando ? '' : ` — ${ativos} ativo(s) de ${usuarios.length}`}`}
        acoes={<PrimaryButton icone={<UserPlus size={16} />} onClick={() => setFormulario({ aberto: true })}>Novo Usuário</PrimaryButton>}
      />

      {erro ? (
        <ErroCarregamento mensagem={erro} onTentarNovamente={carregar} />
      ) : (
        <div className={carregando ? 'opacity-60' : ''}>
          <DataTable colunas={['NOME', 'E-MAIL', 'CARGO', 'PERFIL', 'STATUS', 'AÇÕES']}>
            {usuarios.map((u) => {
              const ehVoce = u.id === logado!.id;
              return (
                <tr key={u.id} className="hover:bg-[#122216]/30 transition-colors">
                  <td className="py-3 pr-3">
                    <span className="flex items-center gap-3">
                      <Avatar nome={u.nome} apagado={!u.ativo} />
                      <span className={u.ativo ? 'text-white font-semibold' : 'text-gray-500 font-semibold'}>
                        {u.nome}{ehVoce && <span className="text-[#5C8065] font-normal"> (você)</span>}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-gray-400">{u.email}</td>
                  <td className="py-3 pr-3 text-gray-300">{u.cargo}</td>
                  <td className="py-3 pr-3">
                    <span className={`px-2 py-1 rounded text-xs border bg-[#08100A] ${corDoPerfil[u.perfil]}`}>{nomeDoPerfil[u.perfil]}</span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${u.ativo ? 'bg-[#122216] border-green-900/50 text-green-500' : 'bg-[#08100A] border-[#1A2E20] text-gray-500'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setFormulario({ aberto: true, usuario: u })} title="Editar" aria-label={`Editar ${u.nome}`}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-[#122216] rounded-md cursor-pointer">
                        <Pencil size={14} />
                      </button>
                      {!ehVoce && (
                        <button type="button" disabled={processando === u.id}
                          onClick={() => (u.ativo ? setParaDesativar(u) : alterarStatus(u, true))}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono border border-transparent cursor-pointer disabled:opacity-50 ${
                            u.ativo ? 'text-red-400 hover:border-red-900/60 hover:bg-red-950/30' : 'text-green-500 hover:border-green-900/60 hover:bg-green-950/30'
                          }`}>
                          <Power size={13} /> {u.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      )}

      <UsuarioFormDialog
        aberto={formulario.aberto}
        usuario={formulario.usuario}
        ehVoce={formulario.usuario?.id === logado!.id}
        onFechar={() => setFormulario({ aberto: false })}
        onSalvo={aoSalvar}
      />
      <ConfirmarExclusao
        aberto={!!paraDesativar}
        titulo={`Desativar ${paraDesativar?.nome ?? ''}?`}
        descricao="O usuário perde o acesso imediatamente, inclusive se estiver logado agora. O histórico de registros é mantido e a conta pode ser reativada."
        textoConfirmar="Desativar"
        onCancelar={() => setParaDesativar(null)}
        onConfirmar={() => alterarStatus(paraDesativar!, false)}
      />
    </div>
  );
}
