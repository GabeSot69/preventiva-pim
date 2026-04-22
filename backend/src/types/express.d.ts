import { PerfilUsuario } from './perfil-usuario';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        perfil: {
          chave: PerfilUsuario;
        };
        ativo: boolean;
      };
    }
  }
}
