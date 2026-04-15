import { ZodTypeAny } from 'zod';
import { 
  LoginSchema, 
  RefreshTokenSchema, 
  CriarEquipamentoSchema, 
  AtualizarEquipamentoSchema,
  CriarPlanoManutencaoSchema, 
  AtualizarPlanoManutencaoSchema,
  CriarExecucaoManutencaoSchema,
  AtualizarExecucaoManutencaoSchema
} from './dtos';

function getTypeName(z: any): string | undefined {
  if (z._def && z._def.typeName) return z._def.typeName;
  if (z.constructor && z.constructor.name) {
    const name = z.constructor.name;
    if (name.startsWith('Zod')) return name;
  }
  return undefined;
}

function unwrapOptional(schema: any) {
  let isOptional = false;
  let s = schema;
  while (s && s._def) {
    const typeName = getTypeName(s);
    if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
      if (typeName === 'ZodOptional' || typeName === 'ZodNullable') isOptional = true;
      s = s._def.innerType || s._def.type;
    } else {
      break;
    }
  }
  return { schema: s, isOptional };
}

function parseZod(z: ZodTypeAny): any {
  if (!z || !(z as any)._def) return { type: 'string' };
  
  const def = (z as any)._def;
  const typeName = getTypeName(z);
  
  if (!typeName) return { type: 'string' };

  if (typeName === 'ZodObject') {
    const shape = def.shape;
    const properties: any = {};
    const required: string[] = [];
    for (const key of Object.keys(shape)) {
      const raw = shape[key];
      const { schema: inner, isOptional } = unwrapOptional(raw);
      properties[key] = parseZod(inner);
      if (!isOptional) required.push(key);
    }
    const res: any = { type: 'object', properties };
    if (required.length) res.required = required;
    return res;
  }

  if (typeName === 'ZodString') {
    const checks = def.checks || [];
    const res: any = { type: 'string' };
    for (const c of checks) {
      if (c.kind === 'email') res.format = 'email';
      if (c.kind === 'min' && typeof c.value === 'number') res.minLength = c.value;
      if (c.kind === 'regex') res.pattern = c.regex?.toString?.() || undefined;
    }
    return res;
  }

  if (typeName === 'ZodNumber') {
    const checks = def.checks || [];
    let isInt = false;
    if (checks) {
      for (const c of checks) if (c.kind === 'int') isInt = true;
    }
    return { type: isInt ? 'integer' : 'number' };
  }

  if (typeName === 'ZodBoolean') return { type: 'boolean' };
  
  if (typeName === 'ZodArray') {
    return { type: 'array', items: parseZod(def.type) };
  }
  
  if (typeName === 'ZodEnum') {
    return { type: 'string', enum: def.values };
  }

  if (typeName === 'ZodLiteral') return { const: def.value, type: typeof def.value };
  
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    const { schema: inner } = unwrapOptional(z);
    return parseZod(inner);
  }

  if (typeName === 'ZodEffects') {
    return parseZod(def.schema);
  }

  return { type: 'string' };
}

const schemas: any = {
  Login: parseZod(LoginSchema),
  RefreshToken: parseZod(RefreshTokenSchema),
  CriarEquipamento: parseZod(CriarEquipamentoSchema),
  AtualizarEquipamento: parseZod(AtualizarEquipamentoSchema),
  CriarPlanoManutencao: parseZod(CriarPlanoManutencaoSchema),
  AtualizarPlanoManutencao: parseZod(AtualizarPlanoManutencaoSchema),
  CriarExecucaoManutencao: parseZod(CriarExecucaoManutencaoSchema),
  AtualizarExecucaoManutencao: parseZod(AtualizarExecucaoManutencaoSchema),
};

const swaggerSpec = {
  openapi: '3.0.0',
  info: { title: 'Preventiva PIM API', version: '1.0.0', description: 'Documentação da API do Sistema de Manutenção Preventiva' },
  servers: [{ url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }],
  components: {
    schemas,
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/autenticacao/login': {
      post: { tags: ['Autenticação'], summary: 'Login', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } }, required: true }, responses: { '200': { description: 'OK' }, '400': { description: 'Dados inválidos' } } }
    },
    '/autenticacao/refresh': {
      post: { tags: ['Autenticação'], summary: 'Renovar token', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshToken' } } }, required: true }, responses: { '200': { description: 'OK' }, '400': { description: 'Dados inválidos' } } }
    },
    '/autenticacao/logout': {
      post: { tags: ['Autenticação'], summary: 'Logout', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshToken' } } }, required: true }, responses: { '204': { description: 'No Content' }, '400': { description: 'Dados inválidos' } } }
    },
    '/equipamentos': {
      get: { tags: ['Equipamentos'], summary: 'Listar equipamentos', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Equipamentos'], summary: 'Criar equipamento', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarEquipamento' } } }, required: true }, responses: { '201': { description: 'Criado' } } }
    },
    '/equipamentos/{id}': {
      get: { tags: ['Equipamentos'], summary: 'Obter equipamento por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Equipamentos'], summary: 'Atualizar equipamento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarEquipamento' } } }, required: true }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Equipamentos'], summary: 'Excluir equipamento', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'No Content' } } }
    },
    '/planos': {
      get: { tags: ['Planos'], summary: 'Listar planos', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Planos'], summary: 'Criar plano', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarPlanoManutencao' } } }, required: true }, responses: { '201': { description: 'Criado' } } }
    },
    '/planos/{id}': {
      get: { tags: ['Planos'], summary: 'Obter plano por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Planos'], summary: 'Atualizar plano', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarPlanoManutencao' } } }, required: true }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Planos'], summary: 'Excluir plano', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'No Content' } } }
    },
    '/execucoes': {
      get: { tags: ['Execuções'], summary: 'Listar execuções', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Execuções'], summary: 'Criar execução', security: [{ bearerAuth: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarExecucaoManutencao' } } }, required: true }, responses: { '201': { description: 'Criado' } } }
    },
    '/execucoes/{id}': {
      get: { tags: ['Execuções'], summary: 'Obter execução por id', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Execuções'], summary: 'Atualizar execução', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarExecucaoManutencao' } } }, required: true }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Execuções'], summary: 'Excluir execução', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '204': { description: 'No Content' } } }
    }
  }
};

export default swaggerSpec;
