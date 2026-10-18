// Especificação OpenAPI 3 da API do Agro Sense, exibida pelo Swagger em /api/docs.
// Cada módulo novo deve acrescentar suas rotas em "paths".

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Agro Sense API',
    version: '0.2.0',
    description:
      'API REST do Agro Sense. Todas as rotas, exceto /auth/login e /health, exigem o cabeçalho ' +
      '`Authorization: Bearer <token>`. Erros seguem o formato `{ erro, codigo, detalhes? }`.',
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Sistema', description: 'Estado da API e do banco de dados' },
    { name: 'Autenticação', description: 'Login e dados do usuário logado' },
    { name: 'Talhões', description: 'Áreas de cultivo da fazenda (RN03)' },
    { name: 'Atividades', description: 'Operações de campo (RN04, RN05)' },
    { name: 'Estoque', description: 'Insumos e movimentações (RN06, RN07)' },
    { name: 'Usuários', description: 'Usuários do sistema' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Erro: {
        type: 'object',
        required: ['erro', 'codigo'],
        properties: {
          erro: { type: 'string', example: 'Saldo insuficiente para Fertilizante NPK 10-10-10' },
          codigo: { type: 'string', example: 'SALDO_INSUFICIENTE' },
          detalhes: { description: 'Informações extras, como os campos inválidos' },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Rodrigo Figueiredo' },
          email: { type: 'string', example: 'rodrigo@agrosense.com.br' },
          cargo: { type: 'string', example: 'Administrador' },
          perfil: { type: 'string', enum: ['ADMIN', 'TECNICO', 'LEITOR'] },
          ativo: { type: 'boolean', example: true },
        },
      },
      LoginEntrada: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'rodrigo@agrosense.com.br' },
          senha: { type: 'string', example: 'agrosense123' },
        },
      },
      LoginResposta: {
        type: 'object',
        properties: {
          token: { type: 'string', description: 'JWT válido por 8 horas' },
          usuario: { $ref: '#/components/schemas/Usuario' },
        },
      },
      Talhao: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Talhão A1' },
          municipio: { type: 'string', example: 'Londrina' },
          uf: { type: 'string', example: 'PR' },
          cultura: { type: 'string', example: 'Soja' },
          areaHa: { type: 'number', example: 45.2 },
          status: { type: 'string', enum: ['EM_PREPARO', 'ATIVO', 'COLHIDO'] },
          latitude: { type: 'number', nullable: true, example: -23.3045 },
          longitude: { type: 'number', nullable: true, example: -51.1696 },
          temperaturaAtual: { type: 'number', nullable: true, example: 24 },
          umidadeAtual: { type: 'number', nullable: true, example: 68 },
          climaAtualizadoEm: { type: 'string', format: 'date-time', nullable: true },
          _count: { type: 'object', properties: { atividades: { type: 'integer', example: 2 } } },
        },
      },
      TalhaoEntrada: {
        type: 'object',
        required: ['nome', 'municipio', 'uf', 'cultura', 'areaHa'],
        properties: {
          nome: { type: 'string', example: 'Talhão G7' },
          municipio: { type: 'string', example: 'Apucarana' },
          uf: { type: 'string', example: 'PR' },
          cultura: { type: 'string', example: 'Café' },
          areaHa: { type: 'number', example: 22.5, description: 'Maior que zero' },
          status: { type: 'string', enum: ['EM_PREPARO', 'ATIVO', 'COLHIDO'], default: 'EM_PREPARO' },
          latitude: { type: 'number', example: -23.55 },
          longitude: { type: 'number', example: -51.46 },
        },
      },
      Atividade: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 3 },
          tipo: { type: 'string', enum: ['PLANTIO', 'PULVERIZACAO', 'ADUBACAO', 'COLHEITA', 'IRRIGACAO'] },
          status: { type: 'string', enum: ['AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA'], description: 'Status gravado' },
          situacao: {
            type: 'string',
            enum: ['AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA'],
            description: 'Status exibido. ATRASADA é calculada pela API (RN04): não concluída e data prevista já passou',
          },
          dataPrevista: { type: 'string', format: 'date-time' },
          dataConclusao: { type: 'string', format: 'date-time', nullable: true },
          observacao: { type: 'string', nullable: true },
          talhao: { type: 'object', properties: { id: { type: 'integer' }, nome: { type: 'string', example: 'Talhão B2' } } },
          responsavel: { type: 'object', properties: { id: { type: 'integer' }, nome: { type: 'string', example: 'Carlos Mendes' } } },
        },
      },
      AtividadeEntrada: {
        type: 'object',
        required: ['tipo', 'talhaoId', 'responsavelId', 'dataPrevista'],
        properties: {
          tipo: { type: 'string', enum: ['PLANTIO', 'PULVERIZACAO', 'ADUBACAO', 'COLHEITA', 'IRRIGACAO'] },
          talhaoId: { type: 'integer', example: 1 },
          responsavelId: { type: 'integer', example: 3 },
          dataPrevista: { type: 'string', format: 'date', example: '2026-10-25' },
          observacao: { type: 'string', example: 'Aplicar no início da manhã' },
        },
      },
      Insumo: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          nome: { type: 'string', example: 'Fertilizante NPK 10-10-10' },
          categoria: { type: 'string', enum: ['SEMENTES', 'FERTILIZANTES', 'DEFENSIVOS', 'COMBUSTIVEL'] },
          unidade: { type: 'string', example: 'kg' },
          quantidade: { type: 'number', example: 250, description: 'Saldo atual; só muda por movimentação (RN06)' },
          estoqueMinimo: { type: 'number', example: 400 },
          custoUnitario: { type: 'number', example: 4.2 },
          valorEmEstoque: { type: 'number', example: 1050 },
          status: { type: 'string', enum: ['NORMAL', 'ATENCAO', 'BAIXO'], description: 'RN07: BAIXO ≤ mínimo; ATENCAO ≤ 1,5 × mínimo' },
        },
      },
      InsumoEntrada: {
        type: 'object',
        required: ['nome', 'categoria', 'unidade', 'estoqueMinimo', 'custoUnitario'],
        properties: {
          nome: { type: 'string', example: 'Adubo Foliar Boro' },
          categoria: { type: 'string', enum: ['SEMENTES', 'FERTILIZANTES', 'DEFENSIVOS', 'COMBUSTIVEL'] },
          unidade: { type: 'string', example: 'L' },
          estoqueMinimo: { type: 'number', example: 20 },
          custoUnitario: { type: 'number', example: 35.9 },
          quantidadeInicial: { type: 'number', example: 25, description: 'Só no cadastro; vira uma ENTRADA' },
        },
      },
      MovimentacaoEntrada: {
        type: 'object',
        required: ['tipo', 'quantidade'],
        properties: {
          tipo: { type: 'string', enum: ['ENTRADA', 'SAIDA'] },
          quantidade: { type: 'number', example: 50 },
          custoUnitario: { type: 'number', example: 4.5, description: 'Opcional; padrão = custo atual do insumo' },
          atividadeId: { type: 'integer', description: 'Opcional; atividade que consumiu o insumo' },
        },
      },
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          servico: { type: 'string', example: 'agro-sense-api' },
          banco: { type: 'string', example: 'conectado' },
          horario: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Valida e-mail e senha e devolve o token de acesso (RN01)',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginEntrada' } } } },
        responses: {
          '200': { description: 'Login realizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResposta' } } } },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '401': { description: 'E-mail ou senha inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '403': { description: 'Usuário inativo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Dados do usuário dono do token',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Usuário logado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          '401': { description: 'Token ausente, inválido ou expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/talhoes': {
      get: {
        tags: ['Talhões'],
        summary: 'Lista os talhões, com busca por nome ou cultura',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'busca', in: 'query', schema: { type: 'string' }, description: 'Parte do nome ou da cultura' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['EM_PREPARO', 'ATIVO', 'COLHIDO'] } },
        ],
        responses: {
          '200': { description: 'Lista de talhões', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Talhao' } } } } },
          '401': { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
      post: {
        tags: ['Talhões'],
        summary: 'Cadastra um talhão (ADMIN, TECNICO)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TalhaoEntrada' } } } },
        responses: {
          '201': { description: 'Talhão criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Talhao' } } } },
          '400': { description: 'Dados inválidos (ex.: área zero)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '403': { description: 'Perfil sem permissão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '409': { description: 'Já existe talhão com esse nome', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/talhoes/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: {
        tags: ['Talhões'],
        summary: 'Detalhe de um talhão',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Talhão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Talhao' } } } },
          '404': { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
      put: {
        tags: ['Talhões'],
        summary: 'Edita um talhão (ADMIN, TECNICO)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TalhaoEntrada' } } } },
        responses: {
          '200': { description: 'Talhão atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Talhao' } } } },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '404': { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '409': { description: 'Nome já usado por outro talhão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
      delete: {
        tags: ['Talhões'],
        summary: 'Exclui um talhão sem atividades (ADMIN)',
        security: [{ bearerAuth: [] }],
        responses: {
          '204': { description: 'Excluído' },
          '403': { description: 'Perfil sem permissão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '404': { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '409': { description: 'Talhão possui atividades (RN03)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/': {
      get: {
        tags: ['Sistema'],
        summary: 'Página inicial da API (nome, versão e links)',
        responses: { '200': { description: 'Informações da API' } },
      },
    },
    '/atividades': {
      get: {
        tags: ['Atividades'],
        summary: 'Lista atividades (atrasadas primeiro) com filtros',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'situacao', in: 'query', schema: { type: 'string', enum: ['AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ATRASADA'] } },
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['PLANTIO', 'PULVERIZACAO', 'ADUBACAO', 'COLHEITA', 'IRRIGACAO'] } },
          { name: 'talhaoId', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'Lista de atividades', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Atividade' } } } } } },
      },
      post: {
        tags: ['Atividades'],
        summary: 'Agenda uma atividade (ADMIN, TECNICO)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AtividadeEntrada' } } } },
        responses: {
          '201': { description: 'Atividade criada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Atividade' } } } },
          '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '409': { description: 'RN05: pulverização com alerta de vento forte no talhão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          '422': { description: 'Talhão inexistente ou responsável inativo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/atividades/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: { tags: ['Atividades'], summary: 'Detalhe da atividade', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Atividade', content: { 'application/json': { schema: { $ref: '#/components/schemas/Atividade' } } } }, '404': { description: 'Não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } } },
      put: {
        tags: ['Atividades'],
        summary: 'Edita uma atividade não concluída (ADMIN, TECNICO)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AtividadeEntrada' } } } },
        responses: { '200': { description: 'Atividade', content: { 'application/json': { schema: { $ref: '#/components/schemas/Atividade' } } } }, '409': { description: 'RN05: pulverização com alerta de vento forte no talhão', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }, '422': { description: 'Atividade já concluída', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } },
      },
      delete: { tags: ['Atividades'], summary: 'Exclui a atividade (ADMIN)', security: [{ bearerAuth: [] }], responses: { '204': { description: 'Excluída' }, '404': { description: 'Não encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } } },
    },
    '/atividades/{id}/status': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      patch: {
        tags: ['Atividades'],
        summary: 'Inicia ou conclui a atividade (RN04) — ADMIN, TECNICO',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['EM_ANDAMENTO', 'CONCLUIDA'] } } } } },
        },
        responses: { '200': { description: 'Atividade', content: { 'application/json': { schema: { $ref: '#/components/schemas/Atividade' } } } }, '409': { description: 'RN05: iniciar pulverização com vento forte', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }, '422': { description: 'Transição inválida (ex.: já concluída)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } },
      },
    },
    '/insumos': {
      get: {
        tags: ['Estoque'],
        summary: 'Lista insumos com status calculado (RN07)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'busca', in: 'query', schema: { type: 'string' } },
          { name: 'categoria', in: 'query', schema: { type: 'string', enum: ['SEMENTES', 'FERTILIZANTES', 'DEFENSIVOS', 'COMBUSTIVEL'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['NORMAL', 'ATENCAO', 'BAIXO'] } },
        ],
        responses: { '200': { description: 'Lista', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Insumo' } } } } } },
      },
      post: {
        tags: ['Estoque'],
        summary: 'Cadastra insumo (ADMIN, TECNICO)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/InsumoEntrada' } } } },
        responses: { '201': { description: 'Insumo criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Insumo' } } } }, '400': { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }, '409': { description: 'Nome já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } },
      },
    },
    '/insumos/resumo': {
      get: {
        tags: ['Estoque'],
        summary: 'Totais dos cards: itens, abaixo do mínimo, em atenção e valor estimado',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Resumo do estoque' } },
      },
    },
    '/insumos/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: { tags: ['Estoque'], summary: 'Detalhe do insumo', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Insumo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Insumo' } } } }, '404': { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } } },
      put: {
        tags: ['Estoque'],
        summary: 'Edita dados do insumo — não altera a quantidade (ADMIN, TECNICO)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/InsumoEntrada' } } } },
        responses: { '200': { description: 'Insumo atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Insumo' } } } }, '409': { description: 'Nome já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } },
      },
    },
    '/insumos/{id}/movimentacoes': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: { tags: ['Estoque'], summary: 'Histórico de movimentações (50 mais recentes)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Movimentações' } } },
      post: {
        tags: ['Estoque'],
        summary: 'Registra entrada ou saída em transação (RN06) — ADMIN, TECNICO',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MovimentacaoEntrada' } } } },
        responses: { '201': { description: 'Insumo com o novo saldo', content: { 'application/json': { schema: { $ref: '#/components/schemas/Insumo' } } } }, '400': { description: 'Quantidade inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } }, '422': { description: 'Saldo insuficiente (RN06)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } } },
      },
    },
    '/usuarios/responsaveis': {
      get: {
        tags: ['Usuários'],
        summary: 'Usuários ativos que podem ser responsáveis por atividades',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista com id, nome e cargo' } },
      },
    },
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica se a API e o banco de dados estão respondendo',
        responses: {
          '200': { description: 'API e banco no ar', content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } } },
          '503': { description: 'Banco de dados indisponível', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
  },
};
