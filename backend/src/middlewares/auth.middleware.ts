import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database';
import { Usuario } from '../entities/Usuario';
import type { JwtPayload } from '../types';
import { AppError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

type RequisicaoComUsuario = Request & { usuario?: Usuario };

export const autenticar: RequestHandler = async (req: RequisicaoComUsuario, res: Response, next: NextFunction) => {
	try {
		const autorizacao = req.headers.authorization;
		if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Token não fornecido' });
		}

		const parts = autorizacao.split(' ');
		if (parts.length !== 2) {
			return res.status(401).json({ message: 'Formato de autorização inválido' });
		}

		const token = parts[1];
		let payload: JwtPayload;

		try {
			payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
		} catch {
			return res.status(401).json({ message: 'Token inválido' });
		}

		const idUsuario = payload.sub;
		if (!idUsuario) return res.status(401).json({ message: 'Token sem sujeito (sub)' });

		const usuarioRepo = AppDataSource.getRepository(Usuario);
		const usuario = await usuarioRepo.findOne({ where: { id: idUsuario } });

		if (!usuario) return res.status(401).json({ message: 'Usuário não encontrado' });
		if (!usuario.ativo) return res.status(401).json({ message: 'Usuário inativo' });

		req.usuario = usuario;
		return next();
	} catch (err) {
		return res.status(500).json({ message: 'Erro no middleware de autenticação' });
	}
};

export const autorizar = (...perfisPermitidos: string[]): RequestHandler => {
	return (req: RequisicaoComUsuario, res: Response, next: NextFunction) => {
		const usuario = req.usuario;
		if (!usuario) return res.status(401).json({ message: 'Não autenticado' });
		if (!perfisPermitidos.includes(usuario.perfil)) return res.status(403).json({ message: 'Acesso negado' });
		return next();
	};
};

export const ehTecnico: RequestHandler[] = [autenticar, autorizar('tecnico')];
export const ehSupervisor: RequestHandler[] = [autenticar, autorizar('supervisor')];
export const ehGestor: RequestHandler[] = [autenticar, autorizar('gestor')];