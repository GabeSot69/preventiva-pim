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

let gestorToken: string;
let tecnicoToken: string;
let gEmail: string;
let tEmail: string;

beforeAll(async () => {
  await initializeDatabase();
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    await AppDataSource.query(`TRUNCATE "${entity.tableName}" CASCADE;`);
  }
  await AppDataSource.synchronize();
  const seedData = await seedBase();
  gestorToken = seedData.gestorToken;
  tecnicoToken = seedData.tecnicoToken;
  gEmail = seedData.gEmail;
  tEmail = seedData.tEmail;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe('Autenticação', () => {
  test('POST /autenticacao/registrar - sucesso', async () => {
    const res = await request(app)
      .post('/app/auth/registrar')
      .send({ nome: 'Novo', email: `novo_${Date.now()}@test.com`, senha: 'senha123' });
    expect(res.status).toBe(201);
  });

  test('POST /autenticacao/login - sucesso', async () => {
    const res = await request(app)
      .post('/app/auth/login')
      .send({ email: tEmail, senha: 'senha_test' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tokenAcesso');
  });

  test('POST /autenticacao/login - credenciais inválidas retorna 401', async () => {
    const res = await request(app)
      .post('/app/auth/login')
      .send({ email: tEmail, senha: 'senha_errada' });
    expect(res.status).toBe(401);
  });

  test('POST /autenticacao/refresh - renova token', async () => {
    const loginRes = await request(app).post('/app/auth/login').send({ email: tEmail, senha: 'senha_test' });
    const res = await request(app)
      .post('/app/auth/refresh')
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tokenAcesso');
  });

  test('POST /autenticacao/logout - revoga refresh token', async () => {
    const loginRes = await request(app).post('/app/auth/login').send({ email: tEmail, senha: 'senha_test' });
    const res = await request(app)
      .post('/app/auth/logout')
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(res.status).toBe(204);
  });

  test('GET /usuarios - técnico recebe 403', async () => {
    const res = await request(app)
      .get('/app/usuarios')
      .set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Troca de senha', () => {
  test('Login de usuário criado pelo gestor retorna trocarSenha: true', async () => {
    await request(app)
      .post('/app/usuarios')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ nome: 'Novo Tec', email: 'novo_tec@test.com', senha: 'senha_temp', perfil: 'tecnico' });

    const loginRes = await request(app)
      .post('/app/auth/login')
      .send({ email: 'novo_tec@test.com', senha: 'senha_temp' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.trocarSenha).toBe(true);
  });

  test('POST /app/auth/trocar-senha - sucesso', async () => {
    const loginRes = await request(app)
      .post('/app/auth/login')
      .send({ email: 'novo_tec@test.com', senha: 'senha_temp' });
    
    const token = loginRes.body.tokenAcesso;

    const res = await request(app)
      .post('/app/auth/trocar-senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senhaAtual: 'senha_temp', novaSenha: 'nova_senha123' });
    expect(res.status).toBe(204);
  });

  test('Login após troca retorna trocarSenha: false', async () => {
    const res = await request(app)
      .post('/app/auth/login')
      .send({ email: 'novo_tec@test.com', senha: 'nova_senha123' });
    expect(res.status).toBe(200);
    expect(res.body.trocarSenha).toBe(false);
  });
});
