# Testing Guide

**Last Updated**: June 3, 2025  
**Test Coverage**: 70% threshold maintained

## Overview

This project uses a comprehensive testing framework with Jest for both frontend and backend testing. The testing setup includes unit tests, integration tests, and specialized rate limiting tests for API resilience.

## Testing Stack

### Backend Testing
- **Jest**: Testing framework
- **Supertest**: HTTP integration testing
- **Nock**: HTTP mocking for external APIs
- **TypeScript**: Full TypeScript support in tests

### Frontend Testing
- **Jest**: Testing framework with jest-preset-angular
- **Angular Testing Library**: Component testing utilities
- **Jest-DOM**: Custom Jest matchers for DOM testing

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run comprehensive test suite
./test-all.sh
```

### Individual Test Suites

```bash
# Backend only
cd backend
npm test                    # All backend tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:watch         # Watch mode

# Frontend only
cd frontend
npm test                   # All frontend tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
```

## Test Structure

### Backend Tests

```
backend/src/__tests__/
├── setup.ts                    # Global test configuration
├── unit/                       # Unit tests
│   ├── marketDataService.test.ts
│   ├── marketDataService.rateLimiting.test.ts  # NEW: Rate limiting tests
│   ├── excludeCoins.test.ts
│   └── rebalancingService.test.ts
└── integration/                # Integration tests
    ├── api.test.ts
    └── excludeCoins.integration.test.ts
```

### Frontend Tests

```
frontend/src/app/
├── services/__tests__/         # Service tests
│   ├── api.service.spec.ts
│   └── portfolio-url.service.spec.ts
└── components/__tests__/       # Component tests
    ├── portfolio-entry.component.spec.ts
    ├── portfolio-entry-dropdown.component.spec.ts
    └── rebalancing-results-charts.component.spec.ts
```

## Writing Tests

### Backend Unit Tests

```typescript
import { MarketDataService } from '../../services/marketDataService';
import nock from 'nock';

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(() => {
    service = new MarketDataService();
    nock.cleanAll();
  });

  it('should fetch top coins', async () => {
    // Mock external API
    nock('https://api.coingecko.com')
      .get('/api/v3/coins/markets')
      .reply(200, mockData);

    const result = await service.getTopCoins(15);
    expect(result).toHaveLength(15);
  });
});
```

### Backend Integration Tests

```typescript
import request from 'supertest';
import app from '../../server';

describe('API Integration', () => {
  it('GET /api/v1/health', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .expect(200);

    expect(response.body.status).toBe('healthy');
  });
});
```

### Frontend Service Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch top coins', () => {
    service.getTopCoins(15).subscribe(response => {
      expect(response.data).toBeDefined();
    });

    const req = httpMock.expectOne('http://localhost:3001/api/v1/market/top-coins?limit=15');
    req.flush({ data: [] });
  });
});
```

### Frontend Component Tests

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioEntryComponent } from '../portfolio-entry.component';

