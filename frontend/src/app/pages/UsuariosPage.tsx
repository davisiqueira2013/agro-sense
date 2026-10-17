import { UserPlus } from 'lucide-react';
import { Avatar } from '../components/shared/Avatar';
import { DataTable } from '../components/shared/DataTable';
import { PageHeader } from '../components/shared/PageHeader';
import { PrimaryButton } from '../components/shared/Buttons';
import { usuarios } from '../data/mockData';

export function UsuariosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Usuários"
        subtitulo="Gerenciamento de acessos e permissões"
        acoes={<PrimaryButton icone={<UserPlus size={16} />}>Novo Usuário</PrimaryButton>}
      />
      <DataTable colunas={['NOME', 'E-MAIL', 'CARGO', 'STATUS']}>
        {usuarios.map((u) => {
          const inativo = u.status === 'Inativo';
          return (
            <tr key={u.email} className="hover:bg-[#122216]/30 transition-colors">
              <td className="py-4">
                <span className="flex items-center gap-3">
                  <Avatar nome={u.nome} apagado={inativo} />
                  <span className="text-white font-semibold">{u.nome}</span>
                </span>
              </td>
              <td className="py-4 text-gray-400">{u.email}</td>
              <td className="py-4 text-gray-300">{u.cargo}</td>
              <td className="py-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold border ${
                    inativo ? 'bg-[#08100A] border-[#1A2E20] text-gray-500' : 'bg-[#122216] border-green-900/50 text-green-500'
                  }`}
                >
                  {u.status}
                </span>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
