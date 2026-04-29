import { Repository } from 'typeorm';
import { Usuario } from '../entities/Usuario';
import { Perfil } from '../entities/Perfil';
import { AppError } from '../errors';
import { CriarUsuarioDTO, AtualizarUsuarioDTO, RegistroUsuarioDTO } from '../dtos/usuario.dto';
import * as bcrypt from 'bcrypt';
import { PaginationUtils } from '../utils/pagination';

export class UsuarioService {
  constructor(
    private repo: Repository<Usuario>,
    private perfilRepo: Repository<Perfil>
  ) {}

  async registrar(dados: RegistroUsuarioDTO) {
    const existing = await this.repo.findOne({ where: { email: dados.email } });
    if (existing) throw new AppError(400, 'Email já cadastrado');

    const perfil = await this.perfilRepo.findOne({ where: { chave: 'tecnico' } });
    if (!perfil) throw new AppError(400, 'Perfil padrão "tecnico" não encontrado no banco de dados');

    const usuario = this.repo.create({
      nome: dados.nome,
      email: dados.email,
      senha_hash: await bcrypt.hash(dados.senha, 10),
      perfil,
      ativo: true,
      trocar_senha: false,
    });

    return (await this.repo.save(usuario)).toResponse();
  }

  async criar(dados: CriarUsuarioDTO) {
    const existing = await this.repo.findOne({ where: { email: dados.email } });
    if (existing) throw new AppError(400, 'Email já cadastrado');

    let perfil: Perfil | null = null;
    
    if (dados.perfilId) {
      perfil = await this.perfilRepo.findOne({ where: { id: dados.perfilId } });
    } else {
      const perfilChave = dados.perfil || 'tecnico';
      perfil = await this.perfilRepo.findOne({ where: { chave: perfilChave } });
    }

    if (!perfil) throw new AppError(400, `Perfil inválido`);

    const usuario = this.repo.create({
      nome: dados.nome,
      email: dados.email,
      senha_hash: await bcrypt.hash(dados.senha, 10),
      perfil,
      setor: dados.setor,
      ativo: true,
      trocar_senha: true,
    });

    return (await this.repo.save(usuario)).toResponse();
  }

  async listar(page: number = 1, limit: number = 10) {
    const skip = PaginationUtils.getSkip(page, limit);
    const [usuarios, total] = await this.repo.findAndCount({ 
      relations: ['perfil'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip
    });
    
    return PaginationUtils.createResult(usuarios.map(u => u.toResponse()), total, page, limit);
  }

  async obterPorId(id: number) {
    const u = await this.repo.findOne({ where: { id }, relations: ['perfil'] });
    if (!u) throw new AppError(404, 'Usuário não encontrado');
    return u.toResponse();
  }

  async atualizar(id: number, dados: AtualizarUsuarioDTO) {
    const u = await this.repo.findOne({ where: { id }, relations: ['perfil'] });
    if (!u) throw new AppError(404, 'Usuário não encontrado');

    if (dados.nome) u.nome = dados.nome;
    if (dados.email) {
      const existing = await this.repo.findOne({ where: { email: dados.email } });
      if (existing && existing.id !== id) throw new AppError(400, 'Email já em uso por outro usuário');
      u.email = dados.email;
    }
    if (dados.senha) u.senha_hash = await bcrypt.hash(dados.senha, 10);
    
    if (dados.perfilId) {
      const p = await this.perfilRepo.findOne({ where: { id: dados.perfilId } });
      if (!p) throw new AppError(400, `Perfil inválido`);
      u.perfil = p;
    } else if (dados.perfil) {
      const p = await this.perfilRepo.findOne({ where: { chave: dados.perfil } });
      if (!p) throw new AppError(400, `Perfil inválido: ${dados.perfil}`);
      u.perfil = p;
    }

    if (dados.setor !== undefined) u.setor = dados.setor;
    if (dados.ativo !== undefined) u.ativo = dados.ativo;

    return (await this.repo.save(u)).toResponse();
  }

  async excluir(id: number) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new AppError(404, 'Usuário não encontrado');
    await this.repo.remove(u);
    return true;
  }
}
