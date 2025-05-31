# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization of the top 15 cryptocurrencies, with advanced backtesting capabilities.

## Architecture

- **Frontend**: Angular SPA with TypeScript, Angular Material, and Chart.js
- **Backend**: Azure Functions (Node.js/TypeScript) with NestJS-style architecture
- **Infrastructure**: Azure (Static Web Apps, Functions, Redis, API Management)
- **Data Source**: CoinGecko API for market data
- **Deployment**: Terraform + GitHub Actions

## Key Commands

### Development
```bash
# Install dependencies
npm install  # Run in both /frontend and /backend directories

# Start local development
cd backend && npm run start   # Backend at http://localhost:7071
cd frontend && npm run start  # Frontend at http://localhost:4200

# Run tests
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report

# Linting
npm run lint
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

- `/frontend` - Angular application
  - `/src/app/components` - UI components
  - `/src/app/services` - Business logic
  - `/src/app/models` - TypeScript interfaces
  
- `/backend` - Azure Functions
  - `/src/functions` - HTTP endpoints
  - `/src/services` - Core business logic
  - `/src/utils` - Utilities

- `/infrastructure` - Terraform IaC
- `/docs` - Comprehensive documentation

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

## API Endpoints

- `GET /api/v1/market/top-coins` - Top coins by market cap
- `GET /api/v1/market/prices` - Current prices
- `POST /api/v1/rebalance/calculate` - Calculate rebalancing
- `POST /api/v1/backtest/run` - Run backtest simulation

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

## Development Guidelines

- Use TypeScript strict mode
- Follow Angular style guide
- Implement comprehensive error handling
- Cache API responses to minimize costs
- Write tests for all new features
- Document API changes in TECHNICAL_ARCHITECTURE.md