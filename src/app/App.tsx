import React, { useState } from 'react';
import { 
  Leaf, LayoutGrid, Layers, Activity, BookOpen, 
  Package, CloudLightning, FileText, Users, 
  Menu, Bell, Download, AlertTriangle, DollarSign, Box, BarChart3, 
  MapPin, Thermometer, Droplets, Plus, Search, Clock, 
  Filter, FilePlus, UserPlus, CheckCircle2, AlertCircle
} from 'lucide-react';

// --- TELA DE LOGIN ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div style={{ backgroundColor: '#08100A' }} className="min-h-screen flex flex-col items-center justify-center font-sans text-gray-200">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 border border-[#1A2E20] rounded-xl bg-[#0C170F] mb-4 shadow-lg">
          <Leaf className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-wide font-mono">AgriManager</h1>
        <p className="text-[#5C8065] text-sm mt-1 font-mono">Gestão de campo inteligente</p>
      </div>

      <div style={{ backgroundColor: '#0C170F' }} className="border border-[#1A2E20] rounded-xl p-8 w-full max-w-md shadow-2xl">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-[#5C8065] mb-2 uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              defaultValue="rodrigo@agrimanager.com.br"
              style={{ backgroundColor: '#08100A' }}
              className="w-full border border-[#1A2E20] text-gray-200 text-sm rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#5C8065] mb-2 uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              defaultValue="12345678"
              style={{ backgroundColor: '#08100A' }}
              className="w-full border border-[#1A2E20] text-gray-200 text-sm rounded-lg p-3 focus:outline-none focus:border-green-500 transition-colors font-mono"
            />
          </div>
          <button 
            onClick={onLogin}
            style={{ backgroundColor: '#4CAF50' }}
            className="w-full hover:bg-[#43A047] text-white font-semibold rounded-lg p-3 mt-4 transition-colors cursor-pointer shadow-lg"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES DAS TELAS ---

const AtividadesScreen = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Atividades</h1>
        <p className="text-[#5C8065] text-sm font-mono">Gestão de operações em campo</p>
      </div>
      <div className="flex gap-3">
        <button style={{ backgroundColor: '#0C170F' }} className="flex items-center gap-2 px-4 py-2 border border-[#1A2E20] rounded-lg text-sm text-gray-300 hover:bg-[#122216] transition-colors cursor-pointer font-mono"><Filter size={16}/> Filtrar</button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow"><Plus size={16} /> Nova Atividade</button>
      </div>
    </div>
    <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1A2E20] text-xs font-mono text-[#5C8065]">
            <th className="pb-3 font-medium">STATUS</th>
            <th className="pb-3 font-medium">TIPO</th>
            <th className="pb-3 font-medium">TALHÃO</th>
            <th className="pb-3 font-medium">DATA PREVISTA</th>
            <th className="pb-3 font-medium">RESPONSÁVEL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2E20]/50 text-sm font-mono">
          {[
            { status: 'Concluído', color: 'text-green-500', tipo: 'Plantio', talhao: 'Talhão A1', data: '15/11/2026', resp: 'Carlos Mendes' },
            { status: 'Em andamento', color: 'text-yellow-500', tipo: 'Pulverização', talhao: 'Talhão C3', data: 'Hoje', resp: 'Ana Ferreira' },
            { status: 'Atrasado', color: 'text-red-500', tipo: 'Colheita', talhao: 'Talhão B2', data: '08/12/2026', resp: 'José Silva' },
            { status: 'Agendado', color: 'text-blue-500', tipo: 'Adubação', talhao: 'Talhão E5', data: '12/12/2026', resp: 'Carlos Mendes' },
          ].map((row, idx) => (
            <tr key={idx} className="hover:bg-[#122216]/30 transition-colors">
              <td className={`py-4 ${row.color} flex items-center gap-2`}><CheckCircle2 size={16}/> {row.status}</td>
              <td className="py-4 text-white font-semibold">{row.tipo}</td>
              <td className="py-4 text-gray-300">{row.talhao}</td>
              <td className="py-4 text-[#5C8065]">{row.data}</td>
              <td className="py-4 text-gray-300">{row.resp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DiarioCampoScreen = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Diário de Campo</h1>
        <p className="text-[#5C8065] text-sm font-mono">Registros agronômicos e observações</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow"><Plus size={16} /> Novo Registro</button>
    </div>
    <div className="grid gap-4">
      {[
        { data: '10 Dez 2026', autor: 'Ana Ferreira', titulo: 'Identificação de praga inicial', texto: 'Encontrado foco inicial de mosca-branca nas bordaduras do Talhão A1. Recomendada aplicação direcionada nos próximos 2 dias.', tag: 'Pragas' },
        { data: '08 Dez 2026', autor: 'Carlos Mendes', titulo: 'Condições do solo pós-chuva', texto: 'Avaliamos a umidade do solo no Talhão C3. Solo em capacidade de campo excelente para entrada de maquinário pesado.', tag: 'Solo' },
      ].map((nota, i) => (
        <div key={i} style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl shadow-lg flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-white">{nota.titulo}</h3>
            <span className="text-xs font-mono px-2 py-1 rounded bg-[#122216] border border-[#1A2E20] text-gray-300">{nota.tag}</span>
          </div>
          <p className="text-sm text-gray-400 font-mono">{nota.texto}</p>
          <div className="flex items-center gap-4 text-xs font-mono text-[#5C8065] mt-2">
            <span className="flex items-center gap-1"><Clock size={14}/> {nota.data}</span>
            <span className="flex items-center gap-1"><Users size={14}/> {nota.autor}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EstoqueScreen = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Estoque</h1>
        <p className="text-[#5C8065] text-sm font-mono">Controle de insumos e materiais</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow"><Plus size={16} /> Adicionar Insumo</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-5 rounded-xl border-l-4 border-l-green-500"><p className="text-xs font-mono text-[#5C8065] mb-1">TOTAL DE ITENS</p><p className="text-3xl font-bold text-white font-mono">128</p></div>
      <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-5 rounded-xl border-l-4 border-l-red-500"><p className="text-xs font-mono text-[#5C8065] mb-1">ABAIXO DO MÍNIMO</p><p className="text-3xl font-bold text-white font-mono">4</p></div>
      <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-5 rounded-xl border-l-4 border-l-yellow-500"><p className="text-xs font-mono text-[#5C8065] mb-1">VALOR ESTIMADO</p><p className="text-3xl font-bold text-white font-mono">R$ 345k</p></div>
    </div>
    <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1A2E20] text-xs font-mono text-[#5C8065]">
            <th className="pb-3 font-medium">INSUMO</th>
            <th className="pb-3 font-medium">CATEGORIA</th>
            <th className="pb-3 font-medium">QUANTIDADE</th>
            <th className="pb-3 font-medium">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2E20]/50 text-sm font-mono">
          {[
            { nome: 'Semente de Soja (XP-45)', cat: 'Sementes', qtd: '1.200 kg', status: 'Normal', color: 'text-green-500' },
            { nome: 'Fertilizante NPK 10-10-10', cat: 'Fertilizantes', qtd: '250 kg', status: 'Baixo', color: 'text-red-500' },
            { nome: 'Fungicida ABC', cat: 'Defensivos', qtd: '45 L', status: 'Atenção', color: 'text-yellow-500' },
            { nome: 'Óleo Diesel S10', cat: 'Combustível', qtd: '3.500 L', status: 'Normal', color: 'text-green-500' },
          ].map((row, idx) => (
            <tr key={idx} className="hover:bg-[#122216]/30 transition-colors">
              <td className="py-4 text-white font-semibold">{row.nome}</td>
              <td className="py-4 text-gray-400">{row.cat}</td>
              <td className="py-4 text-white">{row.qtd}</td>
              <td className={`py-4 ${row.color} font-bold`}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AlertasScreen = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Alertas Climáticos</h1>
        <p className="text-[#5C8065] text-sm font-mono">Monitoramento meteorológico e riscos</p>
      </div>
    </div>
    <div className="grid gap-4">
      {[
        { tipo: 'Crítico', cor: 'red', titulo: 'Risco de Geada Extrema', local: 'Talhão B2, Talhão F6', desc: 'Previsão de temperatura abaixo de 2°C para as próximas 48 horas.' },
        { tipo: 'Atenção', cor: 'yellow', titulo: 'Chuva Intensa', local: 'Toda a fazenda', desc: 'Acumulado previsto de 80mm em 24h. Risco de erosão em áreas preparadas.' },
        { tipo: 'Aviso', cor: 'blue', titulo: 'Vento Forte', local: 'Talhão A1, Talhão C3', desc: 'Rajadas acima de 40km/h. Suspender pulverizações agendadas.' },
      ].map((alerta, i) => (
        <div key={i} style={{ backgroundColor: '#0A140D' }} className={`border p-6 rounded-xl shadow-lg border-${alerta.cor}-900/50 flex gap-4`}>
          <div className={`p-3 bg-${alerta.cor}-950/40 rounded-full h-fit text-${alerta.cor}-500`}>
            {alerta.tipo === 'Crítico' ? <AlertCircle size={24}/> : <CloudLightning size={24}/>}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-white">{alerta.titulo}</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase border bg-[#08100A] text-${alerta.cor}-500 border-${alerta.cor}-900/50`}>{alerta.tipo}</span>
            </div>
            <p className="text-xs font-mono text-[#5C8065] mb-3"><MapPin size={12} className="inline mr-1"/> {alerta.local}</p>
            <p className="text-sm text-gray-300 font-mono">{alerta.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RelatoriosScreen = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Relatórios PDF</h1>
        <p className="text-[#5C8065] text-sm font-mono">Exportação de dados e histórico</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow"><FilePlus size={16} /> Gerar Relatório</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { nome: 'Fechamento de Custos Mensal', data: '01 Dez 2026', tamanho: '2.4 MB' },
        { nome: 'Produtividade por Talhão', data: '15 Nov 2026', tamanho: '4.1 MB' },
        { nome: 'Histórico de Atividades (Semestre)', data: '01 Nov 2026', tamanho: '1.8 MB' },
        { nome: 'Inventário de Estoque Atualizado', data: '30 Out 2026', tamanho: '850 KB' },
      ].map((rel, i) => (
        <div key={i} style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-5 rounded-xl shadow-lg flex justify-between items-center hover:border-[#5C8065] transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#122216] border border-[#1A2E20] rounded-lg text-green-500"><FileText size={24}/></div>
            <div>
              <h3 className="font-bold text-white">{rel.nome}</h3>
              <p className="text-xs font-mono text-[#5C8065]">Gerado em: {rel.data} • {rel.tamanho}</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#122216] rounded-lg transition-colors cursor-pointer"><Download size={20}/></button>
        </div>
      ))}
    </div>
  </div>
);

const UsuariosScreen = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Usuários</h1>
        <p className="text-[#5C8065] text-sm font-mono">Gerenciamento de acessos e permissões</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow"><UserPlus size={16} /> Novo Usuário</button>
    </div>
    <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl shadow-lg">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1A2E20] text-xs font-mono text-[#5C8065]">
            <th className="pb-3 font-medium">NOME</th>
            <th className="pb-3 font-medium">E-MAIL</th>
            <th className="pb-3 font-medium">CARGO</th>
            <th className="pb-3 font-medium">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A2E20]/50 text-sm font-mono">
          {[
            { nome: 'Rodrigo Figueiredo', email: 'rodrigo@agrimanager.com.br', cargo: 'Administrador', status: 'Ativo', sigla: 'RF' },
            { nome: 'Ana Ferreira', email: 'ana.agronoma@agrimanager.com.br', cargo: 'Engenheira Agrônoma', status: 'Ativo', sigla: 'AF' },
            { nome: 'Carlos Mendes', email: 'carlos.op@agrimanager.com.br', cargo: 'Operador de Máquinas', status: 'Ativo', sigla: 'CM' },
            { nome: 'José Silva', email: 'jose.silva@agrimanager.com.br', cargo: 'Consultor Externo', status: 'Inativo', sigla: 'JS' },
          ].map((row, idx) => (
            <tr key={idx} className="hover:bg-[#122216]/30 transition-colors">
              <td className="py-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border border-[#1A2E20] flex items-center justify-center text-xs font-bold text-gray-300 font-mono ${row.status === 'Inativo' ? 'bg-[#08100A]' : 'bg-[#122216]'}`}>{row.sigla}</div>
                <span className="text-white font-semibold">{row.nome}</span>
              </td>
              <td className="py-4 text-gray-400">{row.email}</td>
              <td className="py-4 text-gray-300">{row.cargo}</td>
              <td className="py-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${row.status === 'Ativo' ? 'bg-[#122216] border-green-900/50 text-green-500' : 'bg-[#08100A] border-[#1A2E20] text-gray-500'}`}>{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// (Omiti a TalhoesScreen daqui pra manter o código limpo, mas vou injetá-la igualzinho já havíamos feito)
const TalhoesScreen = () => {
  const talhoes = [
    { nome: 'Talhão A1', local: 'Londrina, PR', cultura: 'Soja', area: '45.2 ha', temp: '24°C', umidade: '68%', data: '09/12/2026', status: 'Ativo', statusColor: 'text-green-400 border-green-900/40' },
    { nome: 'Talhão B2', local: 'Maringá, PR', cultura: 'Milho', area: '32.8 ha', temp: '26°C', umidade: '72%', data: '03/12/2026', status: 'Em preparo', statusColor: 'text-yellow-500 border-yellow-900/40' },
    { nome: 'Talhão C3', local: 'Ponta Grossa, PR', cultura: 'Trigo', area: '28.5 ha', temp: '19°C', umidade: '85%', data: '09/12/2026', status: 'Ativo', statusColor: 'text-green-400 border-green-900/40' },
    { nome: 'Talhão D4', local: 'Cascavel, PR', cultura: 'Soja', area: '61 ha', temp: '27°C', umidade: '60%', data: '28/11/2026', status: 'Colhido', statusColor: 'text-blue-400 border-blue-900/40' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Talhões</h1>
          <p className="text-[#5C8065] text-sm font-mono">Gestão de áreas e culturas</p>
        </div>
        <div className="flex gap-3">
          <button style={{ backgroundColor: '#0C170F' }} className="px-4 py-2 border border-[#1A2E20] rounded-lg text-sm font-medium text-gray-300 hover:bg-[#122216] transition-colors cursor-pointer font-mono">Tabela</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white rounded-lg text-sm font-medium transition-colors cursor-pointer shadow"><Plus size={16} /> Novo Talhão</button>
        </div>
      </div>
      <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] rounded-xl p-3 flex items-center gap-3">
        <Search size={18} className="text-[#5C8065] ml-2" />
        <input type="text" placeholder="Buscar por nome ou cultura..." className="bg-transparent border-none text-gray-200 text-sm focus:outline-none w-full font-mono placeholder-[#5C8065]"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {talhoes.map((t, idx) => (
          <div key={idx} style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl flex flex-col justify-between shadow-lg relative group hover:border-green-500/40 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">{t.nome}</h3>
                  <div className="flex items-center gap-1 text-xs text-[#5C8065] font-mono mt-0.5"><MapPin size={12} /> {t.local}</div>
                </div>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${t.statusColor} bg-[#08100A]`}>{t.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                  <span className="text-[10px] font-mono text-[#5C8065] uppercase block mb-1">Cultura</span>
                  <span className="text-sm font-bold text-white font-mono">{t.cultura}</span>
                </div>
                <div className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                  <span className="text-[10px] font-mono text-[#5C8065] uppercase block mb-1">Área</span>
                  <span className="text-sm font-bold text-white font-mono">{t.area}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1A2E20] text-xs text-[#5C8065] font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Thermometer size={14} /> {t.temp}</span>
                <span className="flex items-center gap-1"><Droplets size={14} /> {t.umidade}</span>
              </div>
              <span className="flex items-center gap-1"><Clock size={12} /> {t.data}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SIDEBAR ---
const Sidebar = ({ currentTab, setCurrentTab }: { currentTab: string, setCurrentTab: (tab: string) => void }) => {
  const menuItems = [
    { id: 'Dashboard', icon: <LayoutGrid size={20} />, label: 'Dashboard' },
    { id: 'Talhões', icon: <Layers size={20} />, label: 'Talhões' },
    { id: 'Atividades', icon: <Activity size={20} />, label: 'Atividades' },
    { id: 'Diário de Campo', icon: <BookOpen size={20} />, label: 'Diário de Campo' },
    { id: 'Estoque', icon: <Package size={20} />, label: 'Estoque' },
    { id: 'Alertas Climáticos', icon: <CloudLightning size={20} />, label: 'Alertas Climáticos', badge: 3 },
    { id: 'Relatórios PDF', icon: <FileText size={20} />, label: 'Relatórios PDF' },
    { id: 'Usuários', icon: <Users size={20} />, label: 'Usuários' },
  ];

  return (
    <aside style={{ backgroundColor: '#0A120C' }} className="w-64 border-r border-[#1A2E20] flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="flex items-center gap-3 p-6 border-b border-[#1A2E20]">
        <div className="p-2 border border-[#1A2E20] rounded-lg bg-[#0C170F]">
          <Leaf className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight font-mono">AgriManager</h2>
          <p className="text-[#5C8065] text-xs font-mono">Fazenda Figueiredo</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{ backgroundColor: isActive ? '#122216' : 'transparent', borderColor: isActive ? '#1A3320' : 'transparent' }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors cursor-pointer ${isActive ? 'text-green-400 font-medium' : 'text-gray-400 hover:bg-[#122216]/40 hover:text-gray-200 border-transparent'}`}
            >
              <div className="flex items-center gap-3">{item.icon}<span className="text-sm">{item.label}</span></div>
              {item.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-[#1A2E20] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#1A2E20] bg-[#122216] flex items-center justify-center text-xs font-bold text-gray-300 font-mono">RF</div>
          <div><p className="text-sm font-medium text-white leading-tight">Rodrigo Figueiredo</p><p className="text-xs text-[#5C8065] font-mono">Admin</p></div>
        </div>
      </div>
    </aside>
  );
};

// --- ROTEADOR PRINCIPAL ---
const MainContent = ({ currentTab }: { currentTab: string }) => {
  return (
    <main style={{ backgroundColor: '#08100A' }} className="flex-1 ml-64 min-h-screen text-gray-200">
      <header className="h-16 border-b border-[#1A2E20] flex items-center justify-between px-8 bg-[#08100A]/50 backdrop-blur sticky top-0 z-10">
        <div className="text-sm font-mono text-[#5C8065]">
          Módulo ativo: <span className="text-white font-bold">{currentTab}</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-gray-400 hover:text-white transition-colors relative cursor-pointer">
            <Bell size={20} /><span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full border border-[#1A2E20] bg-[#122216] flex items-center justify-center text-xs font-bold text-gray-300 font-mono">RF</div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        
        {/* Renderiza a tela baseada no estado currentTab */}
        {currentTab === 'Dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Dashboard</h1>
                <p className="text-[#5C8065] text-sm font-mono">Visão geral da fazenda — 10 de dezembro de 2026</p>
              </div>
              <button style={{ backgroundColor: '#0C170F' }} className="flex items-center gap-2 px-4 py-2 border border-[#1A2E20] rounded-lg text-sm font-medium hover:bg-[#122216] transition-colors text-white cursor-pointer shadow">
                <Download size={16} /> Exportar PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { titulo: 'Total de Talhões', num: '6', sub: '3 ativos agora', icon: <Layers size={18} />, color: 'green' },
                { titulo: 'Alertas Ativos', num: '3', sub: '3 alta, 0 crítica', icon: <AlertTriangle size={18} />, color: 'red' },
                { titulo: 'Gasto do Mês', num: 'R$ 16.400', sub: 'Dezembro/2026', icon: <DollarSign size={18} />, color: 'yellow' },
                { titulo: 'Insumos Críticos', num: '4', sub: 'abaixo do mínimo', icon: <Box size={18} />, color: 'red' },
              ].map((card, i) => (
                <div key={i} style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl flex flex-col justify-between h-40 shadow-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-[#5C8065] tracking-widest uppercase">{card.titulo}</span>
                    <div className={`p-2 bg-${card.color}-950/40 rounded-lg text-${card.color}-500 border border-${card.color}-900/30`}>{card.icon}</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-1 font-mono">{card.num}</div>
                    <div className={`text-sm text-${card.color}-500 font-mono`}>{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div style={{ backgroundColor: '#0A140D' }} className="lg:col-span-2 border border-[#1A2E20] p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">Custos por Categoria</h2>
                    <p className="text-sm text-[#5C8065] font-mono">Jul — Dez 2026</p>
                  </div>
                  <BarChart3 className="text-[#5C8065]" size={20} />
                </div>
                <div className="flex items-end h-48 gap-4 border-b border-l border-[#1A2E20] pb-2 pl-2 relative ml-8">
                   <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#5C8065] font-mono py-2">
                      <span>60k</span><span>45k</span><span>30k</span><span>15k</span><span>0k</span>
                   </div>
                   {['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes, i) => (
                      <div key={mes} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                         <div className="w-4 bg-[#D97736] rounded-t-sm transition-all duration-300 group-hover:bg-[#f39556]" style={{ height: `${[20, 25, 18, 22, 30, 15][i]}%` }}></div>
                         <span className="text-xs text-[#5C8065] font-mono mt-2">{mes}</span>
                      </div>
                   ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#0A140D' }} className="border border-[#1A2E20] p-6 rounded-xl shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white">Alertas Rápidos</h2>
                    <a href="#" className="text-xs font-mono text-[#5C8065] hover:text-green-500">Ver todos</a>
                  </div>
                  <div className="space-y-3">
                    {['Chuva Intensa', 'Geada', 'Vento Forte'].map((alerta, i) => (
                      <div key={i} className="p-3 bg-[#08100A] border border-[#1A2E20] rounded-lg">
                        <div className={`flex items-center gap-2 ${i === 0 ? 'text-red-400' : 'text-yellow-500'} text-xs font-mono mb-1`}><AlertTriangle size={14} /> {alerta}</div>
                        <p className="text-xs text-[#5C8065] font-mono">Talhão {['C3', 'B2', 'A1'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'Talhões' && <TalhoesScreen />}
        {currentTab === 'Atividades' && <AtividadesScreen />}
        {currentTab === 'Diário de Campo' && <DiarioCampoScreen />}
        {currentTab === 'Estoque' && <EstoqueScreen />}
        {currentTab === 'Alertas Climáticos' && <AlertasScreen />}
        {currentTab === 'Relatórios PDF' && <RelatoriosScreen />}
        {currentTab === 'Usuários' && <UsuariosScreen />}

      </div>
    </main>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('Dashboard');

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div style={{ backgroundColor: '#08100A' }} className="flex min-h-screen text-gray-200">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <MainContent currentTab={currentTab} />
    </div>
  );
}