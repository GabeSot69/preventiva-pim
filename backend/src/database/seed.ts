import * as bcrypt from 'bcrypt';
import { AppDataSource } from './index';
import { Perfil } from '../entities/Perfil';
import { StatusExecucao } from '../entities/StatusExecucao';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';
import { Equipamento } from '../entities/Equipamento';
import { PlanoManutencao } from '../entities/PlanoManutencao';

export async function runSeed() {
  const perfilRepo = AppDataSource.getRepository(Perfil);
  const statusRepo = AppDataSource.getRepository(StatusExecucao);
  const userRepo = AppDataSource.getRepository(Usuario);
  const tokenRepo = AppDataSource.getRepository(RefreshToken);
  const eqRepo = AppDataSource.getRepository(Equipamento);
  const planoRepo = AppDataSource.getRepository(PlanoManutencao);

  // Perfis
  for (const [chave, descricao] of [
    ['admin', 'Administrador'],
    ['tecnico', 'Técnico de Manutenção'],
    ['supervisor', 'Supervisor de Manutenção'],
    ['gestor', 'Gestor de Produção'],
  ] as const) {
    const existe = await perfilRepo.findOne({ where: { chave } });
    if (!existe) {
      await perfilRepo.save(perfilRepo.create({ chave, descricao }));
    } else if (existe.descricao !== descricao) {
      existe.descricao = descricao;
      await perfilRepo.save(existe);
    }
  }

  // Status de Execução
  for (const [chave, descricao] of [
    ['realizada', 'Realizada'],
    ['parcial', 'Parcial'],
    ['nao_realizada', 'Não Realizada'],
  ] as const) {
    if (!await statusRepo.findOne({ where: { chave } })) {
      await statusRepo.save(statusRepo.create({ chave, descricao }));
    }
  }

  // Usuário Admin
  let adminUser = await userRepo.findOne({ where: { email: 'admin@system.com' } });
  if (!adminUser) {
    const hash = await bcrypt.hash('admin123', 10);
    const perfil = await perfilRepo.findOne({ where: { chave: 'admin' } });
    adminUser = await userRepo.save(userRepo.create({
      nome: 'Administrador',
      email: 'admin@system.com',
      senha_hash: hash,
      perfil: perfil!,
      ativo: true,
    }));
    console.log('Usuário admin criado: admin@system.com');
  }

  // Equipamentos
  const equipamentos = [
    { codigo: 'PRN-001', nome: 'Prensa Hidráulica 50T', tipo: 'Prensa', localizacao: 'Setor A', fabricante: 'Schuler', modelo: 'PH-50' },
    { codigo: 'CNC-042', nome: 'Torno CNC Mazak', tipo: 'Torno', localizacao: 'Setor B', fabricante: 'Mazak', modelo: 'QT-200' },
    { codigo: 'COMP-05', nome: 'Compressor de Ar Parafuso', tipo: 'Compressor', localizacao: 'Utilidades', fabricante: 'Atlas Copco', modelo: 'GA-30' },
  ];

  for (const eq of equipamentos) {
    if (!await eqRepo.findOne({ where: { codigo: eq.codigo } })) {
      await eqRepo.save(eqRepo.create(eq));
    }
  }

  // Planos de Manutenção
  const eqs = await eqRepo.find();
  if (eqs.length >= 3) {
    const hoje = new Date();

    const planos = [
      { titulo: 'Lubrificação Semanal', periodicidade_dias: 7, proxima_em: new Date(hoje.getTime() - 2 * 24 * 60 * 60 * 1000), equipamento: eqs[0], ativo: true },
      { titulo: 'Inspeção Elétrica Mensal', periodicidade_dias: 30, proxima_em: new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000), equipamento: eqs[0], ativo: true },
      { titulo: 'Troca de Filtros', periodicidade_dias: 90, proxima_em: new Date(hoje.getTime() - 10 * 24 * 60 * 60 * 1000), equipamento: eqs[1], ativo: true },
      { titulo: 'Calibração CNC', periodicidade_dias: 180, proxima_em: new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000), equipamento: eqs[1], ativo: true },
      { titulo: 'Revisão Motor Compressor', periodicidade_dias: 365, proxima_em: hoje, equipamento: eqs[2], ativo: true },
    ];

    for (const p of planos) {
      const existe = await planoRepo.findOne({ where: { titulo: p.titulo, equipamento: { id: p.equipamento.id } } });
      if (!existe) {
        await planoRepo.save(planoRepo.create(p));
      }
    }
  }

  // Limpar tokens revogados e expirados
  await tokenRepo.createQueryBuilder()
    .delete()
    .where('revogado = true OR "expiraEm" < :agora', { agora: new Date() })
    .execute();
}
