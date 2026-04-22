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

jest.setTimeout(60000);

let gestorToken: string;
let tecnicoToken: string;
let tecnicoId: number;
let equipamentoId: number;

beforeAll(async () => {
  await initializeDatabase();
  await AppDataSource.query('DROP TABLE IF EXISTS "refresh_token" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "item_checklist_execucao" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "execucao_manutencao" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "item_checklist_plano" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "plano_manutencao" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "usuario" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "perfil" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "equipamento" CASCADE');
  await AppDataSource.query('DROP TABLE IF EXISTS "status_execucao" CASCADE');
  await AppDataSource.synchronize();
  ({ gestorToken, tecnicoToken, tecnicoId } = await seedBase());
  equipamentoId = await seedEquipamento(gestorToken);
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

async function seedExecucao(planoId: number, itemIds: number[]) {
  const res = await request(app)
    .post('/app/execucoes')
    .set('Authorization', `Bearer ${tecnicoToken}`)
    .send({
      planoId,
      dataExecucao: '2024-04-20T10:00:00.000Z',
      status: 'realizada',
      conformidade: true,
      checklist: itemIds.map(id => ({ itemId: id, conforme: true })),
    });
  return res.body.id as number;
}

describe('Execuções CRUD', () => {
  test('POST /execucoes - criar com checklist', async () => {
    const planoResult = await seedPlano(gestorToken, equipamentoId, tecnicoId);
    const plano = planoResult as any;
    const items = plano.itens_checklist || (plano.data && (plano.data.itens_checklist || plano.data.itensChecklist)) || plano.itensChecklist;
    const itemIds = items.map((i: any) => i.id);

    const res = await request(app)
      .post('/app/execucoes')
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({
        planoId: plano.id,
        dataExecucao: '2024-04-20T10:00:00.000Z',
        status: 'realizada',
        conformidade: true,
        checklist: itemIds.map((id: any) => ({ itemId: id, conforme: true })),
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('POST /execucoes - status inexistente no banco retorna 400', async () => {
    const plano = await seedPlano(gestorToken, equipamentoId, tecnicoId);
    const res = await request(app)
      .post('/app/execucoes')
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ planoId: plano.id, status: 'status_inexistente', conformidade: true });
    expect(res.status).toBe(400);
  });

  test('GET /execucoes - listar', async () => {
    const planoResult = await seedPlano(gestorToken, equipamentoId, tecnicoId);
    const plano = planoResult as any;
    const items = plano.itens_checklist || plano.itensChecklist;
    await seedExecucao(plano.id, items.map((i: any) => i.id));
    const res = await request(app).get('/app/execucoes').set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /execucoes/:id - obter por id', async () => {
    const planoResult = await seedPlano(gestorToken, equipamentoId, tecnicoId);
    const plano = planoResult as any;
    const items = plano.itens_checklist || plano.itensChecklist;
    const id = await seedExecucao(plano.id, items.map((i: any) => i.id));
    const res = await request(app).get(`/app/execucoes/${id}`).set('Authorization', `Bearer ${tecnicoToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  test('PUT /execucoes/:id - atualizar', async () => {
    const planoResult = await seedPlano(gestorToken, equipamentoId, tecnicoId);
    const plano = planoResult as any;
    const items = plano.itens_checklist || plano.itensChecklist;
    const id = await seedExecucao(plano.id, items.map((i: any) => i.id));
    const res = await request(app)
      .put(`/app/execucoes/${id}`)
      .set('Authorization', `Bearer ${tecnicoToken}`)
      .send({ observacoes: 'Atualizado', status: 'parcial', conformidade: false });
    expect(res.status).toBe(200);
    expect(res.body.observacoes).toBe('Atualizado');
  });

  test('DELETE /execucoes/:id - excluir', async () => {
    const planoResult = await seedPlano(gestorToken, equipamentoId, tecnicoId);
    const plano = planoResult as any;
    const items = plano.itens_checklist || plano.itensChecklist;
    const id = await seedExecucao(plano.id, items.map((i: any) => i.id));
    const res = await request(app).delete(`/app/execucoes/${id}`).set('Authorization', `Bearer ${gestorToken}`);
    expect(res.status).toBe(204);
  });
});
