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
