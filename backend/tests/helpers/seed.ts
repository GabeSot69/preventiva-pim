import request from 'supertest';
import { AppDataSource } from '../../src/database';
import { Perfil } from '../../src/entities/Perfil';
import { StatusExecucao } from '../../src/entities/StatusExecucao';
import { Usuario } from '../../src/entities/Usuario';
import app from '../../src/server';
import * as bcrypt from 'bcrypt';

export async function seedBase() {
  const perfilRepo = AppDataSource.getRepository(Perfil);
  const statusRepo = AppDataSource.getRepository(StatusExecucao);
  const userRepo = AppDataSource.getRepository(Usuario);

  const hash = await bcrypt.hash('senha_test', 10);

  // Usa upsert ou verifica existência para evitar erros de duplicidade se a limpeza falhar
  let admin = await perfilRepo.findOne({ where: { chave: 'admin' } });
  if (!admin) admin = await perfilRepo.save(perfilRepo.create({ chave: 'admin', descricao: 'Administrador' }));

  let gestor = await perfilRepo.findOne({ where: { chave: 'gestor' } });
  if (!gestor) gestor = await perfilRepo.save(perfilRepo.create({ chave: 'gestor', descricao: 'Gestor' }));

  let tecnico = await perfilRepo.findOne({ where: { chave: 'tecnico' } });
  if (!tecnico) tecnico = await perfilRepo.save(perfilRepo.create({ chave: 'tecnico', descricao: 'Técnico' }));

  let supervisor = await perfilRepo.findOne({ where: { chave: 'supervisor' } });
  if (!supervisor) await perfilRepo.save(perfilRepo.create({ chave: 'supervisor', descricao: 'Supervisor' }));

  for (const chave of ['realizada', 'parcial', 'nao_realizada']) {
    const exists = await statusRepo.findOne({ where: { chave } });
    if (!exists) await statusRepo.save(statusRepo.create({ chave, descricao: chave }));
  }

  const aEmail = `admin_${Date.now()}@test.com`;
  const gEmail = `gestor_${Date.now()}@test.com`;
  const tEmail = `tecnico_${Date.now()}@test.com`;

  await userRepo.save(
    userRepo.create({ nome: 'Admin', email: aEmail, senha_hash: hash, perfil: admin, ativo: true } as any)
  );
  const gestorUser = await userRepo.save(
    userRepo.create({ nome: 'Gestor', email: gEmail, senha_hash: hash, perfil: gestor, ativo: true } as any)
  );
  const tecnicoUser = await userRepo.save(
    userRepo.create({ nome: 'Tecnico', email: tEmail, senha_hash: hash, perfil: tecnico, ativo: true } as any)
  );

  const adminRes = await request(app).post('/app/auth/login').send({ email: aEmail, senha: 'senha_test' });
  const gestorRes = await request(app).post('/app/auth/login').send({ email: gEmail, senha: 'senha_test' });
  const tecnicoRes = await request(app).post('/app/auth/login').send({ email: tEmail, senha: 'senha_test' });

  return {
    adminToken: adminRes.body.tokenAcesso as string,
    gestorToken: gestorRes.body.tokenAcesso as string,
    tecnicoToken: tecnicoRes.body.tokenAcesso as string,
    gestorId: (gestorUser as any).id as number,
    tecnicoId: (tecnicoUser as any).id as number,
    gEmail,
    tEmail,
    aEmail
  };
}

export async function seedEquipamento(token: string) {
  const res = await request(app)
    .post('/app/equipamentos')
    .set('Authorization', `Bearer ${token}`)
    .send({ codigo: `EQ-${Date.now()}-${Math.random()}`, nome: 'Motor Teste', tipo: 'Motor', localizacao: 'Sala 1' });
  return res.body.id as number;
}

export async function seedPlano(token: string, equipamentoId: number, tecnicoId: number) {
  const res = await request(app)
    .post('/app/planos')
    .set('Authorization', `Bearer ${token}`)
    .send({
      equipamentoId,
      titulo: 'Plano Teste',
      periodicidadeDias: 30,
      tecnicoId,
      itensChecklist: [
        { descricao: 'Item 1', ordem: 1 },
        { descricao: 'Item 2', ordem: 2 },
      ],
    });
  // Trata o novo formato paginado se necessário, mas o POST geralmente retorna o objeto direto
  return res.body as { id: number; itens_checklist: { id: number }[] };
}
