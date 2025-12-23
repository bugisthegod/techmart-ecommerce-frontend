/// <reference types="vite/client" />

// If you want stronger typing for your env vars, declare them here.
// Vite only exposes variables that start with VITE_.
interface ImportMetaEnv {
  /** Backend base URL, e.g. https://api.example.com */
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: pk_test_51Sbpe4AbaSWO6GubZRmEA2LShau7nJGeecCvcrpg5qpiRtgi49LQvfylLrcZEkwXggdmsVoterQWm283OCt8KGg200a31iTwH3;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
