import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDTO, RefreshTokenDTO } from '../dtos';
import { AppError } from '../errors';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
	try {
		const { email, senha } = req.body as LoginDTO;
		const result = await authService.login(email, senha);
		return res.status(200).json(result);
	} catch (err) {
		const erro = err instanceof AppError ? err : new AppError(500, 'Falha no login');
		return res.status(erro.status).json({ message: erro.message });
	}
};

export const refresh = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body as RefreshTokenDTO;
		const result = await authService.refresh(refreshToken);
		return res.status(200).json(result);
	} catch (err) {
		const erro = err instanceof AppError ? err : new AppError(500, 'Falha ao renovar token');
		return res.status(erro.status).json({ message: erro.message });
	}
};

export const logout = async (req: Request, res: Response) => {
	try {
		const { refreshToken } = req.body as RefreshTokenDTO;
		await authService.revoke(refreshToken);
		return res.status(204).send();
	} catch (err) {
		const erro = err instanceof AppError ? err : new AppError(500, 'Erro ao efetuar logout');
		return res.status(erro.status).json({ message: erro.message });
	}
};