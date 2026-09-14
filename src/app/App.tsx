import { useState } from "react"
import {
  LayoutDashboard, Layers, Activity, BookOpen, Package,
  CloudLightning, FileText, Users, LogOut, Plus, Search,
  Download, AlertTriangle, CheckCircle, Thermometer,
  Droplets, Wind, Sun, CloudRain, Menu, X, MapPin,
  DollarSign, Bell, Calendar, ChevronRight, Cloud,
  TrendingUp, Eye, User, Edit, Trash2, Filter,
  Leaf, BarChart2, Clock, ChevronDown
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts"

// ── Types ─────────────────────────────────────────────────────────────────────
type Page =
  | "login" | "dashboard" | "talhoes" | "cadastro-talhao"
  | "detalhes-talhao" | "clima-talhao" | "atividades"
  | "nova-atividade" | "diario-campo" | "estoque"
  | "alertas" | "relatorios" | "usuarios"

interface NavProps {
  navigate: (page: Page, talhaoId?: number) => void
  selectedTalhaoId: number
}

// ── Mock Data ──────────────────────────────────────────────────────────────────
const mockTalhoes = [
  { id: 1, nome: "Talhão A1", cultura: "Soja", area: 45.2, status: "Ativo" as const, cidade: "Londrina, PR", temp: 24, umidade: 68, ultimaAtividade: "09/12/2025" },
  { id: 2, nome: "Talhão B2", cultura: "Milho", area: 32.8, status: "Em preparo" as const, cidade: "Maringá, PR", temp: 26, umidade: 72, ultimaAtividade: "03/12/2025" },
  { id: 3, nome: "Talhão C3", cultura: "Trigo", area: 28.5, status: "Ativo" as const, cidade: "Ponta Grossa, PR", temp: 19, umidade: 85, ultimaAtividade: "09/12/2025" },
  { id: 4, nome: "Talhão D4", cultura: "Soja", area: 61.0, status: "Colhido" as const, cidade: "Cascavel, PR", temp: 27, umidade: 60, ultimaAtividade: "28/11/2025" },
  { id: 5, nome: "Talhão E5", cultura: "Milho", area: 19.3, status: "Ativo" as const, cidade: "Londrina, PR", temp: 24, umidade: 70, ultimaAtividade: "07/12/2025" },
  { id: 6, nome: "Talhão F6", cultura: "Feijão", area: 14.7, status: "Inativo" as const, cidade: "Apucarana, PR", temp: 23, umidade: 63, ultimaAtividade: "15/10/2025" },
]

const mockAtividades = [
  { id: 1, talhaoId: 1, talhao: "Talhão A1", tipo: "Plantio", data: "15/11/2025", descricao: "Plantio de soja safra 25/26 — Brasmax Elite, 270mil sem/ha", custo: 12500, responsavel: "Carlos Mendes" },
  { id: 2, talhaoId: 2, talhao: "Talhão B2", tipo: "Calagem", data: "20/11/2025", descricao: "Aplicação de 3 t/ha calcário dolomítico — PRNT 90%", custo: 4200, responsavel: "Ana Ferreira" },
  { id: 3, talhaoId: 3, talhao: "Talhão C3", tipo: "Pulverização", data: "01/12/2025", descricao: "Controle de ferrugem — Trifloxistrobina + Protioconazol", custo: 3800, responsavel: "Carlos Mendes" },
  { id: 4, talhaoId: 1, talhao: "Talhão A1", tipo: "Adubação", data: "05/12/2025", descricao: "Cobertura com NPK 05-20-20, 200 kg/ha", custo: 8600, responsavel: "José Silva" },
  { id: 5, talhaoId: 4, talhao: "Talhão D4", tipo: "Colheita", data: "28/11/2025", descricao: "Colheita mecanizada — produtividade 55,2 sc/ha", custo: 9100, responsavel: "Marcos Oliveira" },
  { id: 6, talhaoId: 5, talhao: "Talhão E5", tipo: "Irrigação", data: "07/12/2025", descricao: "Aspersão 25mm — umidade solo < 60% na camada 0–20cm", custo: 1200, responsavel: "Ana Ferreira" },
  { id: 7, talhaoId: 2, talhao: "Talhão B2", tipo: "Preparo", data: "03/12/2025", descricao: "Grade aradora + niveladora para semeadura de milho verão", custo: 2800, responsavel: "José Silva" },
]

const mockInsumos = [
  { id: 1, nome: "Glifosato 480 SL", categoria: "Defensivo", quantidade: 80, minimo: 100, unidade: "L", custo: 18.5 },
  { id: 2, nome: "NPK 05-20-20", categoria: "Fertilizante", quantidade: 4200, minimo: 1000, unidade: "kg", custo: 2.8 },
  { id: 3, nome: "Semente Soja Brasmax Elite", categoria: "Semente", quantidade: 850, minimo: 500, unidade: "kg", custo: 12.4 },
  { id: 4, nome: "Trifloxistrobina 150 g/L", categoria: "Defensivo", quantidade: 45, minimo: 50, unidade: "L", custo: 89 },
  { id: 5, nome: "Ureia 45%", categoria: "Fertilizante", quantidade: 6800, minimo: 2000, unidade: "kg", custo: 3.2 },
  { id: 6, nome: "Calcário Dolomítico", categoria: "Corretivo", quantidade: 12, minimo: 20, unidade: "t", custo: 180 },
  { id: 7, nome: "Óleo Mineral Agrícola", categoria: "Adjuvante", quantidade: 120, minimo: 50, unidade: "L", custo: 14 },
  { id: 8, nome: "Semente Milho DKB 390", categoria: "Semente", quantidade: 180, minimo: 300, unidade: "kg", custo: 22 },
]

const mockAlertas = [
  { id: 1, tipo: "Chuva Intensa", talhao: "Talhão C3", mensagem: "Previsão de 48 mm nas próximas 24h. Risco de encharcamento em baixadas.", data: "10/12/2025", severidade: "alta" as const, resolvido: false },
  { id: 2, tipo: "Geada", talhao: "Talhão B2", mensagem: "Temperatura mínima de −2 °C prevista para amanhã de madrugada.", data: "10/12/2025", severidade: "alta" as const, resolvido: false },
  { id: 3, tipo: "Vento Forte", talhao: "Talhão A1", mensagem: "Rajadas de até 65 km/h previstas para as 15h. Evite pulverizações.", data: "10/12/2025", severidade: "media" as const, resolvido: false },
  { id: 4, tipo: "Seca", talhao: "Talhão F6", mensagem: "10 dias consecutivos sem chuva. Considere irrigação complementar.", data: "08/12/2025", severidade: "media" as const, resolvido: true },
  { id: 5, tipo: "Granizo", talhao: "Talhão D4", mensagem: "Células de granizo detectadas a 40 km no radar. Área em alerta.", data: "07/12/2025", severidade: "alta" as const, resolvido: true },
]

const mockDiario = [
  { id: 1, data: "09/12/2025", talhao: "Talhão A1", autor: "Carlos Mendes", observacao: "Desenvolvimento uniforme, folhas verde-intenso. Sem pragas visíveis. Solo com boa umidade após 18 mm de chuva ontem.", temperatura: 24, chuva: false },
  { id: 2, data: "09/12/2025", talhao: "Talhão C3", autor: "Ana Ferreira", observacao: "Pontos de ferrugem asiática detectados no terço médio (~3% de incidência). Recomendação: fungicida em até 48h.", temperatura: 21, chuva: true },
  { id: 3, data: "08/12/2025", talhao: "Talhão B2", autor: "José Silva", observacao: "Solo pronto para plantio após gradagem. pH corrigido conforme análise de solo. Aguardando janela seca.", temperatura: 26, chuva: false },
  { id: 4, data: "07/12/2025", talhao: "Talhão E5", autor: "Ana Ferreira", observacao: "Irrigação por aspersão concluída. Umidade 72% na camada 0–20 cm. Milho estágio V8, desenvolvimento esperado.", temperatura: 25, chuva: false },
]

const mockUsuarios = [
  { id: 1, nome: "Rodrigo Figueiredo", email: "rodrigo@agrimanager.com.br", perfil: "Admin" as const, ativo: true, ultimoAcesso: "10/12/2025" },
  { id: 2, nome: "Carlos Mendes", email: "carlos@agrimanager.com.br", perfil: "Agrônomo" as const, ativo: true, ultimoAcesso: "10/12/2025" },
  { id: 3, nome: "Ana Ferreira", email: "ana@agrimanager.com.br", perfil: "Agrônomo" as const, ativo: true, ultimoAcesso: "09/12/2025" },
  { id: 4, nome: "José Silva", email: "jose@agrimanager.com.br", perfil: "Operador" as const, ativo: true, ultimoAcesso: "08/12/2025" },
  { id: 5, nome: "Marcos Oliveira", email: "marcos@agrimanager.com.br", perfil: "Operador" as const, ativo: false, ultimoAcesso: "20/11/2025" },
]

const custosMensais = [
  { mes: "Jul", Defensivos: 8500, Fertilizantes: 12000, "Mão de Obra": 5800, Outros: 1800 },
  { mes: "Ago", Defensivos: 11200, Fertilizantes: 9500, "Mão de Obra": 6200, Outros: 2100 },
  { mes: "Set", Defensivos: 7400, Fertilizantes: 18000, "Mão de Obra": 7100, Outros: 1600 },
  { mes: "Out", Defensivos: 9800, Fertilizantes: 14200, "Mão de Obra": 8500, Outros: 3200 },
  { mes: "Nov", Defensivos: 13600, Fertilizantes: 22000, "Mão de Obra": 9800, Outros: 2800 },
  { mes: "Dez", Defensivos: 5200, Fertilizantes: 8600, "Mão de Obra": 4200, Outros: 1400 },
]

const previsaoClima = [
  { dia: "Qui", data: "12/12", temp: 28, min: 18, chuva: 0, umidade: 62, vento: 12, cond: "sun" },
  { dia: "Sex", data: "13/12", temp: 25, min: 16, chuva: 15, umidade: 78, vento: 18, cond: "cloud" },
  { dia: "Sáb", data: "14/12", temp: 21, min: 14, chuva: 42, umidade: 91, vento: 24, cond: "rain" },
  { dia: "Dom", data: "15/12", temp: 19, min: 12, chuva: 68, umidade: 95, vento: 32, cond: "storm" },
  { dia: "Seg", data: "16/12", temp: 23, min: 15, chuva: 5, umidade: 70, vento: 14, cond: "cloud" },
  { dia: "Ter", data: "17/12", temp: 27, min: 17, chuva: 0, umidade: 58, vento: 10, cond: "sun" },
  { dia: "Qua", data: "18/12", temp: 29, min: 19, chuva: 0, umidade: 55, vento: 8, cond: "sun" },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

function statusTalhao(s: string) {
  const map: Record<string, string> = {
    "Ativo": "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    "Em preparo": "bg-amber-500/15 text-amber-400 border-amber-500/25",
    "Colhido": "bg-blue-500/15 text-blue-400 border-blue-500/25",
    "Inativo": "bg-muted text-muted-foreground border-border",
  }
  return map[s] ?? map["Inativo"]
}

function statusEstoque(q: number, min: number) {
  if (q < min) return { label: "Crítico", cls: "bg-red-500/15 text-red-400 border-red-500/25" }
  if (q < min * 1.5) return { label: "Baixo", cls: "bg-amber-500/15 text-amber-400 border-amber-500/25" }
  return { label: "OK", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" }
}

function severidadeCls(s: string) {
  return s === "alta"
    ? "bg-red-500/15 text-red-400 border-red-500/25"
    : s === "media"
    ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
}

function WeatherIcon({ cond, size = 18 }: { cond: string; size?: number }) {
  if (cond === "sun") return <Sun size={size} className="text-amber-400" />
  if (cond === "rain") return <CloudRain size={size} className="text-blue-400" />
  if (cond === "storm") return <CloudLightning size={size} className="text-red-400" />
  return <Cloud size={size} className="text-muted-foreground" />
}

// ── Shared UI ──────────────────────────────────────────────────────────────────
function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[11px] font-medium leading-none ${cls}`}>
      {children}
    </span>
  )
}

function Btn({
  children, onClick, variant = "primary", size = "md", className = "", type = "button"
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "ghost" | "outline" | "danger"
  size?: "sm" | "md"
  className?: string
  type?: "button" | "submit"
}) {
  const base = "inline-flex items-center gap-1.5 rounded font-medium transition-all cursor-pointer"
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" }
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/85",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
    outline: "border border-border text-foreground hover:bg-muted",
    danger: "bg-destructive/15 text-destructive border border-destructive/25 hover:bg-destructive/25",
  }
  return (
    <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 bg-input-background border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all ${props.className ?? ""}`}
    />
  )
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 bg-input-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer ${props.className ?? ""}`}
    >
      {children}
    </select>
  )
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 bg-input-background border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all resize-none"
    />
  )
}

function PageHeader({
  title, sub, actions
}: {
  title: string; sub?: string; actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wide">{title}</h1>
        {sub && <p className="text-muted-foreground text-xs font-mono mt-0.5">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card border border-border rounded p-5 ${className}`}>
      {children}
    </div>
  )
}

