import { beforeAll, afterEach } from 'vitest';

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clean up mocks after each test
  vi.restoreAllMocks();
});
