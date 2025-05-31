# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: ✅ FULLY FUNCTIONAL MVP

**Last Updated**: May 31, 2025  
**Current Phase**: Phase 1 MVP Complete + Testing Framework  
**Status**: Production-ready local development environment

### 🎯 What Works Now
- ✅ **Portfolio Entry**: Users can input crypto holdings and cash balance
- ✅ **Rebalancing Calculation**: Real-time market cap-based rebalancing with CoinGecko API
- ✅ **Trade Recommendations**: Buy/sell recommendations with USD values
- ✅ **URL Persistence**: Portfolio data saved in URL parameters
- ✅ **Responsive UI**: Angular Material design with proper form validation
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Testing Framework**: Complete Jest testing suite with 70% coverage
- ✅ **CI/CD Pipeline**: GitHub Actions with automated testing and linting

### 🚀 How to Start Development
```bash
# Quick start (recommended)
./start-dev.sh

# Manual start
cd backend && npm start    # Backend: http://localhost:3001
cd frontend && npm start   # Frontend: http://localhost:4200
```

## Project Overview

A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization of the top 15 cryptocurrencies, with advanced backtesting capabilities.

## Architecture (Current Implementation)

- **Frontend**: Angular 17+ SPA with TypeScript, Angular Material, standalone components
- **Backend**: Express.js Node.js server (NOT Azure Functions - this was changed during implementation)
- **Data Source**: CoinGecko API for real-time market data
- **Testing**: Jest + Supertest + Nock for comprehensive testing
- **CI/CD**: GitHub Actions pipeline with matrix testing

## Key Commands

### Development
```bash
# Install dependencies
npm install  # Run in both /frontend and /backend directories
# OR use: npm run install:all

# Start local development (RECOMMENDED)
./start-dev.sh  # Starts both servers with proper cleanup

# Manual start
cd backend && npm start    # Backend at http://localhost:3001
cd frontend && npm start   # Frontend at http://localhost:4200

# Run tests
npm test                    # All tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage reports
./test-all.sh              # Comprehensive test suite with colors

# Linting
npm run lint               # Both frontend and backend
cd backend && npm run lint # Backend only
cd frontend && npm run lint # Frontend only
```

### Build & Deploy
```bash
# Build for production
cd frontend && npm run build:prod
cd backend && npm run build

# Deploy (handled by GitHub Actions)
# Dev: Push to develop branch
# Prod: Merge PR to main branch
```

## Project Structure

```
crypto_portfolio/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── services/        # Business logic (MarketDataService, RebalancingService)
│   │   ├── models/          # TypeScript interfaces
│   │   ├── utils/           # Error handling, utilities
│   │   ├── __tests__/       # Jest tests (unit + integration)
│   │   └── server.ts        # Express server entry point
│   ├── .eslintrc.js         # ESLint configuration
│   ├── jest.config.js       # Jest testing configuration
│   └── package.json         # Dependencies and scripts
│
├── frontend/                # Angular 17+ SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Portfolio entry, results display
│   │   │   ├── services/    # API service, URL persistence
│   │   │   ├── models/      # TypeScript interfaces
│   │   │   └── __tests__/   # Component and service tests
│   │   ├── assets/          # Static assets
│   │   └── styles.scss      # Global styles
│   ├── .eslintrc.json       # ESLint configuration
│   ├── jest.config.js       # Jest + Angular testing
│   └── angular.json         # Angular project configuration
│
├── docs/                    # Documentation
│   ├── TESTING_GUIDE.md     # Comprehensive testing guide
│   ├── PROJECT_OVERVIEW.md  # High-level project documentation
│   └── *.md                 # Other planning documents
│
├── .github/workflows/       # CI/CD pipeline
│   └── ci.yml              # GitHub Actions workflow
│
├── start-dev.sh            # Development server startup script
├── test-all.sh             # Comprehensive test runner
├── CLAUDE.md               # This file - AI agent guidance
└── README.md               # User-facing documentation
```

## Key Features

### Phase 1 (MVP)
- Manual portfolio entry
- Market cap-based rebalancing for top 15 coins
- URL-based portfolio persistence
- Trade recommendations

### Phase 2
- Historical backtesting
- Multiple rebalancing frequencies
- Performance metrics (Sharpe ratio, max drawdown)
- Transaction cost modeling

## API Endpoints (✅ Implemented & Working)

