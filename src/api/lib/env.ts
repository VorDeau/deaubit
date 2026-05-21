export interface Env {
  DB: D1Database;
  SESSION: KVNamespace;
  ASSETS: Fetcher;

  APP_HOST: string;
  PROTOCOL: string;
  SHORT_HOST: string;
  REDIRECT_HOST: string;
  TURNSTILE_SITE_KEY: string;
  AUTH_URL: string;
  SERVICE_SECRET: string;

  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
}
