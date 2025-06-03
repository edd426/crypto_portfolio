# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: ✅ FULLY FUNCTIONAL MVP + ENHANCED UI

**Last Updated**: June 3, 2025  
**Current Phase**: Phase 1 MVP Complete + Enhanced UI & Features  
**Status**: Production-ready with advanced portfolio management features

### 🎯 What Works Now
- ✅ **Portfolio Entry**: Users can input crypto holdings and cash balance with manual text exclusion
- ✅ **Rebalancing Calculation**: Real-time market cap-based rebalancing with CoinGecko API
- ✅ **Interactive Charts**: Proportional bar charts showing current vs target portfolio composition
- ✅ **Smart Exclusion System**: Visual feedback showing effective vs ineffective coin exclusions
- ✅ **Configurable Portfolio Size**: User-defined max coins (1-50) with exclusions counting against limit
- ✅ **Enhanced Allocations View**: Current vs target comparison with cash holdings included
- ✅ **Trade Recommendations**: Buy/sell recommendations with USD values
- ✅ **URL Persistence**: Portfolio data saved in clean URL parameters (no timestamps)
- ✅ **Responsive UI**: Angular Material design with proper form validation
- ✅ **Robust Error Handling**: Rate limiting awareness and user-friendly API error messages
- ✅ **Testing Framework**: Complete Jest testing suite with 70% coverage + rate limiting tests
- ✅ **CI/CD Pipeline**: GitHub Actions with automated testing and linting
- ✅ **Debug System**: Configurable verbosity levels for troubleshooting

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

### Phase 1 (MVP) ✅ COMPLETE
- Manual portfolio entry with text-based coin exclusion
- Market cap-based rebalancing for configurable portfolio size (1-50 coins)
- URL-based portfolio persistence (clean URLs without timestamps)
- Trade recommendations with USD values
- Enhanced allocations view with current vs target comparison
- Robust error handling including rate limiting

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

## Debug System

The application includes a configurable debug system for troubleshooting chart and data issues.

### Debug Levels
- **Level 0**: No debug output (default, production)
- **Level 1**: Errors only
- **Level 2**: Errors + Warnings  
- **Level 3**: Errors + Warnings + Info
- **Level 4**: All debug output (verbose)

### How to Enable Debug Mode

**Method 1: URL Parameter**
```
http://localhost:4200?debug=3
```

**Method 2: Browser Console**
```javascript
localStorage.setItem('portfolioDebugLevel', '3');
// Refresh page
```

**Method 3: Temporary Override**
```javascript
// In browser DevTools console
window.portfolioDebugLevel = 3;
```

