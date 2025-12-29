import { vi } from 'vitest';

/**
 * Global test setup
 * Runs before all tests via vitest.config.ts setupFiles
 */

// Mock localStorage
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString();
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

const localStorageMock = new LocalStorageMock();
global.localStorage = localStorageMock as Storage;

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      MODE: 'test',
      VITE_API_BASE_URL: 'http://localhost:8080',
    },
  },
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
