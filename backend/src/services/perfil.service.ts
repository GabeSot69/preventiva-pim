import { Repository } from 'typeorm';
import { Perfil } from '../entities/Perfil';
import { AppError } from '../errors';

export class PerfilService {
  constructor(private repo: Repository<Perfil>) {}

  async listar() {
    return this.repo.find({ select: ['id', 'chave', 'descricao'] });
  }

  async obterPorChave(chave: string) {
    const perfil = await this.repo.findOne({ where: { chave }, select: ['id', 'chave', 'descricao'] });
    if (!perfil) throw new AppError(404, 'Perfil não encontrado');
    return perfil;
  }
}