### Debug Output Examples
```
[INFO] Current Portfolio - maxPercentage: 72.9
[WARN] BTC: No target allocation found (likely excluded coin)
[ERROR] ETH: No price data available in allocations or trades
[DEBUG] BTC: currentValue=10432, percentage=45.2%
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

## Recent Critical Fixes & Enhancements (June 3, 2025)

### 🎯 Major Feature Additions
1. **Manual Coin Exclusion System**: Replaced dropdown with text input for better UX with large portfolios
   - Support for comma-separated input (e.g., "BTC, ETH, USDT")
   - Visual feedback showing effective vs ineffective exclusions after calculation
   - Color-coded chips: green for effective exclusions, yellow for ineffective ones
   - Enhanced tooltips explaining exclusion effectiveness

2. **Enhanced Allocations Tab**: Complete redesign of "Target Allocations" → "Allocations"
   - Added current portfolio columns: Current %, Current Value, Current Amount
   - Cash holdings now included as a dedicated row
   - Side-by-side comparison of current vs target allocations
   - Improved table styling and right-aligned numeric columns

3. **Configurable Portfolio Size**: Added maxCoins parameter (1-50, default 15)
   - Excluded coins count against the portfolio limit
   - URL persistence for maxCoins parameter
   - Form validation and user guidance

4. **Rate Limiting & Error Handling**: Comprehensive API error management
   - Specific handling for 429 rate limit errors with retry timing
   - User-friendly error messages for different API failure scenarios
   - Enhanced frontend error display with dynamic duration

### 🛠️ Technical Improvements
5. **URL Parameter Cleanup**: Removed timestamp parameter for cleaner URLs
6. **Button Consolidation**: Streamlined Generate Portfolio URL functionality
   - Single button placement in portfolio entry form for immediate access
   - Removed duplicate grey section button from results
   - Different button styling (primary vs accent colors)

7. **Testing Coverage**: Added comprehensive rate limiting test suite
   - 6 new test cases covering API error scenarios
   - Maintained 58/58 passing frontend tests
   - Enhanced error message validation

### 📁 Key Files Modified (June 3, 2025)
- `frontend/src/app/components/portfolio-entry/portfolio-entry.component.ts` - Manual exclusion UI, button consolidation
- `frontend/src/app/components/rebalancing-results/rebalancing-results.component.ts` - Enhanced allocations tab, removed duplicate button
- `frontend/src/app/services/portfolio-url.service.ts` - Removed timestamp parameter
- `backend/src/services/marketDataService.ts` - Enhanced error handling with specific messages
- `backend/src/__tests__/unit/marketDataService.rateLimiting.test.ts` - New comprehensive test suite
- `frontend/src/app/app.component.ts` - Improved error handling and exclusion feedback

## Previous Enhancements (June 1, 2025)

### 🎨 UI/UX Improvements
1. **Chart Visualization Fixed**: Bar charts now show proportional heights based on actual portfolio percentages
2. **Excluded Coin Values**: Current portfolio correctly displays USD values for excluded coins
3. **Interactive Tooltips**: Improved hover tooltips with proper disappearing behavior
4. **Y-Axis Scaling**: Fixed Y-axis labels to show proper percentage ranges (0% at bottom)
5. **Dropdown Coin Exclusion**: Enhanced UI with searchable dropdown for excluding coins

### 🛠️ Technical Enhancements  
6. **Debug Verbosity System**: Added configurable debug levels (0-4) for troubleshooting
7. **Height Calculation**: Fixed CSS flex layout issues by using pixel-based bar heights
8. **Price Resolution**: Enhanced price calculation for excluded coins using trade data
9. **Event Handling**: Improved chart container mouse event management

### 📁 Key Files Modified
- `frontend/src/app/components/rebalancing-results/rebalancing-results.component.ts` - Chart fixes, debug system
- `frontend/src/app/components/portfolio-entry/portfolio-entry.component.ts` - Dropdown exclusion UI
- `backend/src/controllers/rebalanceController.ts` - Validation schema improvements

### 🐛 Previous Fixes (May 31, 2025)
1. **Rebalancing Validation Error**: Fixed backend validation schema to accept `excludedCoins` in portfolio object
2. **Cache Isolation**: Changed MarketDataService to use instance-based cache for better test isolation  
3. **Zone.js Import**: Updated import from `zone.js/dist/zone-testing` to `zone.js/testing`
4. **Start Script**: Improved `start-dev.sh` with better process management and Angular CLI prompt suppression
5. **ESLint Configuration**: Added proper ESLint configs for both frontend and backend

## 🚀 Next Development Priority

### 🎯 **IMMEDIATE FOCUS: Azure Production Deployment**

**The application is production-ready and the next developer should prioritize robust Azure deployment.**

#### Priority 1: Azure Production Deployment (URGENT)
- [ ] **Deploy to Azure** using existing infrastructure planning in `/docs/DEPLOYMENT_INFRASTRUCTURE.md`
- [ ] Set up Azure Container Instances with Terraform configurations
- [ ] Configure Azure Application Gateway for load balancing and SSL
- [ ] Implement Azure Database for PostgreSQL for portfolio persistence
- [ ] Set up Azure Application Insights for monitoring and logging
- [ ] Configure Azure Key Vault for secrets management
- [ ] Deploy CI/CD pipeline using existing GitHub Actions

#### Priority 2: Post-Deployment Optimization
- [ ] Add Azure Cache for Redis for improved performance
- [ ] Implement auto-scaling policies
- [ ] Set up automated backups and disaster recovery
- [ ] Configure custom domain and SSL certificates
- [ ] Optimize Azure costs and resource allocation

#### Priority 3: Phase 2 Features (After Production Deployment)
- [ ] Historical backtesting with date range selection
- [ ] Multiple rebalancing frequencies (daily, weekly, monthly)
- [ ] Performance metrics calculation (Sharpe ratio, max drawdown)
- [ ] Transaction cost modeling and optimization
- [ ] Portfolio comparison and analytics
- [ ] Export functionality (CSV, PDF reports)

#### Priority 4: UI/UX Enhancements
- [ ] Add portfolio visualization charts
- [ ] Implement responsive mobile design
- [ ] Add dark mode toggle
- [ ] Portfolio simulation and "what-if" scenarios
- [ ] Improve loading states and animations

**Note**: All Azure infrastructure planning and Terraform configurations are already documented in `/docs/DEPLOYMENT_INFRASTRUCTURE.md`. The application is fully ready for production deployment.

## Development Guidelines

- Use TypeScript strict mode
- Follow Angular style guide  
- Implement comprehensive error handling
- Cache API responses to minimize costs
- Write tests for all new features (Jest setup already complete)
- Run `./test-all.sh` before committing changes
- Use `./start-dev.sh` for development workflow