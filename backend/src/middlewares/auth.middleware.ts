import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';
import { JWT_SECRET } from '../config/jwt';
import { PerfilChave } from '../constants/perfil';

export const autenticar: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const autorizacao = req.headers.authorization;
    if (!autorizacao?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = autorizacao.split(' ')[1];
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    } catch {
      return res.status(401).json({ message: 'Token inválido' });
    }

    if (!payload.sub) return res.status(401).json({ message: 'Token inválido' });
    if (payload.ativo === false) return res.status(401).json({ message: 'Usuário inativo' });

    req.usuario = { 
      id: payload.sub, 
      perfil: { chave: payload.perfil as any }, 
      ativo: payload.ativo ?? true 
    };
    return next();
  } catch {
    return res.status(500).json({ message: 'Erro no middleware de autenticação' });
  }
};

export const autorizar = (...perfisPermitidos: PerfilChave[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = req.usuario;
    if (!usuario) return res.status(401).json({ message: 'Não autenticado' });
    const perfilChave = usuario.perfil?.chave as PerfilChave;
    if (!perfilChave || !perfisPermitidos.includes(perfilChave)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    return next();
  };
};

export const ehTecnico: RequestHandler[] = [autenticar, autorizar(PerfilChave.TECNICO)];
export const ehSupervisor: RequestHandler[] = [autenticar, autorizar(PerfilChave.SUPERVISOR)];
export const ehGestor: RequestHandler[] = [autenticar, autorizar(PerfilChave.GESTOR)];
