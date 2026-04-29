import * as bcrypt from 'bcrypt';
import { AppDataSource } from './index';
import { Perfil } from '../entities/Perfil';
import { StatusExecucao } from '../entities/StatusExecucao';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';

export async function runSeed() {
  const perfilRepo = AppDataSource.getRepository(Perfil);
  const statusRepo = AppDataSource.getRepository(StatusExecucao);
  const userRepo = AppDataSource.getRepository(Usuario);
  const tokenRepo = AppDataSource.getRepository(RefreshToken);

  for (const [chave, descricao] of [
    ['ti', 'TI'],
    ['gestor', 'Gestor'],
    ['supervisor', 'Supervisor'],
    ['tecnico', 'Técnico'],
  ] as const) {
    if (!await perfilRepo.findOne({ where: { chave } })) {
      await perfilRepo.save(perfilRepo.create({ chave, descricao }));
    } else {
      // Atualiza a descrição caso já exista para bater com o solicitado
      const perfil = await perfilRepo.findOne({ where: { chave } });
      if (perfil) {
        perfil.descricao = descricao;
        await perfilRepo.save(perfil);
      }
    }
  }

  for (const [chave, descricao] of [
    ['realizada', 'Realizada'],
    ['parcial', 'Parcial'],
    ['nao_realizada', 'Não Realizada'],
  ] as const) {
    if (!await statusRepo.findOne({ where: { chave } })) {
      await statusRepo.save(statusRepo.create({ chave, descricao }));
    }
  }

  if (!await userRepo.findOne({ where: { email: 'admin@example.com' } })) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', 10);
    const perfil = await perfilRepo.findOne({ where: { chave: 'gestor' } });
    await userRepo.save(userRepo.create({ nome: 'Admin', email: 'admin@example.com', senha_hash: hash, perfil: perfil!, ativo: true }));
    console.log('Usuário padrão criado: admin@example.com');
  }

  // Limpar tokens revogados e expirados
  await tokenRepo.createQueryBuilder()
    .delete()
    .where('revogado = true OR "expiraEm" < :agora', { agora: new Date() })
    .execute();
}
