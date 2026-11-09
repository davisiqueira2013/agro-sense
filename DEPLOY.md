# Publicação do Agro Sense

O repositório tem um arquivo `render.yaml` (Blueprint do Render) que cria, de uma vez, os três pedaços do sistema no plano gratuito do [Render](https://render.com):

| Recurso | Nome no Render | O que é |
| --- | --- | --- |
| Banco | `agro-sense-db` | PostgreSQL 16 |
| API | `agro-sense-api` | Backend Node.js (Express + Prisma) |
| Frontend | `agro-sense-web` | Site estático gerado pelo Vite |

## Passo a passo (uma vez só)

1. Crie uma conta em <https://render.com> usando **Sign in with GitHub** (conta dona do repositório).
2. No painel, clique em **New → Blueprint**.
3. Escolha o repositório **davisiqueira2013/agro-sense** e a branch **main**.
4. O Render mostra os três recursos do `render.yaml`. Clique em **Apply** (ou **Deploy Blueprint**).
5. Espere o primeiro deploy terminar (de 5 a 10 minutos). A API, ao subir pela primeira vez:
   - aplica as migrations no banco (`prisma migrate deploy`);
   - carrega os dados de exemplo **só se o banco estiver vazio** (`seed --se-vazio`);
   - responde em `/api/health`.
6. Abra o serviço **agro-sense-web** e copie o endereço (algo como `https://agro-sense-web.onrender.com`). Esse é o link do sistema.

Login de demonstração: `rodrigo@agrosense.com.br` / `agrosense123` (perfil Administrador). Os outros usuários do seed usam a mesma senha.

Os endereços (`VITE_API_URL` no frontend e `CORS_ORIGIN` na API) são preenchidos sozinhos pelo Blueprint, a partir do nome de cada serviço. O `JWT_SECRET` é gerado pelo Render.

## Depois de publicado

- **Atualizações:** cada merge na `main` gera um novo deploy automático dos dois serviços.
- **Documentação da API:** `https://<endereço-da-api>/api/docs`.
- **Primeiro acesso lento:** no plano gratuito a API "dorme" após 15 minutos sem uso, e a primeira requisição depois disso leva cerca de 1 minuto. **Antes de apresentar, abra o link do sistema uns minutos antes** para "acordar" a API.
- **Validade do banco gratuito:** o PostgreSQL gratuito do Render expira 30 dias depois de criado. Para a apresentação basta; depois, dá para recriar o Blueprint ou migrar para um plano pago.
- **Voltar aos dados de exemplo:** no painel da API, em **Shell** (planos pagos) ou rodando localmente com a `DATABASE_URL` externa do banco: `npm --prefix backend run db:seed`.
