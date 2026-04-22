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
import { seedBase, seedEquipamento } from './helpers/seed';

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

describe('Equipamentos CRUD', () => {
  test('POST /equipamentos - criar', async () => {
    const res = await request(app)
      .post('/app/equipamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'EQ-001', nome: 'Motor A', tipo: 'Motor', localizacao: 'Sala 1' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('GET /equipamentos - listar', async () => {
    await seedEquipamento(token);
    const res = await request(app).get('/app/equipamentos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });


  test('GET /equipamentos/:id - obter por id', async () => {
    const id = await seedEquipamento(token);
    const res = await request(app).get(`/app/equipamentos/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('PUT /equipamentos/:id - atualizar', async () => {
    const id = await seedEquipamento(token);
    const res = await request(app)
      .put(`/app/equipamentos/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Motor A v2' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Motor A v2');
  });

  test('DELETE /equipamentos/:id - excluir', async () => {
    const id = await seedEquipamento(token);
    const res = await request(app).delete(`/app/equipamentos/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  test('GET /equipamentos/:id - não encontrado retorna 404', async () => {
    const res = await request(app).get('/app/equipamentos/999999').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});


