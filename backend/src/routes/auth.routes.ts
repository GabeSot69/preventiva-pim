import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { validateBody } from '../middlewares/validate-body.middleware';
import { 
  LoginSchema, 
  RefreshTokenSchema, 
  RegistroUsuarioSchema, 
  ResetarSenhaSchema, 
  SolicitarResetSenhaSchema 
} from '../dtos/index';
import { TrocarSenhaSchema } from '../dtos/usuario.dto';
import { autenticar } from '../middlewares/auth.middleware';
import { AppDataSource } from '../database/index';
import { Usuario } from '../entities/Usuario';
import { RefreshToken } from '../entities/RefreshToken';
import { Perfil } from '../entities/Perfil';
import { EmailService } from '../services/email.service';

const router = Router();

const usuarioService = new UsuarioService(
  AppDataSource.getRepository(Usuario),
  AppDataSource.getRepository(Perfil)
);
const emailService = new EmailService();
const authService = new AuthService(
  AppDataSource.getRepository(Usuario),
  AppDataSource.getRepository(RefreshToken),
  emailService
);
const controller = new AuthController(authService, usuarioService);

router.post('/login', validateBody(LoginSchema), controller.login);
router.post('/solicitar-reset-senha', validateBody(SolicitarResetSenhaSchema), controller.solicitarResetSenha);
router.post('/resetar-senha', validateBody(ResetarSenhaSchema), controller.resetarSenha);
router.post('/registrar', validateBody(RegistroUsuarioSchema), controller.registrar);
router.post('/refresh', validateBody(RefreshTokenSchema), controller.refresh);
router.post('/logout', validateBody(RefreshTokenSchema), controller.logout);
router.post('/trocar-senha', autenticar, validateBody(TrocarSenhaSchema), controller.trocarSenha);

export default router;

