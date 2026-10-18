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
