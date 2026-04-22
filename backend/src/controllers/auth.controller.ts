import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UsuarioService } from '../services/usuario.service';
import { LoginDTO, RefreshTokenDTO, RegistroUsuarioDTO } from '../dtos';
import { TrocarSenhaDTO } from '../dtos/usuario.dto';

export class AuthController {
  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  registrar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(await this.usuarioService.registrar(req.body as RegistroUsuarioDTO));
    } catch (err) { next(err); }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, senha } = req.body as LoginDTO;
      return res.status(200).json(await this.authService.login(email, senha));
    } catch (err) { next(err); }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body as RefreshTokenDTO;
      return res.status(200).json(await this.authService.refresh(refreshToken));
    } catch (err) { next(err); }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body as RefreshTokenDTO;
      await this.authService.revoke(refreshToken);
      return res.status(204).send();
    } catch (err) { next(err); }
  };

  trocarSenha = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) return res.status(401).json({ message: 'Usuário não autenticado' });
      
      const { senhaAtual, novaSenha } = req.body as TrocarSenhaDTO;
      await this.authService.trocarSenha(usuarioId, senhaAtual, novaSenha);
      return res.status(204).send();
    } catch (err) { next(err); }
  };
}
