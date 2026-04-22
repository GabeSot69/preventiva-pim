import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';
import type { JwtPayload, RefreshTokenPayload } from '../types';
import { AppError } from '../errors';
import { JWT_SECRET, JWT_EXP, REFRESH_EXP_DAYS } from '../config/jwt';

export class AuthService {
  constructor(
    private usuarioRepo: Repository<Usuario>,
    private tokenRepo: Repository<RefreshToken>
  ) {}

  async login(email: string, senha: string) {
    const usuario = await this.usuarioRepo.findOne({ 
      where: { email }, 
      relations: ['perfil'],
      select: ['id', 'nome', 'email', 'senha_hash', 'ativo', 'trocar_senha'] 
    });
    
    if (!usuario) throw new AppError(401, 'Credenciais inválidas');
    if (!usuario.ativo) throw new AppError(401, 'Usuário inativo');

    // Garante que a senha_hash existe antes de comparar
    if (!usuario.senha_hash) throw new AppError(500, 'Erro interno: senha não configurada');

    const valido = await bcrypt.compare(senha, usuario.senha_hash);
    if (!valido) throw new AppError(401, 'Credenciais inválidas');

    const perfilChave = usuario.perfil?.chave;
    const payload: JwtPayload = {
      sub: usuario.id,
      perfil: perfilChave!,
      nome: usuario.nome,
      ativo: true,
      trocarSenha: usuario.trocar_senha || undefined,
    };
    const tokenAcesso = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP as StringValue });

    const payloadRefresh: RefreshTokenPayload = { sub: usuario.id, jti: randomBytes(16).toString('hex') };
    const valorRefresh = jwt.sign(payloadRefresh, JWT_SECRET, { expiresIn: `${REFRESH_EXP_DAYS}d` });
    const expiraEm = new Date(Date.now() + REFRESH_EXP_DAYS * 24 * 60 * 60 * 1000);

    await this.tokenRepo.save(this.tokenRepo.create({ token: valorRefresh, usuario, expiraEm, revogado: false }));

    return {
      tokenAcesso,
      refreshToken: valorRefresh,
      trocarSenha: usuario.trocar_senha || false,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: perfilChave },
    };
  }

  async refresh(refreshToken: string) {
    try {
      jwt.verify(refreshToken, JWT_SECRET);
    } catch {
      throw new AppError(401, 'Refresh token inválido');
    }

    const armazenado = await this.tokenRepo.findOne({ where: { token: refreshToken }, relations: ['usuario', 'usuario.perfil'] });
    if (!armazenado || armazenado.revogado) throw new AppError(401, 'Refresh token inválido ou revogado');
    if (armazenado.expiraEm && armazenado.expiraEm < new Date()) throw new AppError(401, 'Refresh token expirado');

    const usuario = armazenado.usuario;
    if (!usuario || !usuario.ativo) throw new AppError(401, 'Usuário inválido');

    const perfilChave = usuario.perfil?.chave;
    const tokenAcesso = jwt.sign(
      { sub: usuario.id, perfil: perfilChave, nome: usuario.nome, ativo: true, trocarSenha: usuario.trocar_senha || undefined } as JwtPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXP as StringValue }
    );

    armazenado.revogado = true;
    armazenado.revogadoEm = new Date();
    await this.tokenRepo.save(armazenado);

    const novoValorRefresh = jwt.sign(
      { sub: usuario.id, jti: randomBytes(16).toString('hex') } as RefreshTokenPayload,
      JWT_SECRET,
      { expiresIn: `${REFRESH_EXP_DAYS}d` }
    );
    await this.tokenRepo.save(this.tokenRepo.create({
      token: novoValorRefresh,
      usuario,
      expiraEm: new Date(Date.now() + REFRESH_EXP_DAYS * 24 * 60 * 60 * 1000),
      revogado: false
    }));

    return { tokenAcesso, refreshToken: novoValorRefresh };
  }

  async revoke(refreshToken: string) {
    const armazenado = await this.tokenRepo.findOne({ where: { token: refreshToken } });
    if (!armazenado) return false;
    armazenado.revogado = true;
    armazenado.revogadoEm = new Date();
    await this.tokenRepo.save(armazenado);
    return true;
  }

  async trocarSenha(usuarioId: number, senhaAtual: string, novaSenha: string) {
    const usuario = await this.usuarioRepo.findOne({ 
      where: { id: usuarioId },
      select: ['id', 'senha_hash', 'trocar_senha']
    });
    if (!usuario) throw new AppError(400, 'Usuário inválido');

    const valido = await bcrypt.compare(senhaAtual, usuario.senha_hash);
    if (!valido) throw new AppError(401, 'Senha atual incorreta');

    usuario.senha_hash = await bcrypt.hash(novaSenha, 10);
    usuario.trocar_senha = false;
    await this.usuarioRepo.save(usuario);
  }
}
