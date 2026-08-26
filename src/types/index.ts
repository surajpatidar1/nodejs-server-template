export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
}

export interface ValidateServer {
  port: number;
  appName: string;
  env: string;
}

export interface JwtPayload {
  sub: string;
  type: UserType;
}
