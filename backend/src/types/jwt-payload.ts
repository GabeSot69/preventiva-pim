export type JwtPayload = {
  sub: number;
  perfil: string;
  nome: string;
  jti?: string;
};
