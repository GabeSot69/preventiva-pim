import { ZodTypeAny } from 'zod';
import {
  LoginSchema,
  RefreshTokenSchema,
  RegistroUsuarioSchema,
  CriarEquipamentoSchema,
  AtualizarEquipamentoSchema,
  CriarPlanoManutencaoSchema,
  AtualizarPlanoManutencaoSchema,
  CriarExecucaoManutencaoSchema,
  AtualizarExecucaoManutencaoSchema,
  CriarUsuarioSchema,
  AtualizarUsuarioSchema,
} from './dtos';
import { TrocarSenhaSchema } from './dtos/usuario.dto';

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
    }
    return res;
  }
  if (typeName === 'ZodNumber') {
    const checks = def.checks || [];
    return { type: checks.some((c: any) => c.kind === 'int') ? 'integer' : 'number' };
  }
  if (typeName === 'ZodBoolean') return { type: 'boolean' };
  if (typeName === 'ZodArray') return { type: 'array', items: parseZod(def.type) };
  if (typeName === 'ZodEnum') return { type: 'string', enum: def.values };
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    return parseZod(unwrapOptional(z).schema);
  }
  if (typeName === 'ZodEffects') return parseZod(def.schema);
  return { type: 'string' };
}

const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const chaveParam = { name: 'chave', in: 'path', required: true, schema: { type: 'string' } };
const bearer = [{ bearerAuth: [] }];

