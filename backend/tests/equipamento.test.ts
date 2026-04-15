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
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../src/entities/Usuario';
import { Perfil } from '../src/entities/Perfil';

let token: string;

beforeAll(async () => {
  await initializeDatabase();
  await AppDataSource.dropDatabase();
  await AppDataSource.synchronize();
  const repo = AppDataSource.getRepository<Usuario>(Usuario);
  const perfilRepo = AppDataSource.getRepository<Perfil>(Perfil);
  const senha = 'senha_test';
  const hash = await bcrypt.hash(senha, 10);
  let perfil = await perfilRepo.findOne({ where: { chave: 'gestor' } });
  if (!perfil) {
    perfil = perfilRepo.create({ chave: 'gestor', descricao: 'Gestor de testes' } as any) as unknown as Perfil;
    await perfilRepo.save(perfil as any);
  }
  const u = repo.create({ nome: 'Test User', email: 'test@example.com', senha_hash: hash, perfil, ativo: true } as any);
  await repo.save(u);

  const res = await request(app).post('/autenticacao/login').send({ email: 'test@example.com', senha });
  token = res.body.tokenAcesso;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe('Equipamentos CRUD', () => {
  let createdId: number;

  test('Criar equipamento', async () => {
    const res = await request(app)
      .post('/equipamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'EQ-001', nome: 'Motor A', tipo: 'Motor', localizacao: 'Sala 1' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    createdId = res.body.id;
  });

  test('Listar equipamentos', async () => {
    const res = await request(app).get('/equipamentos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('Obter equipamento por id', async () => {
    const res = await request(app).get(`/equipamentos/${createdId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  test('Atualizar equipamento', async () => {
    const res = await request(app)
      .put(`/equipamentos/${createdId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Motor A v2' });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Motor A v2');
  });

  test('Excluir equipamento', async () => {
    const res = await request(app).delete(`/equipamentos/${createdId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });
});
