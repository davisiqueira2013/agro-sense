import { useState } from 'react';
import { Leaf, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NOME_FAZENDA, alertas } from './data/mockData';
import { menuDoPerfil, nomeDoPerfil } from './navigation';
import { AlertasPage } from './pages/AlertasPage';
import { AtividadesPage } from './pages/AtividadesPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiarioCampoPage } from './pages/DiarioCampoPage';
import { EstoquePage } from './pages/EstoquePage';
import { LoginPage } from './pages/LoginPage';
import { RelatoriosPage } from './pages/RelatoriosPage';
import { TalhoesPage } from './pages/TalhoesPage';
import { UsuariosPage } from './pages/UsuariosPage';
import type { TabId } from './types';

export default function App() {
  const { usuario, carregando, logout } = useAuth();
  const [abaAtual, setAbaAtual] = useState<TabId>('Dashboard');

  // Conferindo o token salvo com a API (GET /api/auth/me).
  if (carregando) {
    return (
      <div className="min-h-screen bg-[#08100A] flex flex-col items-center justify-center gap-4 text-[#5C8065] font-mono text-sm">
        <Leaf className="w-8 h-8 text-green-500" />
        <span className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carregando...
        </span>
      </div>
    );
  }

  if (!usuario) return <LoginPage />;

  // RN02 — o menu mostra só o que o perfil pode acessar.
  const itens = menuDoPerfil(usuario.perfil);
  const aba = itens.some((item) => item.id === abaAtual) ? abaAtual : 'Dashboard';

  const sair = () => {
    logout();
    setAbaAtual('Dashboard');
  };

  const paginas: Record<TabId, JSX.Element> = {
    Dashboard: <DashboardPage onVerAlertas={() => setAbaAtual('Alertas Climáticos')} />,
    Talhões: <TalhoesPage />,
    Atividades: <AtividadesPage />,
    'Diário de Campo': <DiarioCampoPage />,
    Estoque: <EstoquePage />,
    'Alertas Climáticos': <AlertasPage />,
    'Relatórios PDF': <RelatoriosPage />,
    Usuários: <UsuariosPage />,
  };

  return (
    <div className="flex min-h-screen bg-[#08100A] text-gray-200">
      <Sidebar
        abaAtual={aba}
        itens={itens}
        onTrocarAba={setAbaAtual}
        usuario={{ nome: usuario.nome, perfil: nomeDoPerfil[usuario.perfil], fazenda: NOME_FAZENDA }}
        badges={{ 'Alertas Climáticos': alertas.length }}
        onSair={sair}
      />
      <main className="flex-1 ml-64 min-h-screen bg-[#08100A] text-gray-200">
        <Header abaAtual={aba} nomeUsuario={usuario.nome} temNotificacao={alertas.length > 0} />
        <div className="p-8 max-w-7xl mx-auto">{paginas[aba]}</div>
      </main>
    </div>
  );
}