function StatCard({
  label, value, sub, icon, accentCls = "bg-primary/10 text-primary"
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode; accentCls?: string
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded ${accentCls}`}>{icon}</div>
      </div>
      <div className="font-display text-3xl font-bold text-foreground tracking-wide">{value}</div>
      {sub && <div className="text-muted-foreground text-xs mt-1 font-mono">{sub}</div>}
    </Card>
  )
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("rodrigo@agrimanager.com.br")
  const [senha, setSenha] = useState("••••••••")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 800)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
            <Leaf size={24} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-wide">AgriManager</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">Gestão de campo inteligente</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="E-mail">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </Field>
            <Field label="Senha">
              <Input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded text-sm font-semibold hover:bg-primary/85 transition-all mt-1 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors text-center font-mono">
              Esqueci minha senha
            </button>
          </form>
        </Card>
        <p className="text-center text-muted-foreground text-xs font-mono mt-6">
          © 2025 AgriManager — Versão 2.4.1
        </p>
      </div>
    </div>
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
function DashboardPage({ navigate }: NavProps) {
  const ativos = mockTalhoes.filter(t => t.status === "Ativo").length
  const alertasAtivos = mockAlertas.filter(a => !a.resolvido).length
  const gastoDez = mockAtividades
    .filter(a => a.data.includes("/12/"))
    .reduce((s, a) => s + a.custo, 0)
  const criticos = mockInsumos.filter(i => i.quantidade < i.minimo).length

  return (
    <div>
      <PageHeader
        title="Dashboard"
        sub="Visão geral da fazenda — 10 de dezembro de 2025"
        actions={
          <Btn variant="outline" size="sm" onClick={() => navigate("relatorios")}>
            <Download size={14} /> Exportar PDF
          </Btn>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total de Talhões"
          value={String(mockTalhoes.length)}
          sub={`${ativos} ativos agora`}
          icon={<Layers size={16} />}
        />
        <StatCard
          label="Alertas Ativos"
          value={String(alertasAtivos)}
          sub="3 alta, 0 crítica"
          icon={<AlertTriangle size={16} />}
          accentCls="bg-red-500/10 text-red-400"
        />
        <StatCard
          label="Gasto do Mês"
          value={fmtCurrency(gastoDez)}
          sub="Dezembro/2025"
          icon={<DollarSign size={16} />}
          accentCls="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          label="Insumos Críticos"
          value={String(criticos)}
          sub="abaixo do mínimo"
          icon={<Package size={16} />}
          accentCls="bg-red-500/10 text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-foreground tracking-wide">Custos por Categoria</h3>
              <p className="text-muted-foreground text-xs font-mono">Jul – Dez 2025</p>
            </div>
            <BarChart2 size={16} className="text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={custosMensais} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={10}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(82,168,74,0.1)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: "#6d9467", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6d9467", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "#121f0f", border: "1px solid rgba(82,168,74,0.2)", borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: "#cfe5ca", fontFamily: "JetBrains Mono" }}
                formatter={(v: number, name: string) => [fmtCurrency(v), name]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "#6d9467", fontFamily: "JetBrains Mono" }} />
              <Bar dataKey="Defensivos" stackId="a" fill="#52a84a" radius={[0,0,0,0]} />
              <Bar dataKey="Fertilizantes" stackId="a" fill="#e8970f" />
              <Bar dataKey="Mão de Obra" stackId="a" fill="#4a82d0" />
              <Bar dataKey="Outros" stackId="a" fill="#9e6b3a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground tracking-wide">Alertas Ativos</h3>
            <Btn variant="ghost" size="sm" onClick={() => navigate("alertas")}>Ver todos</Btn>
          </div>
          <div className="flex flex-col gap-2">
            {mockAlertas.filter(a => !a.resolvido).map(a => (
              <div key={a.id} className="flex gap-3 p-2.5 bg-muted rounded border border-border">
                <AlertTriangle size={14} className={a.severidade === "alta" ? "text-red-400 mt-0.5 shrink-0" : "text-amber-400 mt-0.5 shrink-0"} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">{a.tipo}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{a.talhao}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground tracking-wide">Últimas Atividades</h3>
          <Btn variant="ghost" size="sm" onClick={() => navigate("atividades")}>Ver todas</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Talhão", "Tipo", "Data", "Custo", "Responsável"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-muted-foreground text-[11px] font-mono uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAtividades.slice(0, 5).map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-foreground text-xs">{a.talhao}</td>
                  <td className="py-2.5 px-3"><Badge cls="bg-secondary border-border text-secondary-foreground">{a.tipo}</Badge></td>
                  <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{a.data}</td>
                  <td className="py-2.5 px-3 text-foreground font-mono text-xs">{fmtCurrency(a.custo)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs">{a.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Talhões Page ───────────────────────────────────────────────────────────────
function TalhoesPage({ navigate }: NavProps) {
  const [busca, setBusca] = useState("")
  const [vista, setVista] = useState<"cards" | "tabela">("cards")

  const filtrados = mockTalhoes.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.cultura.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Talhões"
        sub={`${mockTalhoes.length} talhões cadastrados · ${mockTalhoes.reduce((s, t) => s + t.area, 0).toFixed(1)} ha total`}
        actions={
          <>
            <Btn variant="outline" size="sm" onClick={() => setVista(v => v === "cards" ? "tabela" : "cards")}>
              {vista === "cards" ? "Tabela" : "Cards"}
            </Btn>
            <Btn size="sm" onClick={() => navigate("cadastro-talhao")}>
              <Plus size={14} /> Novo Talhão
            </Btn>
          </>
        }
      />

      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou cultura..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {vista === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(t => (
            <div
              key={t.id}
              onClick={() => navigate("detalhes-talhao", t.id)}
              className="bg-card border border-border rounded p-5 hover:border-primary/40 hover:bg-muted/30 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground tracking-wide group-hover:text-primary transition-colors">{t.nome}</h3>
                  <p className="text-muted-foreground text-xs font-mono mt-0.5 flex items-center gap-1">
                    <MapPin size={11} /> {t.cidade}
                  </p>
                </div>
                <Badge cls={statusTalhao(t.status)}>{t.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-muted rounded px-3 py-2">
                  <p className="text-muted-foreground font-mono text-[10px] uppercase">Cultura</p>
                  <p className="font-semibold text-foreground mt-0.5">{t.cultura}</p>
                </div>
                <div className="bg-muted rounded px-3 py-2">
                  <p className="text-muted-foreground font-mono text-[10px] uppercase">Área</p>
                  <p className="font-semibold text-foreground font-mono mt-0.5">{t.area} ha</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1"><Thermometer size={12} />{t.temp}°C</span>
                <span className="flex items-center gap-1"><Droplets size={12} />{t.umidade}%</span>
                <span className="flex items-center gap-1 ml-auto"><Clock size={11} />{t.ultimaAtividade}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Nome", "Cultura", "Área (ha)", "Status", "Temp.", "Umidade", "Última Ativ.", ""].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-muted-foreground text-[11px] font-mono uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(t => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground text-xs">{t.nome}</td>
                    <td className="py-3 px-4 text-foreground text-xs">{t.cultura}</td>
                    <td className="py-3 px-4 text-foreground font-mono text-xs">{t.area}</td>
                    <td className="py-3 px-4"><Badge cls={statusTalhao(t.status)}>{t.status}</Badge></td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{t.temp}°C</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{t.umidade}%</td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{t.ultimaAtividade}</td>
                    <td className="py-3 px-4">
                      <Btn variant="ghost" size="sm" onClick={() => navigate("detalhes-talhao", t.id)}>
                        <Eye size={13} /> Ver
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Cadastro Talhão ────────────────────────────────────────────────────────────
function CadastroTalhaoPage({ navigate }: NavProps) {
  const [form, setForm] = useState({ nome: "", area: "", cultura: "", cidade: "", obs: "" })

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <button onClick={() => navigate("talhoes")} className="hover:text-primary transition-colors">Talhões</button>
        <ChevronRight size={12} />
        <span className="text-foreground">Novo Talhão</span>
      </div>
      <PageHeader title="Cadastrar Talhão" sub="Preencha as informações do novo talhão" />
      <div className="max-w-2xl">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome do Talhão">
              <Input placeholder="Ex.: Talhão G7" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </Field>
            <Field label="Área (ha)">
              <Input type="number" placeholder="0.0" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
            </Field>
            <Field label="Cultura Atual">
              <Select value={form.cultura} onChange={e => setForm(f => ({ ...f, cultura: e.target.value }))}>
                <option value="">Selecione...</option>
                {["Soja", "Milho", "Trigo", "Feijão", "Algodão", "Café", "Cana-de-açúcar", "Sorgo"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Localização (Cidade/Estado)">
              <Input placeholder="Ex.: Londrina, PR" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Observações">
                <Textarea rows={4} placeholder="Informações adicionais sobre solo, histórico, etc." value={form.obs} onChange={e => setForm(f => ({ ...f, obs: e.target.value }))} />
              </Field>
            </div>
          </div>
          <div className="flex gap-2 mt-5 pt-5 border-t border-border">
            <Btn onClick={() => navigate("talhoes")}>Salvar Talhão</Btn>
            <Btn variant="outline" onClick={() => navigate("talhoes")}>Cancelar</Btn>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Detalhes Talhão ────────────────────────────────────────────────────────────
function DetalhesTalhaoPage({ navigate, selectedTalhaoId }: NavProps) {
  const talhao = mockTalhoes.find(t => t.id === selectedTalhaoId) ?? mockTalhoes[0]
  const atividades = mockAtividades.filter(a => a.talhaoId === talhao.id)

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <button onClick={() => navigate("talhoes")} className="hover:text-primary transition-colors">Talhões</button>
        <ChevronRight size={12} />
        <span className="text-foreground">{talhao.nome}</span>
      </div>
      <PageHeader
        title={talhao.nome}
        sub={`${talhao.cultura} · ${talhao.area} ha · ${talhao.cidade}`}
        actions={
          <>
            <Btn variant="outline" size="sm" onClick={() => navigate("clima-talhao", talhao.id)}>
              <Cloud size={14} /> Ver Clima
            </Btn>
            <Btn size="sm" onClick={() => navigate("nova-atividade")}>
              <Plus size={14} /> Registrar Atividade
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Temperatura", value: `${talhao.temp}°C`, icon: <Thermometer size={14} />, cls: "bg-amber-500/10 text-amber-400" },
          { label: "Umidade", value: `${talhao.umidade}%`, icon: <Droplets size={14} />, cls: "bg-blue-500/10 text-blue-400" },
          { label: "Status", value: talhao.status, icon: <Leaf size={14} />, cls: "bg-primary/10 text-primary" },
          { label: "Alertas", value: String(mockAlertas.filter(a => a.talhao === talhao.nome && !a.resolvido).length), icon: <Bell size={14} />, cls: "bg-red-500/10 text-red-400" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">{s.label}</span>
              <div className={`${s.cls} p-1.5 rounded`}>{s.icon}</div>
            </div>
            <div className="font-display text-xl font-bold text-foreground">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground tracking-wide">Histórico de Atividades</h3>
          <Badge cls="bg-secondary border-border text-secondary-foreground">{atividades.length} registros</Badge>
        </div>
        {atividades.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8 font-mono">Nenhuma atividade registrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Tipo", "Data", "Descrição", "Custo", "Responsável"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-muted-foreground text-[11px] font-mono uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atividades.map(a => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3"><Badge cls="bg-secondary border-border text-secondary-foreground">{a.tipo}</Badge></td>
                    <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{a.data}</td>
                    <td className="py-2.5 px-3 text-foreground text-xs max-w-xs truncate">{a.descricao}</td>
                    <td className="py-2.5 px-3 text-foreground font-mono text-xs">{fmtCurrency(a.custo)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-xs">{a.responsavel}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={3} className="py-2 px-3 text-xs text-muted-foreground font-mono">Total</td>
                  <td className="py-2 px-3 font-mono text-sm font-bold text-foreground">
                    {fmtCurrency(atividades.reduce((s, a) => s + a.custo, 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Clima Talhão ───────────────────────────────────────────────────────────────
function ClimaPage({ navigate, selectedTalhaoId }: NavProps) {
  const talhao = mockTalhoes.find(t => t.id === selectedTalhaoId) ?? mockTalhoes[0]
  const alertasTalhao = mockAlertas.filter(a => a.talhao === talhao.nome)

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <button onClick={() => navigate("talhoes")} className="hover:text-primary transition-colors">Talhões</button>
        <ChevronRight size={12} />
        <button onClick={() => navigate("detalhes-talhao", talhao.id)} className="hover:text-primary transition-colors">{talhao.nome}</button>
        <ChevronRight size={12} />
        <span className="text-foreground">Clima</span>
      </div>
      <PageHeader
        title={`Clima — ${talhao.nome}`}
        sub={`${talhao.cidade} · Atualizado em 10/12/2025 às 08:00`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {previsaoClima.map((d, i) => (
          <Card key={i} className={`p-4 text-center ${i === 0 ? "border-primary/40 bg-primary/5" : ""}`}>
            <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">{d.dia}</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-3">{d.data}</p>
            <div className="flex justify-center mb-2">
              <WeatherIcon cond={d.cond} size={22} />
            </div>
            <p className="font-display font-bold text-xl text-foreground">{d.temp}°</p>
            <p className="font-mono text-[11px] text-muted-foreground">{d.min}°</p>
            {d.chuva > 0 && (
              <p className="font-mono text-[10px] text-blue-400 mt-1 flex items-center justify-center gap-0.5">
                <Droplets size={10} />{d.chuva}mm
              </p>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Precipitação Total (7d)", value: `${previsaoClima.reduce((s, d) => s + d.chuva, 0)} mm`, icon: <Droplets size={16} />, cls: "bg-blue-500/10 text-blue-400" },
          { label: "Vento Máx.", value: `${Math.max(...previsaoClima.map(d => d.vento))} km/h`, icon: <Wind size={16} />, cls: "bg-muted text-muted-foreground" },
          { label: "Umidade Média", value: `${Math.round(previsaoClima.reduce((s, d) => s + d.umidade, 0) / 7)}%`, icon: <Cloud size={16} />, cls: "bg-primary/10 text-primary" },
        ].map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accentCls={s.cls} />
        ))}
      </div>

      <Card>
        <h3 className="font-display font-semibold text-foreground tracking-wide mb-4">Histórico de Alertas Climáticos</h3>
        {alertasTalhao.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6 font-mono">Nenhum alerta registrado para este talhão</p>
        ) : (
          <div className="flex flex-col gap-2">
            {alertasTalhao.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded border border-border bg-muted/30">
                <AlertTriangle size={14} className={a.severidade === "alta" ? "text-red-400 mt-0.5 shrink-0" : "text-amber-400 mt-0.5 shrink-0"} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{a.tipo}</span>
                    <Badge cls={severidadeCls(a.severidade)}>{a.severidade}</Badge>
                    {a.resolvido && <Badge cls="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">Resolvido</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.mensagem}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">{a.data}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Atividades Page ────────────────────────────────────────────────────────────
function AtividadesPage({ navigate }: NavProps) {
  const [tipoFiltro, setTipoFiltro] = useState("")
  const [talhaoFiltro, setTalhaoFiltro] = useState("")

  const tipos = [...new Set(mockAtividades.map(a => a.tipo))]
  const filtradas = mockAtividades.filter(a =>
    (!tipoFiltro || a.tipo === tipoFiltro) &&
    (!talhaoFiltro || a.talhao === talhaoFiltro)
  )
  const total = filtradas.reduce((s, a) => s + a.custo, 0)

  return (
    <div>
      <PageHeader
        title="Atividades"
        sub="Histórico de todas as operações de campo"
        actions={
          <Btn size="sm" onClick={() => navigate("nova-atividade")}>
            <Plus size={14} /> Nova Atividade
          </Btn>
        }
      />
      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)} className="w-auto min-w-[140px]">
          <option value="">Todos os tipos</option>
          {tipos.map(t => <option key={t}>{t}</option>)}
        </Select>
        <Select value={talhaoFiltro} onChange={e => setTalhaoFiltro(e.target.value)} className="w-auto min-w-[140px]">
          <option value="">Todos os talhões</option>
          {mockTalhoes.map(t => <option key={t.id}>{t.nome}</option>)}
        </Select>
        {(tipoFiltro || talhaoFiltro) && (
          <Btn variant="ghost" size="sm" onClick={() => { setTipoFiltro(""); setTalhaoFiltro("") }}>
            <X size={13} /> Limpar
          </Btn>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Talhão", "Tipo", "Data", "Descrição", "Custo", "Responsável"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted-foreground text-[11px] font-mono uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground text-xs">{a.talhao}</td>
                  <td className="py-3 px-4"><Badge cls="bg-secondary border-border text-secondary-foreground">{a.tipo}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{a.data}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs max-w-xs">{a.descricao}</td>
                  <td className="py-3 px-4 text-foreground font-mono text-xs">{fmtCurrency(a.custo)}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{a.responsavel}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/20">
                <td colSpan={4} className="py-3 px-4 text-xs text-muted-foreground font-mono">{filtradas.length} registro(s)</td>
                <td className="py-3 px-4 font-mono font-bold text-foreground text-sm">{fmtCurrency(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Nova Atividade ─────────────────────────────────────────────────────────────
function NovaAtividadePage({ navigate }: NavProps) {
  const [form, setForm] = useState({ talhaoId: "", tipo: "", data: "2025-12-10", descricao: "", custo: "" })

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        <button onClick={() => navigate("atividades")} className="hover:text-primary transition-colors">Atividades</button>
        <ChevronRight size={12} />
        <span className="text-foreground">Nova Atividade</span>
      </div>
      <PageHeader title="Registrar Atividade" sub="Documente a operação realizada em campo" />
      <div className="max-w-2xl">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Talhão">
              <Select value={form.talhaoId} onChange={e => setForm(f => ({ ...f, talhaoId: e.target.value }))}>
                <option value="">Selecione...</option>
                {mockTalhoes.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Select>
            </Field>
            <Field label="Tipo de Atividade">
              <Select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <option value="">Selecione...</option>
                {["Plantio", "Colheita", "Adubação", "Pulverização", "Irrigação", "Calagem", "Preparo", "Monitoramento", "Outro"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Data">
              <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
            </Field>
            <Field label="Custo (R$)">
              <Input type="number" placeholder="0,00" value={form.custo} onChange={e => setForm(f => ({ ...f, custo: e.target.value }))} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Descrição">
                <Textarea rows={4} placeholder="Descreva a atividade realizada, insumos utilizados, observações..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
              </Field>
            </div>
          </div>
          <div className="flex gap-2 mt-5 pt-5 border-t border-border">
            <Btn onClick={() => navigate("atividades")}>Salvar Atividade</Btn>
            <Btn variant="outline" onClick={() => navigate("atividades")}>Cancelar</Btn>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Diário de Campo ────────────────────────────────────────────────────────────
function DiarioCampoPage({ navigate }: NavProps) {
  return (
    <div>
      <PageHeader
        title="Diário de Campo"
        sub="Registros e observações agronômicas diárias"
        actions={
          <Btn size="sm">
            <Plus size={14} /> Nova Entrada
          </Btn>
        }
      />
      <div className="max-w-2xl flex flex-col gap-1">
        {mockDiario.map((entrada, i) => (
          <div key={entrada.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                {entrada.chuva ? <CloudRain size={14} className="text-blue-400" /> : <Sun size={14} className="text-amber-400" />}
              </div>
              {i < mockDiario.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
            </div>
            <div className="pb-5 flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{entrada.data}</span>
                  <h4 className="font-display font-semibold text-foreground tracking-wide">{entrada.talhao}</h4>
                  <span className="text-xs text-muted-foreground">{entrada.autor}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                    <Thermometer size={11} />{entrada.temperatura}°C
                  </span>
                  {entrada.chuva && <Badge cls="bg-blue-500/15 text-blue-400 border-blue-500/25">Chuva</Badge>}
                </div>
              </div>
              <Card className="p-3">
                <p className="text-sm text-foreground leading-relaxed">{entrada.observacao}</p>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Estoque Page ───────────────────────────────────────────────────────────────
function EstoquePage({ navigate }: NavProps) {
  const criticos = mockInsumos.filter(i => statusEstoque(i.quantidade, i.minimo).label !== "OK")

  return (
    <div>
      <PageHeader
        title="Estoque de Insumos"
        sub={`${mockInsumos.length} produtos · ${criticos.length} com atenção`}
        actions={
          <Btn size="sm">
            <Plus size={14} /> Cadastrar Insumo
          </Btn>
        }
      />

      {criticos.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/8 border border-red-500/20 rounded flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-mono">
            {criticos.length} insumo(s) abaixo do nível mínimo: {criticos.map(i => i.nome).join(", ")}
          </p>
        </div>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Produto", "Categoria", "Quantidade", "Mínimo", "Status", "Custo Unit.", "Valor em Estoque"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted-foreground text-[11px] font-mono uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockInsumos.map(i => {
                const st = statusEstoque(i.quantidade, i.minimo)
                return (
                  <tr key={i.id} className={`border-b border-border/50 transition-colors ${st.label !== "OK" ? "bg-red-500/3 hover:bg-red-500/6" : "hover:bg-muted/30"}`}>
                    <td className="py-3 px-4 font-medium text-foreground text-xs">{i.nome}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{i.categoria}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className={st.label !== "OK" ? "text-red-400 font-bold" : "text-foreground"}>
                        {i.quantidade.toLocaleString("pt-BR")} {i.unidade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{i.minimo.toLocaleString("pt-BR")} {i.unidade}</td>
                    <td className="py-3 px-4"><Badge cls={st.cls}>{st.label}</Badge></td>
                    <td className="py-3 px-4 text-muted-foreground font-mono text-xs">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(i.custo)}
                    </td>
                    <td className="py-3 px-4 text-foreground font-mono text-xs">
                      {fmtCurrency(i.quantidade * i.custo)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/20">
                <td colSpan={6} className="py-3 px-4 text-xs text-muted-foreground font-mono">Valor total em estoque</td>
                <td className="py-3 px-4 font-mono font-bold text-foreground text-sm">
                  {fmtCurrency(mockInsumos.reduce((s, i) => s + i.quantidade * i.custo, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Alertas Climáticos ─────────────────────────────────────────────────────────
function AlertasPage({ navigate }: NavProps) {
  const [filtro, setFiltro] = useState<"todos" | "ativos" | "resolvidos">("todos")
  const [severidade, setSeveridade] = useState("")

  const filtrados = mockAlertas
    .filter(a => filtro === "todos" ? true : filtro === "ativos" ? !a.resolvido : a.resolvido)
    .filter(a => !severidade || a.severidade === severidade)

  return (
    <div>
      <PageHeader
        title="Alertas Climáticos"
        sub={`${mockAlertas.filter(a => !a.resolvido).length} alertas ativos`}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["todos", "ativos", "resolvidos"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded text-xs font-mono capitalize transition-all ${filtro === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {f}
          </button>
        ))}
        <Select value={severidade} onChange={e => setSeveridade(e.target.value)} className="w-auto min-w-[130px]">
          <option value="">Toda severidade</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {filtrados.map(a => (
          <div key={a.id} className={`p-4 rounded border flex gap-4 ${a.resolvido ? "bg-card border-border opacity-60" : "bg-card border-border"}`}>
            <div className={`p-2 rounded self-start ${a.severidade === "alta" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
              <AlertTriangle size={16} className={a.severidade === "alta" ? "text-red-400" : "text-amber-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-display font-semibold text-foreground tracking-wide">{a.tipo}</span>
                <Badge cls={severidadeCls(a.severidade)}>Severidade {a.severidade}</Badge>
                {a.resolvido
                  ? <Badge cls="bg-emerald-500/15 text-emerald-400 border-emerald-500/25"><CheckCircle size={10} className="mr-1" />Resolvido</Badge>
                  : <Badge cls="bg-red-500/15 text-red-400 border-red-500/25">Ativo</Badge>
                }
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-1 flex items-center gap-1">
                <MapPin size={11} /> {a.talhao} · {a.data}
              </p>
              <p className="text-sm text-foreground">{a.mensagem}</p>
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-mono text-sm">
            Nenhum alerta encontrado para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  )
}

// ── Relatórios Page ────────────────────────────────────────────────────────────
function RelatoriosPage({ navigate }: NavProps) {
  const [talhao, setTalhao] = useState("")
  const [de, setDe] = useState("2025-11-01")
  const [ate, setAte] = useState("2025-12-10")
  const [tipos, setTipos] = useState({ atividades: true, estoque: true, clima: false, financeiro: true })

  return (
    <div>
      <PageHeader title="Relatórios" sub="Gere relatórios PDF filtrados por talhão e período" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <h3 className="font-display font-semibold text-foreground tracking-wide mb-4">Filtros</h3>
          <div className="flex flex-col gap-4">
            <Field label="Talhão">
              <Select value={talhao} onChange={e => setTalhao(e.target.value)}>
                <option value="">Todos os talhões</option>
                {mockTalhoes.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </Select>
            </Field>
            <Field label="Data Inicial">
              <Input type="date" value={de} onChange={e => setDe(e.target.value)} />
            </Field>
            <Field label="Data Final">
              <Input type="date" value={ate} onChange={e => setAte(e.target.value)} />
            </Field>
            <div>
              <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider mb-2">Incluir no Relatório</p>
              <div className="flex flex-col gap-2">
                {(Object.keys(tipos) as (keyof typeof tipos)[]).map(k => {
                  const labels: Record<string, string> = { atividades: "Atividades de Campo", estoque: "Movimentação de Estoque", clima: "Histórico Climático", financeiro: "Resumo Financeiro" }
                  return (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tipos[k]}
                        onChange={e => setTipos(t => ({ ...t, [k]: e.target.checked }))}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{labels[k]}</span>
                    </label>
                  )
                })}
              </div>
            </div>
            <Btn className="w-full justify-center mt-1">
              <Download size={14} /> Exportar PDF
            </Btn>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-display font-semibold text-foreground tracking-wide mb-4">Pré-visualização</h3>
          <div className="bg-muted/30 border border-border rounded p-6 min-h-64 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Leaf size={14} className="text-primary" />
                  <span className="font-display font-bold text-lg text-foreground tracking-wide">AgriManager</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">Relatório Gerencial · Período: {de.split("-").reverse().join("/")} — {ate.split("-").reverse().join("/")}</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono">Gerado em 10/12/2025</p>
            </div>
            {Object.entries({ atividades: tipos.atividades, estoque: tipos.estoque, clima: tipos.clima, financeiro: tipos.financeiro }).filter(([, v]) => v).map(([k]) => {
              const labels: Record<string, string> = { atividades: "Atividades de Campo", estoque: "Movimentação de Estoque", clima: "Histórico Climático", financeiro: "Resumo Financeiro" }
              return (
                <div key={k} className="border border-border rounded p-3">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">{labels[k]}</p>
                  <div className="h-6 bg-muted/50 rounded w-3/4 animate-pulse" />
                </div>
              )
            })}
            {!Object.values(tipos).some(Boolean) && (
              <p className="text-muted-foreground text-sm text-center py-8 font-mono">Selecione ao menos um tipo de relatório</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── Usuários Page ──────────────────────────────────────────────────────────────
function UsuariosPage({ navigate }: NavProps) {
  const perfilCls: Record<string, string> = {
    Admin: "bg-primary/15 text-primary border-primary/25",
    Agrônomo: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    Operador: "bg-secondary border-border text-secondary-foreground",
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        sub={`${mockUsuarios.length} usuários cadastrados`}
        actions={
          <Btn size="sm">
            <Plus size={14} /> Convidar Usuário
          </Btn>
        }
      />
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Usuário", "E-mail", "Perfil", "Status", "Último Acesso", ""].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted-foreground text-[11px] font-mono uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockUsuarios.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground">
                        {u.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium text-foreground text-xs">{u.nome}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                  <td className="py-3 px-4"><Badge cls={perfilCls[u.perfil]}>{u.perfil}</Badge></td>
                  <td className="py-3 px-4">
                    <Badge cls={u.ativo ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "bg-muted text-muted-foreground border-border"}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{u.ultimoAcesso}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Btn variant="ghost" size="sm"><Edit size={12} /></Btn>
                      <Btn variant="ghost" size="sm"><Trash2 size={12} className="text-destructive" /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "talhoes" as Page, label: "Talhões", icon: Layers },
  { id: "atividades" as Page, label: "Atividades", icon: Activity },
  { id: "diario-campo" as Page, label: "Diário de Campo", icon: BookOpen },
  { id: "estoque" as Page, label: "Estoque", icon: Package },
  { id: "alertas" as Page, label: "Alertas Climáticos", icon: CloudLightning },
  { id: "relatorios" as Page, label: "Relatórios PDF", icon: FileText },
  { id: "usuarios" as Page, label: "Usuários", icon: Users },
]

const pageGroups: Record<string, Page[]> = {
  dashboard: ["dashboard"],
  talhoes: ["talhoes", "cadastro-talhao", "detalhes-talhao", "clima-talhao"],
  atividades: ["atividades", "nova-atividade"],
  "diario-campo": ["diario-campo"],
  estoque: ["estoque"],
  alertas: ["alertas"],
  relatorios: ["relatorios"],
  usuarios: ["usuarios"],
}

function Sidebar({
  page, navigate, open, onClose
}: {
  page: Page
  navigate: (p: Page, id?: number) => void
  open: boolean
  onClose: () => void
}) {
  const alertasAtivos = mockAlertas.filter(a => !a.resolvido).length

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-sidebar border-r border-sidebar-border flex flex-col z-30 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Leaf size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground text-base tracking-wide leading-none">AgriManager</p>
              <p className="text-muted-foreground font-mono text-[10px] mt-0.5">Fazenda Figueiredo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pageGroups[item.id]?.includes(page)
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-all mb-0.5 relative group ${
                  isActive
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <item.icon size={15} className="shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.id === "alertas" && alertasAtivos > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {alertasAtivos}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-sidebar-accent transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0">
              RF
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Rodrigo Figueiredo</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">Admin</p>
            </div>
            <LogOut size={13} className="text-muted-foreground shrink-0 group-hover:text-destructive transition-colors" />
          </div>
        </div>
      </aside>
    </>
  )
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [page, setPage] = useState<Page>("dashboard")
  const [selectedTalhaoId, setSelectedTalhaoId] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function navigate(newPage: Page, talhaoId?: number) {
    setPage(newPage)
    if (talhaoId !== undefined) setSelectedTalhaoId(talhaoId)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  const navProps: NavProps = { navigate, selectedTalhaoId }

  const pageComponents: Record<Page, React.ReactNode> = {
    login: null,
    dashboard: <DashboardPage {...navProps} />,
    talhoes: <TalhoesPage {...navProps} />,
    "cadastro-talhao": <CadastroTalhaoPage {...navProps} />,
    "detalhes-talhao": <DetalhesTalhaoPage {...navProps} />,
    "clima-talhao": <ClimaPage {...navProps} />,
    atividades: <AtividadesPage {...navProps} />,
    "nova-atividade": <NovaAtividadePage {...navProps} />,
    "diario-campo": <DiarioCampoPage {...navProps} />,
    estoque: <EstoquePage {...navProps} />,
    alertas: <AlertasPage {...navProps} />,
    relatorios: <RelatoriosPage {...navProps} />,
    usuarios: <UsuariosPage {...navProps} />,
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar page={page} navigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-56 min-w-0">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="lg:hidden p-1.5 rounded hover:bg-muted text-muted-foreground"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              className="relative p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
              onClick={() => navigate("alertas")}
            >
              <Bell size={17} />
              {mockAlertas.filter(a => !a.resolvido).length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
            <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground cursor-pointer hover:border-primary/40 transition-colors">
              RF
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl">
          {pageComponents[page]}
        </main>
      </div>
    </div>
  )
}
