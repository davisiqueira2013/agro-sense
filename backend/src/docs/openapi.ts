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
  tags: [{ name: 'Sistema', description: 'Estado da API e do banco de dados' }],
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
