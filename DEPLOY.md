# Publicação do Agro Sense

O repositório tem um arquivo `render.yaml` (Blueprint do Render) que cria, de uma vez, o sistema no plano gratuito do [Render](https://render.com):

| Recurso | Nome no Render | O que é |
| --- | --- | --- |
| Banco | `agro-sense-db` | PostgreSQL 16 |
| Serviço web | `agro-sense` | A API (Express + Prisma), que também entrega o site (build do frontend) |

Como o site e a API ficam **no mesmo endereço**, não há URL da API nem CORS para configurar: o frontend chama `/api` no próprio domínio.

## Passo a passo (uma vez só)

1. Crie uma conta em <https://render.com> usando **Sign in with GitHub** (conta dona do repositório).
2. No painel, clique em **New → Blueprint**.
3. Escolha o repositório **davisiqueira2013/agro-sense** e a branch **main**.
4. O Render mostra os dois recursos do `render.yaml`. Clique em **Apply** (ou **Deploy Blueprint**).
5. Espere o primeiro deploy terminar (de 5 a 10 minutos). Ao subir pela primeira vez, o serviço:
   - compila o frontend e o backend;
   - aplica as migrations no banco (`prisma migrate deploy`);
   - carrega os dados de exemplo **só se o banco estiver vazio** (`seed --se-vazio`);
   - responde em `/api/health`.
6. Abra o serviço **agro-sense** e copie o endereço que aparece no topo (algo como `https://agro-sense.onrender.com`; se o nome já existir, o Render acrescenta um sufixo). Esse é o link do sistema.

Login de demonstração: `rodrigo@agrosense.com.br` / `agrosense123` (perfil Administrador). Os outros usuários do seed usam a mesma senha.

O `JWT_SECRET` é gerado pelo Render e a `DATABASE_URL` vem do banco criado pelo Blueprint; nada precisa ser digitado.

## Depois de publicado

- **Atualizações:** cada merge na `main` gera um novo deploy automático.
- **Documentação da API:** `https://<endereço>/api/docs`.
- **Primeiro acesso lento:** no plano gratuito o serviço "dorme" após 15 minutos sem uso, e a primeira requisição depois disso leva cerca de 1 minuto. **Antes de apresentar, abra o link uns minutos antes.**
- **Validade do banco gratuito:** o PostgreSQL gratuito do Render expira 30 dias depois de criado. Publique perto da data da apresentação.
- **Voltar aos dados de exemplo:** rode localmente, com a *External Database URL* do banco (aba **Info** do `agro-sense-db`) no `DATABASE_URL` do `backend/.env`: `npm run db:seed`.
