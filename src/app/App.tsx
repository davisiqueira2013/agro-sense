import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { alertas, usuarioLogado } from './data/mockData';
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
  // Autenticação simulada: na Fase 02 será substituída por um AuthContext
  // que chama POST /api/auth/login e guarda o token JWT.
  const [autenticado, setAutenticado] = useState(false);
  const [abaAtual, setAbaAtual] = useState<TabId>('Dashboard');

  if (!autenticado) return <LoginPage onLogin={() => setAutenticado(true)} />;

  const sair = () => {
    setAutenticado(false);
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
        abaAtual={abaAtual}
        onTrocarAba={setAbaAtual}
        usuario={usuarioLogado}
        badges={{ 'Alertas Climáticos': alertas.length }}
        onSair={sair}
      />
      <main className="flex-1 ml-64 min-h-screen bg-[#08100A] text-gray-200">
        <Header abaAtual={abaAtual} nomeUsuario={usuarioLogado.nome} temNotificacao={alertas.length > 0} />
        <div className="p-8 max-w-7xl mx-auto">{paginas[abaAtual]}</div>
      </main>
    </div>
  );
}
