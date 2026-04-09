import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import { initializeDatabase } from './database';
import { Usuario } from './entities/Usuario';
import { AppError } from './errors';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 100, // limite de 100 requisições por IP
	message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

app.use('/autenticacao', limiter);
app.use('/autenticacao', authRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof AppError) {
		return res.status(err.status).json({ message: err.message });
	}

	console.error('Erro não tratado:', err);
	return res.status(500).json({ message: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

initializeDatabase()
	.then(() => {
		// criar usuário padrão para teste, se não existir
		(async () => {
			const userRepo = (await import('./database')).AppDataSource.getRepository(Usuario);
			const existing = await userRepo.findOne({ where: { email: 'admin@example.com' } });
			if (!existing) {
				const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
				const u = userRepo.create({ nome: 'Admin', email: 'admin@example.com', senha_hash: hash, perfil: 'gestor', ativo: true } as any);
				await userRepo.save(u);
				console.log('Usuário padrão criado: admin@example.com');
			}
		})().catch(console.error);

		app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
	})
	.catch((err: any) => {
		console.error('Inicialização do banco de dados falhou', err);
		process.exit(1);
	});

export default app;