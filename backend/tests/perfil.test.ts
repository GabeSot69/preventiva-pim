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

describe('Perfis', () => {
  test('GET /perfis - listar todos', async () => {
    const res = await request(app).get('/app/perfis').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3); // gestor, tecnico, supervisor
  });

  test('GET /perfis/:chave - obter por chave existente', async () => {
    const res = await request(app).get('/app/perfis/gestor').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.chave).toBe('gestor');
  });

  test('GET /perfis/:chave - chave inexistente retorna 404', async () => {
    const res = await request(app).get('/app/perfis/chave_inexistente').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});


