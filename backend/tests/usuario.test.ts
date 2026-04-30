import request from 'supertest';

process.env.DB_TYPE = 'postgres';
process.env.DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.DB_PORT = process.env.TEST_DB_PORT || '5433';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'preventiva_db_test';
process.env.NODE_ENV = 'test';

import { initializeDatabase, AppDataSource } from '../src/database';
import app from '../src/server';
import { seedBase } from './helpers/seed';

jest.setTimeout(60000);

let token: string;

beforeAll(async () => {
  await initializeDatabase();
  await AppDataSource.synchronize();
  // Limpeza agressiva para Postgres
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE "${entity.tableName}" CASCADE;`);
  }
  ({ adminToken: token } = await seedBase());
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

async function criarUsuario(email: string) {
  return request(app)
    .post('/app/usuarios')
    .set('Authorization', `Bearer ${token}`)
    .send({ nome: 'Novo', email, senha: 'senha123', perfil: 'tecnico' });
}

describe('Usuários CRUD', () => {
  test('POST /usuarios - criar com perfil existente no banco', async () => {
    const res = await criarUsuario('novo@test.com');
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('novo@test.com');
  });

  test('POST /usuarios - perfil inexistente no banco retorna 400', async () => {
    const res = await request(app)
      .post('/app/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Erro', email: 'err@test.com', senha: '123', perfil: 'chave_nao_existe' });
    expect(res.status).toBe(400);
  });

  test('GET /usuarios - listar', async () => {
    const res = await request(app).get('/app/usuarios').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeDefined();
  });

  test('GET /usuarios/:id - obter por id', async () => {
    const created = await criarUsuario('novo2@test.com');
    const res = await request(app).get(`/app/usuarios/${created.body.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.body.id);
  });

  test('PUT /usuarios/:id - atualizar nome', async () => {
    const created = await criarUsuario('novo5@test.com');
    const res = await request(app)
      .put(`/app/usuarios/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Nome Atualizado' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Nome Atualizado');
  });

  test('PUT /usuarios/:id - perfil inexistente no banco retorna 400', async () => {
    const created = await criarUsuario('novoPerfil@test.com');
    const res = await request(app)
      .put(`/app/usuarios/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ perfil: 'chave_nao_existe' });
    expect(res.status).toBe(400);
  });

  test('DELETE /usuarios/:id - excluir', async () => {
    const created = await criarUsuario('novo6@test.com');
    const res = await request(app).delete(`/app/usuarios/${created.body.id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