- `GET /api/v1/health` - Health check endpoint
- `GET /api/v1/market/top-coins?limit=15&exclude=USDT` - Top coins by market cap
- `GET /api/v1/market/prices?symbols=BTC,ETH` - Current prices for symbols
- `GET /api/v1/market/search?q=bitcoin&limit=10` - Search coins
- `POST /api/v1/rebalance/calculate` - Calculate rebalancing (✅ WORKING)

### API Testing Examples
```bash
# Test backend health
curl http://localhost:3001/api/v1/health

# Get top 5 coins
curl "http://localhost:3001/api/v1/market/top-coins?limit=5"

# Test rebalancing (the main feature)
curl -X POST http://localhost:3001/api/v1/rebalance/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": {
      "holdings": [{"symbol": "BTC", "amount": 0.5}, {"symbol": "ETH", "amount": 7}],
      "cashBalance": 800,
      "excludedCoins": []
    },
    "excludedCoins": []
  }'
```

## Important Considerations

- No user authentication (anonymous usage)
- Desktop-first design
- Cost optimization is priority
- No database initially (URL params for state)
- 5-minute cache for market data
- Transaction fees configurable (default 0.5%)

## Recommended Development Tools

Use these CLI tools for optimal development workflow:

- **Angular CLI**: `ng generate component`, `ng serve`, `ng build --configuration production`
- **HTTPie**: `http GET localhost:3001/api/v1/health` (preferred over curl for API testing)
- **jq**: `curl localhost:3001/api/v1/health | jq` (for readable JSON output)
- **Prettier**: `prettier --write "src/**/*.{ts,html,scss}"` (format before commits)

Install: `npm install -g @angular/cli prettier && brew install httpie jq`

## Testing Framework

Comprehensive testing setup with Jest for both frontend and backend:

- **Backend**: Jest + Supertest + Nock for API mocking
- **Frontend**: Jest + Angular Testing Library + Jest-DOM
- **Coverage**: 70% threshold for all projects
- **CI/CD**: GitHub Actions with automated testing

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode  
npm run test:coverage       # With coverage reports
./test-all.sh              # Full test suite with colored output
```

### Test Structure
- Unit tests: `src/__tests__/unit/`
- Integration tests: `src/__tests__/integration/`
- Component tests: `src/app/components/__tests__/`
- Service tests: `src/app/services/__tests__/`

## Recent Critical Fixes (May 31, 2025)

### 🐛 Fixed Issues
1. **Rebalancing Validation Error**: Fixed backend validation schema to accept `excludedCoins` in portfolio object
2. **Cache Isolation**: Changed MarketDataService to use instance-based cache for better test isolation  
3. **Zone.js Import**: Updated import from `zone.js/dist/zone-testing` to `zone.js/testing`
4. **Start Script**: Improved `start-dev.sh` with better process management and Angular CLI prompt suppression
5. **ESLint Configuration**: Added proper ESLint configs for both frontend and backend

### 📁 Key Files Modified
- `backend/src/controllers/rebalanceController.ts` - Fixed validation schema
- `backend/src/services/marketDataService.ts` - Instance-based cache
- `frontend/src/test.ts` - Fixed zone.js import
- `start-dev.sh` - Improved development workflow

## 🚀 Potential Next Steps for Future Development

### Phase 2 Features (Not Yet Implemented)
- [ ] Historical backtesting with date range selection
- [ ] Multiple rebalancing frequencies (daily, weekly, monthly)
- [ ] Performance metrics calculation (Sharpe ratio, max drawdown)
- [ ] Transaction cost modeling and optimization
- [ ] Portfolio comparison and analytics
- [ ] Export functionality (CSV, PDF reports)

### Infrastructure Improvements
- [ ] Deploy to production (Azure, Vercel, or similar)
- [ ] Add Redis caching for improved performance
- [ ] Implement rate limiting for CoinGecko API
- [ ] Add database for user portfolio persistence
- [ ] Set up monitoring and logging

### UI/UX Enhancements
- [ ] Add portfolio visualization charts
- [ ] Implement responsive mobile design
- [ ] Add dark mode toggle
- [ ] Portfolio simulation and "what-if" scenarios
- [ ] Improve loading states and animations

## Development Guidelines

- Use TypeScript strict mode
- Follow Angular style guide  
- Implement comprehensive error handling
- Cache API responses to minimize costs
- Write tests for all new features (Jest setup already complete)
- Run `./test-all.sh` before committing changes
- Use `./start-dev.sh` for development workflow