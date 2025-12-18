/// <reference types="vite/client" />

// If you want stronger typing for your env vars, declare them here.
// Vite only exposes variables that start with VITE_.
interface ImportMetaEnv {
  /** Backend base URL, e.g. https://api.example.com */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
