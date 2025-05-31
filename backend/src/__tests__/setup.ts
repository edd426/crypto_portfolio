import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.COINGECKO_API_KEY = 'test-key';
});

// Enable HTTP mocking for all tests
beforeEach(() => {
  if (!process.env.ENABLE_HTTP_MOCKING) {
    process.env.ENABLE_HTTP_MOCKING = 'true';
  }
});

// Global test teardown
afterAll(() => {
  // Cleanup after all tests
});

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};