import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import planoRoutes from './routes/plano-manutencao.routes';
import equipamentoRoutes from './routes/equipamento.routes';
import execucaoRoutes from './routes/execucao-manutencao.routes';
import { initializeDatabase } from './database';
import { Usuario } from './entities/Usuario';
import { Perfil } from './entities/Perfil';
import { StatusExecucao } from './entities/StatusExecucao';
import { AppError } from './errors';
import * as bcrypt from 'bcryptjs';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';


dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

app.use('/autenticacao', limiter);
app.use('/autenticacao', authRoutes);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import { autenticar } from './middlewares/auth.middleware';
app.use(autenticar);

app.use('/planos', planoRoutes);
app.use('/equipamentos', equipamentoRoutes);
app.use('/execucoes', execucaoRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof AppError) {
		return res.status(err.status).json({ message: err.message });
	}

	console.error('Erro não tratado:', err);
	return res.status(500).json({ message: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123456';

if (process.env.NODE_ENV !== 'test') {
	initializeDatabase()
		.then(() => {
			(async () => {
				const db = await import('./database');
				const userRepo = db.AppDataSource.getRepository(Usuario);
				const perfilRepo = db.AppDataSource.getRepository<Perfil>(Perfil);
				const statusRepo = db.AppDataSource.getRepository<StatusExecucao>(StatusExecucao);
				const existing = await userRepo.findOne({ where: { email: 'admin@example.com' } });
				if (!existing) {
					const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
					let perfil = await perfilRepo.findOne({ where: { chave: 'gestor' } });
					if (!perfil) {
						const novoPerfil = perfilRepo.create({ chave: 'gestor', descricao: 'Gestor do sistema' });
						perfil = await perfilRepo.save(novoPerfil);
					}

					const statuses = ['realizada', 'parcial', 'nao_realizada'];
					for (const chave of statuses) {
						let s = await statusRepo.findOne({ where: { chave } });
						if (!s) {
							const novoStatus = statusRepo.create({ chave, descricao: chave });
							await statusRepo.save(novoStatus);
						}
					}

					const u = userRepo.create({ nome: 'Admin', email: 'admin@example.com', senha_hash: hash, perfil: perfil!, ativo: true } as any);
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
}

export default app;