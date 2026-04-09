import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { DadosEntradaSchema, DadosTokenAtualizacaoSchema } from '../dtos';
import { AppError } from '../errors';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
	try {
		const validacao = DadosEntradaSchema.safeParse(req.body);
		if (!validacao.success) {
			return res.status(400).json({ message: 'Dados inválidos', errors: validacao.error.errors });
		}

		const { email, senha } = validacao.data;
		const result = await authService.login(email, senha);
		return res.status(200).json(result);
	} catch (err) {
		const erro = err instanceof AppError ? err : new AppError(500, 'Falha no login');
		return res.status(erro.status).json({ message: erro.message });
	}
};

export const refresh = async (req: Request, res: Response) => {
	try {
		const validacao = DadosTokenAtualizacaoSchema.safeParse(req.body);
		if (!validacao.success) {
			return res.status(400).json({ message: 'Dados inválidos', errors: validacao.error.errors });
		}

		const { refreshToken } = validacao.data;
		const result = await authService.refresh(refreshToken);
		return res.status(200).json(result);
	} catch (err) {
		const erro = err instanceof AppError ? err : new AppError(500, 'Falha ao renovar token');
		return res.status(erro.status).json({ message: erro.message });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const validacao = DadosTokenAtualizacaoSchema.safeParse(req.body);
		if (!validacao.success) {
			return res.status(400).json({ message: 'Dados inválidos', errors: validacao.error.errors });
		}

		const { refreshToken } = validacao.data;
		await authService.revoke(refreshToken);
		return res.status(204).send();
	} catch (err) {
		const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao efetuar logout');
		return res.status(erro.status).json({ message: erro.message });
	}
};