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

let token: string;

beforeAll(async () => {
  await initializeDatabase();
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();
  ({ gestorToken: token } = await seedBase());
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe('Status de Execução', () => {
  test('GET /status-execucao - listar todos', async () => {
    const res = await request(app).get('/app/status-execucao').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const chaves = res.body.map((s: any) => s.chave);
    expect(chaves).toContain('realizada');
    expect(chaves).toContain('parcial');
    expect(chaves).toContain('nao_realizada');
  });

  test('GET /status-execucao/:chave - obter por chave existente', async () => {
    const res = await request(app).get('/app/status-execucao/realizada').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.chave).toBe('realizada');
  });

  test('GET /status-execucao/:chave - chave inexistente retorna 404', async () => {
    const res = await request(app).get('/app/status-execucao/chave_inexistente').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});


