import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../database';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';
import type { JwtPayload, RefreshTokenPayload } from '../types';
import { AppError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui_mude_em_producao';
const JWT_EXP: string = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXP_DAYS = parseInt(process.env.REFRESH_EXPIRES_DAYS || '7', 10);

export class AuthService {
	private usuarioRepo: Repository<Usuario>;
	private tokenRepo: Repository<RefreshToken>;

	constructor() {
		this.usuarioRepo = AppDataSource.getRepository(Usuario);
		this.tokenRepo = AppDataSource.getRepository(RefreshToken);
	}

	async login(email: string, senha: string) {
		const usuario = await this.usuarioRepo.findOne({ where: { email } });
		if (!usuario) throw new AppError(401, 'Credenciais inválidas');
		if (!usuario.ativo) throw new AppError(401, 'Usuário inativo');
		const valido = await bcrypt.compare(senha, usuario.senha_hash);
		if (!valido) throw new AppError(401, 'Credenciais inválidas');

		const payload: JwtPayload = { sub: usuario.id, perfil: usuario.perfil?.chave || (usuario as any).perfil, nome: usuario.nome };
		const tokenAcesso = jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXP as StringValue });

		const payloadRefresh: RefreshTokenPayload = { sub: usuario.id, jti: randomBytes(16).toString('hex') };
		const valorTokenAtualizacao = jwt.sign(payloadRefresh, JWT_SECRET as string, { expiresIn: `${REFRESH_EXP_DAYS}d` });

		const expiraEm = new Date(Date.now() + REFRESH_EXP_DAYS * 24 * 60 * 60 * 1000);

		const ta = this.tokenRepo.create({ token: valorTokenAtualizacao, usuario, expiraEm, revogado: false });
		await this.tokenRepo.save(ta);

		return {
			tokenAcesso,
			refreshToken: valorTokenAtualizacao,
			usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil?.chave || (usuario as any).perfil },
		};
	}

	async refresh(refreshToken: string) {
		if (!refreshToken) throw new AppError(400, 'Refresh token não informado');
		let payload: RefreshTokenPayload;
		try {
			payload = jwt.verify(refreshToken, JWT_SECRET) as unknown as RefreshTokenPayload;
		} catch (err) {
			throw new AppError(401, 'Refresh token inválido');
		}

		const armazenado = await this.tokenRepo.findOne({ where: { token: refreshToken }, relations: ['usuario'] });
		if (!armazenado || armazenado.revogado) throw new AppError(401, 'Refresh token inválido ou revogado');
		if (armazenado.expiraEm && armazenado.expiraEm < new Date()) throw new AppError(401, 'Refresh token expirado');

		const usuario = armazenado.usuario;
		if (!usuario || !usuario.ativo) throw new AppError(401, 'Usuário inválido');

		const payloadNovo: JwtPayload = { sub: usuario.id, perfil: usuario.perfil?.chave || (usuario as any).perfil, nome: usuario.nome };
		const tokenAcesso = jwt.sign(payloadNovo, JWT_SECRET as string, { expiresIn: JWT_EXP as StringValue });

		armazenado.revogado = true;
		armazenado.revogadoEm = new Date();
		await this.tokenRepo.save(armazenado);

		const payloadRefreshNovo: RefreshTokenPayload = { sub: usuario.id, jti: randomBytes(16).toString('hex') };
		const novoValorRefresh = jwt.sign(payloadRefreshNovo, JWT_SECRET as string, { expiresIn: `${REFRESH_EXP_DAYS}d` });
		const novaTA = this.tokenRepo.create({ token: novoValorRefresh, usuario, expiraEm: new Date(Date.now() + REFRESH_EXP_DAYS * 24 * 60 * 60 * 1000), revogado: false });
		await this.tokenRepo.save(novaTA);

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
}