describe('PortfolioEntryComponent', () => {
  let component: PortfolioEntryComponent;
  let fixture: ComponentFixture<PortfolioEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioEntryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Test Configuration

### Jest Configuration (Backend)

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Jest Configuration (Frontend)

```javascript
// frontend/jest.config.js
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory for both frontend and backend:

```bash
# Generate coverage reports
npm run test:coverage

# View coverage reports
open backend/coverage/lcov-report/index.html
open frontend/coverage/lcov-report/index.html
```

## Continuous Integration

The project includes GitHub Actions CI pipeline (`.github/workflows/ci.yml`) that:

1. **Runs on**: Push to main/develop, Pull Requests
2. **Matrix Testing**: Node.js 18.x and 20.x
3. **Backend Pipeline**:
   - Install dependencies
   - Run linting
   - Run tests with coverage
   - Upload coverage to Codecov
4. **Frontend Pipeline**:
   - Install dependencies
   - Run linting
   - Run tests with coverage
   - Upload coverage to Codecov
5. **Build Testing**:
   - Test production builds
   - Run integration tests
6. **Security Scanning**:
   - npm audit for vulnerabilities

## Mock Data and Utilities

### API Mocking

```typescript
// Mock CoinGecko API responses
const mockCoinGeckoResponse = {
  bitcoin: { usd: 50000 },
  ethereum: { usd: 3000 }
};

nock('https://api.coingecko.com')
  .get('/api/v3/simple/price')
  .reply(200, mockCoinGeckoResponse);
```

### Rate Limiting Test Scenarios (NEW)

```typescript
// Test rate limiting error handling
describe('Rate Limiting Tests', () => {
  it('should handle 429 rate limit with retry-after header', async () => {
    nock('https://api.coingecko.com')
      .get('/api/v3/coins/markets')
      .reply(429, { error: 'Too Many Requests' }, {
        'retry-after': '60'
      });

    await expect(marketDataService.getTopCoins(15))
      .rejects.toThrow('API rate limit exceeded. Please try again in 60 seconds.');
  });

  it('should handle 503 service unavailable', async () => {
    nock('https://api.coingecko.com')
      .get('/api/v3/coins/markets')
      .reply(503, { error: 'Service Unavailable' });

    await expect(marketDataService.getTopCoins(15))
      .rejects.toThrow('API service temporarily unavailable. Please try again later.');
  });
});
```

### Test Utilities

```typescript
// Common test data with maxCoins support
export const mockPortfolio = {
  holdings: [
    { symbol: 'BTC', amount: 0.1 },
    { symbol: 'ETH', amount: 2 },
    { symbol: 'ADA', amount: 1000 }
  ],
  cashBalance: 500,
  excludedCoins: ['BTC', 'USDT', 'USDC'],
  maxCoins: 10  // NEW: configurable portfolio size
};

export const mockTopCoins = [
  {
    rank: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 52000,
    marketCap: 1000000000000,
    change24h: 2.5,
    volume24h: 50000000000
  },
  {
    rank: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2500,
    marketCap: 400000000000,
    change24h: -1.2,
    volume24h: 20000000000
  }
];

// NEW: Manual exclusion test data
export const mockExclusionScenarios = [
  {
    name: 'Effective exclusions',
    excludedCoins: ['BTC', 'ETH'],
    expectedEffective: ['BTC', 'ETH'],
    expectedIneffective: []
  },
  {
    name: 'Mixed exclusions',
    excludedCoins: ['BTC', 'UNKNOWN_COIN'],
    expectedEffective: ['BTC'],
    expectedIneffective: ['UNKNOWN_COIN']
  }
];
```

## Best Practices

### Test Organization
- **Unit Tests**: Test individual functions/methods in isolation
- **Integration Tests**: Test API endpoints and component interactions
- **Coverage**: Maintain >70% coverage for critical code paths

### Naming Conventions
- Describe what the test does: `should fetch top coins successfully`
- Use consistent file naming: `*.test.ts` for backend, `*.spec.ts` for frontend
- Group related tests with `describe` blocks

### Test Data
- Use realistic but predictable test data
- Mock external dependencies (APIs, databases)
- Clean up after tests (nock.cleanAll(), etc.)

### Assertions
- Use specific assertions: `toBe()`, `toEqual()`, `toContain()`
- Test both happy path and error cases
- Verify side effects and state changes

## Debugging Tests

### Common Issues
- **CORS errors**: Ensure proper test environment setup
- **Async issues**: Use `async/await` or proper Promise handling
- **Module mocking**: Check mock imports and setup
- **Rate limiting tests**: Ensure nock is properly cleaned between tests
- **Chart component tests**: Mock DOM measurements for height calculations
- **Exclusion tests**: Verify comma-separated parsing logic

### Debugging Commands
```bash
# Run specific test file
npm test -- marketDataService.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance Testing

For performance testing of the API endpoints:

```bash
# Install dependencies
npm install -g autocannon

# Test API performance
autocannon -c 10 -d 30 http://localhost:3001/api/v1/health
```

## New Test Features (June 3, 2025)

### Rate Limiting Test Coverage
Comprehensive test suite for API error scenarios:
- 429 rate limiting with retry-after headers
- 503 service unavailable errors  
- Network timeout scenarios
- 500 internal server errors
- Connection refused errors
- DNS resolution failures

### Manual Exclusion Testing
Test scenarios for the new manual exclusion system:
- Comma-separated input parsing
- Exclusion effectiveness detection
- Visual feedback validation
- URL parameter persistence

### Enhanced Integration Tests
Integration tests covering:
- Configurable portfolio size (maxCoins parameter)
- Excluded coins counting against portfolio limit
- Clean URL generation without timestamps
- Enhanced error message display

### Test Command Examples

```bash
# Run rate limiting tests specifically
npm test -- marketDataService.rateLimiting.test.ts

# Run exclusion-related tests
npm test -- excludeCoins

# Run with debug output for chart testing
debug=3 npm test -- rebalancing-results-charts
```

This testing framework ensures code quality, reliability, and maintainability across the entire crypto portfolio analyzer application, with special attention to API resilience and user experience edge cases.