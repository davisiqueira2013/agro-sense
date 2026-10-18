# 🌱 Agro Sense

Sistema web para **gestão agrícola**, desenvolvido como Projeto Integrador. Reúne em um único painel o que um produtor ou equipe de campo precisa no dia a dia: talhões, atividades, diário de campo, estoque de insumos, alertas climáticos, relatórios e usuários.

> 🚧 **Fase 02 em andamento — integração frontend e backend.** O repositório agora é um monorepo com o frontend (React) e o backend (API REST em Node.js), além do banco PostgreSQL via Docker. Enquanto os módulos da API não estiverem prontos, as telas usam os dados fictícios de `frontend/src/app/data/mockData.ts`.

## 🏗️ Arquitetura

```
Navegador (React SPA)  ──HTTP + JSON / JWT──▶  API REST (Express)  ──Prisma──▶  PostgreSQL
      frontend/                                    backend/                    docker-compose.yml
```

| Pasta | O que é | Porta |
| --- | --- | --- |
| `frontend/` | Interface em React + TypeScript + Vite + Tailwind CSS | 5173 |
| `backend/` | API REST em Node.js + Express + TypeScript | 3333 |
| `docker-compose.yml` | Banco PostgreSQL 16 para desenvolvimento | 5432 |

## 📋 Funcionalidades

- **Dashboard** — indicadores, custos e alertas recentes
- **Talhões** — cadastro e acompanhamento das áreas de cultivo
- **Atividades de Campo** — planejamento e registro de tarefas
- **Diário de Campo** — anotações agronômicas da equipe
- **Estoque de Insumos** — entradas, saídas e itens abaixo do mínimo
- **Alertas Climáticos** — riscos meteorológicos por talhão
- **Relatórios** — geração de relatórios em PDF
- **Usuários** — contas e perfis de acesso

## 🛠️ Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js 22, Express 5, TypeScript, Prisma ORM 7, Zod, Swagger (OpenAPI 3) |
| Banco de dados | PostgreSQL 16 (Docker) |

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior (recomendado: 22)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)
- Git

## 🚀 Como rodar o projeto

### 1. Clonar e instalar

```bash
git clone https://github.com/davisiqueira2013/agro-sense.git
cd agro-sense
npm run install:all
```

### 2. Criar os arquivos de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

No Windows (PowerShell), use `copy` no lugar de `cp`.

### 3. Subir o banco de dados

Com o Docker Desktop aberto:

```bash
npm run db:up
```

O PostgreSQL fica disponível em `localhost:5432` (usuário, senha e banco: `agrosense`). Para parar: `npm run db:down`.

Na primeira vez (e sempre que quiser voltar aos dados iniciais), crie as tabelas e carregue os dados de exemplo:

```bash
npm run db:setup
```

Usuários criados pelo seed (senha de todos: `agrosense123`):

| E-mail | Perfil |
| --- | --- |
| rodrigo@agrosense.com.br | ADMIN |
| ana.agronoma@agrosense.com.br | TECNICO |
| carlos.op@agrosense.com.br | TECNICO |
| jose.silva@agrosense.com.br | LEITOR (inativo) |

### 4. Subir a API (terminal 1)

```bash
npm run dev:api
```

Teste em http://localhost:3333/api/health — deve responder `{"status":"ok","banco":"conectado", ...}`.

A documentação interativa da API (Swagger) fica em http://localhost:3333/api/docs.

### 5. Subir o frontend (terminal 2)

```bash
npm run dev:web
```

Acesse http://localhost:5173.

## 📜 Scripts da raiz

| Comando | O que faz |
| --- | --- |
| `npm run install:all` | Instala as dependências do backend e do frontend |
| `npm run db:up` / `db:down` | Sobe / para o PostgreSQL no Docker |
| `npm run db:setup` | Aplica as migrations e recria os dados de exemplo |
| `npm run db:migrate` | Só aplica as migrations pendentes |
| `npm run db:seed` | Só recria os dados de exemplo (apaga os atuais) |
| `npm run db:studio` | Abre o Prisma Studio para ver as tabelas no navegador |
| `npm run dev:api` | API em modo desenvolvimento (recarrega ao salvar) |
| `npm run dev:web` | Frontend em modo desenvolvimento |
| `npm run build` | Compila backend e frontend |
| `npm run lint` | Verifica o código do frontend com ESLint |

## 📁 Estrutura do repositório

```
agro-sense/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelo de dados (8 entidades)
│   │   ├── migrations/          # SQL versionado do banco
│   │   └── seed.ts              # Dados de exemplo
│   ├── src/
│   │   ├── app.ts               # Express: CORS, JSON, Swagger, rotas /api, erros
│   │   ├── server.ts            # Sobe a API na porta 3333
│   │   ├── docs/openapi.ts      # Especificação exibida em /api/docs
│   │   ├── lib/                 # prisma.ts (conexão) e AppError.ts
│   │   └── middlewares/         # tratarErros.ts (formato padrão de erro)
│   ├── prisma.config.ts         # Configuração do Prisma (schema, migrations, seed)
│   ├── .env.example             # PORT, CORS_ORIGIN, DATABASE_URL, JWT_SECRET
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── config.ts            # VITE_API_URL
│   │   └── app/
│   │       ├── App.tsx          # Autenticação e navegação entre telas
│   │       ├── pages/           # Uma tela por arquivo
│   │       ├── components/      # layout/, shared/ e ui/ (shadcn)
│   │       ├── data/mockData.ts # Dados fictícios (serão trocados pela API)
│   │       ├── lib/tones.ts     # Cores por status e severidade
│   │       └── types.ts         # Tipos de domínio
│   ├── .env.example             # VITE_API_URL
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml           # PostgreSQL
├── package.json                 # Scripts que facilitam rodar tudo pela raiz
└── README.md
```

## 📄 Licença

Projeto acadêmico desenvolvido para fins de estudo. Dados exibidos são fictícios.
