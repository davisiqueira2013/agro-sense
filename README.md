# 🌱 Agro Sense

Protótipo de sistema web para **gestão agrícola**, desenvolvido como parte de um Projeto Integrador. A interface foi projetada no Figma e implementada em React, reunindo em um único painel as principais ferramentas que um produtor ou equipe de campo precisa no dia a dia.

> ⚠️ Este é um **protótipo funcional com dados fictícios**, voltado para fins acadêmicos e de demonstração. Não há integração com backend ou banco de dados real.

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
- **Tailwind CSS** — estilização
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

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Depois disso, acesse o endereço mostrado no terminal (geralmente `http://localhost:5173`) no navegador.

## 📁 Estrutura do projeto

```
agro-sense/
├── src/
│   ├── app/
│   │   ├── App.tsx          # Componente principal e telas do sistema
│   │   └── components/      # Componentes de interface (UI)
│   └── styles/               # Arquivos de estilo global
├── guidelines/                # Diretrizes de design exportadas do Figma
├── index.html
├── package.json
└── vite.config.ts
```

## 📄 Licença

Projeto acadêmico desenvolvido para fins de estudo. Dados exibidos são fictícios.
