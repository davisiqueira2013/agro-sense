# 🌱 Agro Sense

Protótipo de sistema web para **gestão agrícola**, desenvolvido como parte de um Projeto Integrador. A interface foi projetada no Figma e implementada em React, reunindo em um único painel as principais ferramentas que um produtor ou equipe de campo precisa no dia a dia.

> ⚠️ **Fase 02 em andamento:** o frontend foi reorganizado para receber a integração com o backend (API REST). Enquanto a API não estiver pronta, as telas usam os dados fictícios de `src/app/data/mockData.ts`.

## 📋 Funcionalidades

O sistema é organizado em oito telas principais, acessíveis pelo menu lateral:

- **Dashboard** — visão geral das operações, indicadores e alertas recentes
- **Talhões** — cadastro e acompanhamento das áreas de cultivo (cultura, área, temperatura, umidade)
- **Atividades de Campo** — planejamento e registro de tarefas realizadas na propriedade
- **Diário de Campo** — anotações agronômicas e observações registradas pela equipe
- **Estoque de Insumos** — controle de entrada e saída de insumos agrícolas
- **Alertas Climáticos** — notificações sobre condições meteorológicas que impactam a produção
- **Relatórios** — geração de relatórios em PDF sobre as operações
- **Usuários** — gerenciamento de contas e permissões da equipe

## 🛠️ Tecnologias

- **React** + **TypeScript**
- **Vite** — ambiente de desenvolvimento e build
- **Tailwind CSS v4** (plugin `@tailwindcss/vite`) — estilização
- **shadcn/ui** — biblioteca de componentes de interface

## 🚀 Como rodar o projeto localmente

**Pré-requisito:** ter o [Node.js](https://nodejs.org/) instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/davisiqueira2013/agro-sense.git

# 2. Entre na pasta do projeto
cd agro-sense

# 3. Instale as dependências
npm install

# 4. Crie o arquivo de ambiente (endereço da API)
cp .env.example .env

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Depois disso, acesse o endereço mostrado no terminal (geralmente `http://localhost:5173`) no navegador.

## 📁 Estrutura do projeto

```
agro-sense/
├── src/
│   ├── main.tsx                 # Ponto de entrada
│   ├── config.ts                # Variáveis de ambiente (VITE_API_URL)
│   ├── app/
│   │   ├── App.tsx              # Autenticação e navegação entre telas
│   │   ├── navigation.tsx       # Itens do menu lateral
│   │   ├── types.ts             # Tipos de domínio (Talhao, Atividade, Insumo...)
│   │   ├── pages/               # Uma tela por arquivo (LoginPage, DashboardPage...)
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar e Header
│   │   │   ├── shared/          # PageHeader, Card, DataTable, botões, Avatar
│   │   │   └── ui/              # Componentes shadcn/ui
│   │   ├── data/mockData.ts     # Dados fictícios (serão trocados pela API)
│   │   └── lib/tones.ts         # Cores por status e severidade
│   └── styles/                  # Estilos globais e tema
├── .env.example                 # Modelo das variáveis de ambiente
├── index.html
├── package.json
└── vite.config.ts               # Vite + React + Tailwind CSS v4
```

## 📄 Licença

Projeto acadêmico desenvolvido para fins de estudo. Dados exibidos são fictícios.