const schemas: any = {
  Login: parseZod(LoginSchema),
  RefreshToken: parseZod(RefreshTokenSchema),
  RegistroUsuario: parseZod(RegistroUsuarioSchema),
  TrocarSenha: parseZod(TrocarSenhaSchema),
  CriarEquipamento: parseZod(CriarEquipamentoSchema),
  AtualizarEquipamento: parseZod(AtualizarEquipamentoSchema),
  CriarPlanoManutencao: parseZod(CriarPlanoManutencaoSchema),
  AtualizarPlanoManutencao: parseZod(AtualizarPlanoManutencaoSchema),
  CriarExecucaoManutencao: parseZod(CriarExecucaoManutencaoSchema),
  AtualizarExecucaoManutencao: parseZod(AtualizarExecucaoManutencaoSchema),
  CriarUsuario: parseZod(CriarUsuarioSchema),
  AtualizarUsuario: parseZod(AtualizarUsuarioSchema),
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
    '/app/auth/login': {
      post: { tags: ['Autenticação'], summary: 'Login', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Login' } } } }, responses: { '200': { description: 'OK' }, '401': { description: 'Credenciais inválidas' } } },
    },
    '/app/auth/registrar': {
      post: { tags: ['Autenticação'], summary: 'Registrar usuário técnico', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegistroUsuario' } } } }, responses: { '201': { description: 'Criado' }, '400': { description: 'Dados inválidos ou perfil não encontrado' } } },
    },
    '/app/auth/refresh': {
      post: { tags: ['Autenticação'], summary: 'Renovar token de acesso', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshToken' } } } }, responses: { '200': { description: 'OK' }, '401': { description: 'Token inválido' } } },
    },
    '/app/auth/logout': {
      post: { tags: ['Autenticação'], summary: 'Logout', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshToken' } } } }, responses: { '204': { description: 'No Content' } } },
    },
    '/app/auth/trocar-senha': {
      post: { tags: ['Autenticação'], summary: 'Trocar senha (obrigatório no primeiro login)', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TrocarSenha' } } } }, responses: { '204': { description: 'Senha alterada' }, '401': { description: 'Senha atual incorreta' } } },
    },
    '/app/equipamentos': {
      get: { tags: ['Equipamentos'], summary: 'Listar equipamentos ativos', security: bearer, responses: { '200': { description: 'OK' } } },
      post: { tags: ['Equipamentos'], summary: 'Criar equipamento', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarEquipamento' } } } }, responses: { '201': { description: 'Criado' } } },
    },
    '/app/equipamentos/{id}': {
      get: { tags: ['Equipamentos'], summary: 'Obter equipamento por id', security: bearer, parameters: [idParam], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Equipamentos'], summary: 'Atualizar equipamento', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarEquipamento' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Equipamentos'], summary: 'Excluir equipamento', security: bearer, parameters: [idParam], responses: { '204': { description: 'No Content' } } },
    },
    '/app/planos': {
      get: { tags: ['Planos'], summary: 'Listar planos', security: bearer, parameters: [
        { name: 'inicio', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'fim', in: 'query', schema: { type: 'string', format: 'date-time' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['atrasado', 'em_dia'] } },
        { name: 'equipamentoId', in: 'query', schema: { type: 'integer' } },
        { name: 'ativo', in: 'query', description: 'Filtrar por ativo (padrão: true)', schema: { type: 'boolean' } },
      ], responses: { '200': { description: 'OK' } } },
      post: { tags: ['Planos'], summary: 'Criar plano', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarPlanoManutencao' } } } }, responses: { '201': { description: 'Criado' } } },
    },
    '/app/planos/{id}': {
      get: { tags: ['Planos'], summary: 'Obter plano por id', security: bearer, parameters: [idParam], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Planos'], summary: 'Atualizar plano', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarPlanoManutencao' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Planos'], summary: 'Excluir plano', security: bearer, parameters: [idParam], responses: { '204': { description: 'No Content' } } },
    },
    '/app/execucoes': {
      get: { tags: ['Execuções'], summary: 'Listar execuções', security: bearer, responses: { '200': { description: 'OK' } } },
      post: { tags: ['Execuções'], summary: 'Criar execução', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarExecucaoManutencao' } } } }, responses: { '201': { description: 'Criado' } } },
    },
    '/app/execucoes/{id}': {
      get: { tags: ['Execuções'], summary: 'Obter execução por id', security: bearer, parameters: [idParam], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Execuções'], summary: 'Atualizar execução', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarExecucaoManutencao' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Execuções'], summary: 'Excluir execução', security: bearer, parameters: [idParam], responses: { '204': { description: 'No Content' } } },
    },
    '/app/dashboard/metricas': {
      get: { tags: ['Dashboard'], summary: 'Métricas do dashboard', security: bearer, responses: { '200': { description: 'OK' } } },
    },
    '/app/dashboard/atrasadas': {
      get: { tags: ['Dashboard'], summary: 'Planos atrasados', security: bearer, responses: { '200': { description: 'OK' } } },
    },
    '/app/dashboard/disponibilidade': {
      get: { tags: ['Dashboard'], summary: 'Disponibilidade dos equipamentos', security: bearer, responses: { '200': { description: 'OK' } } },
    },
    '/app/usuarios': {
      get: { tags: ['Usuários'], summary: 'Listar usuários', security: bearer, responses: { '200': { description: 'OK' } } },
      post: { tags: ['Usuários'], summary: 'Criar usuário', security: bearer, requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CriarUsuario' } } } }, responses: { '201': { description: 'Criado' } } },
    },
    '/app/usuarios/{id}': {
      get: { tags: ['Usuários'], summary: 'Obter usuário por id', security: bearer, parameters: [idParam], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
      put: { tags: ['Usuários'], summary: 'Atualizar usuário', security: bearer, parameters: [idParam], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AtualizarUsuario' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Usuários'], summary: 'Excluir usuário', security: bearer, parameters: [idParam], responses: { '204': { description: 'No Content' } } },
    },
    '/app/perfis': {
      get: { tags: ['Perfis'], summary: 'Listar perfis de usuário', security: bearer, responses: { '200': { description: 'OK' } } },
    },
    '/app/perfis/{chave}': {
      get: { tags: ['Perfis'], summary: 'Obter perfil por chave', security: bearer, parameters: [chaveParam], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
    },
    '/app/status-execucao': {
      get: { tags: ['Status de Execução'], summary: 'Listar status de execução', security: bearer, responses: { '200': { description: 'OK' } } },
    },
    '/app/status-execucao/{chave}': {
      get: { tags: ['Status de Execução'], summary: 'Obter status por chave', security: bearer, parameters: [chaveParam], responses: { '200': { description: 'OK' }, '404': { description: 'Não encontrado' } } },
    },
  },
};

export default swaggerSpec;
