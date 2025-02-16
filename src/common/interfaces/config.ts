export interface AuthConfig {
  jwtSecret: string;
  jwtExpiration: string;
  username: string;
  password: string;
}

export interface AppConfig {
  port: number;
}

export interface DbConfig {
  name: string;
  url: string;
  flights: string;
}

export interface Config {
  auth: AuthConfig;
  app: AppConfig;
  database: DbConfig;
}
