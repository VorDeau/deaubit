declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_APP_HOST: string;
  readonly VITE_SHORT_HOST: string;
  readonly VITE_PROTOCOL: string;
  readonly VITE_TURNSTILE_SITE_KEY: string;
  readonly VITE_AUTH_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
