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
import { seedBase, seedEquipamento, seedPlano } from './helpers/seed';

jest.setTimeout(60000); // Aumentado para evitar timeouts em CI/ambiente local lento

let token: string;
let tecnicoId: number;
let equipamentoId: number;

beforeAll(async () => {
  await initializeDatabase();
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();
  ({ gestorToken: token, tecnicoId } = await seedBase());
  equipamentoId = await seedEquipamento(token);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe('Planos CRUD', () => {
  test('POST /planos - criar com checklist', async () => {
    const res = await request(app)
      .post('/app/planos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        equipamentoId,
        titulo: 'Manutenção Mensal',
        periodicidadeDias: 30,
        tecnicoId,
        itensChecklist: [{ descricao: 'Verificar óleo', ordem: 1 }],
      });
    expect(res.status).toBe(201);
  });

  test('GET /planos - listar', async () => {
    await seedPlano(token, equipamentoId, tecnicoId);
    const res = await request(app).get('/app/planos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /planos/:id - obter por id', async () => {
    const { id } = await seedPlano(token, equipamentoId, tecnicoId);
    const res = await request(app).get(`/app/planos/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('PUT /planos/:id - atualizar', async () => {
    const { id } = await seedPlano(token, equipamentoId, tecnicoId);
    const res = await request(app)
      .put(`/app/planos/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Plano Atualizado' });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Plano Atualizado');
  });

  test('DELETE /planos/:id - excluir', async () => {
    const { id } = await seedPlano(token, equipamentoId, tecnicoId);
    const res = await request(app).delete(`/app/planos/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
