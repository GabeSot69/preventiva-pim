import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './config/logger';
import authRoutes from './routes/auth.routes';
import planoRoutes from './routes/plano-manutencao.routes';
import equipamentoRoutes from './routes/equipamento.routes';
import execucaoRoutes from './routes/execucao-manutencao.routes';
import dashboardRoutes from './routes/dashboard.routes';
import usuarioRoutes from './routes/usuario.routes';
import perfilRoutes from './routes/perfil.routes';
import statusExecucaoRoutes from './routes/status-execucao.routes';
import { initializeDatabase } from './database/index';
import { runSeed } from './database/seed';
import { autenticar } from './middlewares/auth.middleware';
import { AppError } from './errors/index';
import { QueryFailedError } from 'typeorm';
import z, { ZodError } from 'zod';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());
app.use(compression());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Requisição recebida');
  next();
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Limite de tentativas excedido, tente novamente em 15 minutos.',
});

app.use(globalLimiter);
app.use('/app/auth', authLimiter);
app.use('/app/auth', authRoutes);


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const protectedRouter = express.Router();
protectedRouter.use(autenticar);

protectedRouter.use('/planos', planoRoutes);
protectedRouter.use('/equipamentos', equipamentoRoutes);
protectedRouter.use('/execucoes', execucaoRoutes);
protectedRouter.use('/dashboard', dashboardRoutes);
protectedRouter.use('/usuarios', usuarioRoutes);
protectedRouter.use('/perfis', perfilRoutes);
protectedRouter.use('/status-execucao', statusExecucaoRoutes);

app.use('/app', protectedRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ 
      message: 'Erro de validação', 
      errors: err.format() 
    });
  }

  if (err instanceof QueryFailedError) {
    logger.error({ err }, 'Erro de banco de dados');
    if (err.message.includes('UNIQUE constraint failed') || err.message.includes('duplicate key value')) {
      return res.status(409).json({ message: 'Conflito: registro já existe' });
    }
    return res.status(400).json({ message: 'Erro na operação de banco de dados' });
  }

  logger.error({ err, path: req.path }, 'Erro não tratado');
  return res.status(500).json({ message: 'Erro interno do servidor' });
});

const PORT = env.PORT;

if (env.NODE_ENV !== 'test') {
  initializeDatabase()
    .then(() => runSeed())
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => logger.info(`Server rodando na porta ${PORT} em modo ${env.NODE_ENV}`));
    })
    .catch((err: any) => {
      logger.fatal({ err }, 'Inicialização falhou');
      process.exit(1);
    });
}

export default app;
