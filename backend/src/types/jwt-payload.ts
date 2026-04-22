export type JwtPayload = {
  sub: number;
  perfil: string;
  nome: string;
  ativo?: boolean;
  trocarSenha?: boolean;
  jti?: string;
};
