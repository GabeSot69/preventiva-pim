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
  let perfilGestor = await perfilRepo.findOne({ where: { chave: 'gestor' } });
  if (!perfilGestor) {
    perfilGestor = perfilRepo.create({ chave: 'gestor', descricao: 'Gestor de testes' } as any) as unknown as Perfil;
    await perfilRepo.save(perfilGestor as any);
  }
  let perfilTecnico = await perfilRepo.findOne({ where: { chave: 'tecnico' } });
  if (!perfilTecnico) {
    perfilTecnico = perfilRepo.create({ chave: 'tecnico', descricao: 'Técnico de testes' } as any) as unknown as Perfil;
    await perfilRepo.save(perfilTecnico as any);
  }

  const gestor = repo.create({ nome: 'Gestor', email: 'gestor@example.com', senha_hash: hash, perfil: perfilGestor, ativo: true } as any);
  await repo.save(gestor);
  const tecnico = repo.create({ nome: 'Tecnico', email: 'tecnico@example.com', senha_hash: hash, perfil: perfilTecnico, ativo: true } as any);
  await repo.save(tecnico);

  const res = await request(app).post('/autenticacao/login').send({ email: 'gestor@example.com', senha });
  token = res.body.tokenAcesso;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});

describe('Planos CRUD', () => {
  let equipamentoId: number;
  let planoId: number;

  test('Criar equipamento para plano', async () => {
    const res = await request(app)
      .post('/equipamentos')
      .set('Authorization', `Bearer ${token}`)
      .send({ codigo: 'EQ-PLANO-01', nome: 'Bomba', tipo: 'Bomba', localizacao: 'Sala 2' });
    expect(res.status).toBe(201);
    equipamentoId = res.body.id;
  });

  test('Criar plano', async () => {
    const usuarios = await AppDataSource.getRepository(Usuario).find();
    const tecnico = usuarios.find(u => (u.perfil as any)?.chave === 'tecnico' || (u as any).perfil === 'tecnico');
    expect(tecnico).toBeDefined();

    const res = await request(app)
      .post('/planos')
      .set('Authorization', `Bearer ${token}`)
      .send({ equipamentoId, titulo: 'Manutenção Mensal', descricao: 'Verificar válvulas', periodicidadeDias: 30, tecnicoId: tecnico!.id });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    planoId = res.body.id;
  });

  test('Listar planos', async () => {
    const res = await request(app).get('/planos').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('Obter plano por id', async () => {
    const res = await request(app).get(`/planos/${planoId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(planoId);
  });
});
