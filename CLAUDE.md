# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: ✅ CLIENT-SIDE ARCHITECTURE DEPLOYED - PHASE 1 COMPLETE

**Last Updated**: June 8, 2025  
**Current Phase**: Phase 1 complete, Phase 2 backtesting ready for implementation  
**Status**: Production client-side architecture deployed and functional

## 🔄 **HANDOFF STATUS: PHASE 1 DEPLOYED - READY FOR PHASE 2**

### **Client-Side Implementation Complete (June 8, 2025)**
- ✅ **Client-side architecture deployed**: Direct CoinGecko API integration functional
- ✅ **Azure infrastructure updated**: Blob Storage added for Phase 2 historical data
- ✅ **Production deployment**: Live at https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net
- ✅ **Cost optimization achieved**: $0/month operational cost (99%+ reduction)

### 🎯 What Works Now (Client-Side Architecture)
- ✅ **Portfolio Entry**: Users can input crypto holdings and cash balance with manual text exclusion
- ✅ **Client-Side Rebalancing**: Real-time market cap-based calculation with direct CoinGecko API calls
- ✅ **Interactive Charts**: Proportional bar charts showing current vs target portfolio composition
- ✅ **Smart Exclusion System**: Visual feedback showing effective vs ineffective coin exclusions
- ✅ **Configurable Portfolio Size**: User-defined max coins (1-50) with exclusions counting against limit
- ✅ **Enhanced Allocations View**: Current vs target comparison with cash holdings included
- ✅ **Trade Recommendations**: Buy/sell recommendations with USD values
- ✅ **URL Persistence**: Portfolio data saved in clean URL parameters (no timestamps)
- ✅ **Responsive UI**: Angular Material design with proper form validation
- ✅ **Client-Side Caching**: 5-minute cache for CoinGecko API efficiency
- ✅ **Zero Backend Dependencies**: No server-side code required for Phase 1
- ✅ **Testing Framework**: Complete Jest testing suite with 70% coverage
- ✅ **CI/CD Pipeline**: GitHub Actions with automated testing and linting
- ✅ **Debug System**: Configurable verbosity levels for troubleshooting
- ✅ **Azure Infrastructure**: Static Web App + Blob Storage deployed

### 🚀 How to Start Development
```bash
# Frontend only (client-side architecture)
cd frontend && npm start   # Frontend: http://localhost:4200

# Optional: Backend for local testing/development
cd backend && npm start    # Backend: http://localhost:3001 (not required for production)

# Legacy quick start (includes unused backend)
./start-dev.sh
```

## ☁️ Azure Infrastructure Status

### ✅ Successfully Deployed (Updated June 8, 2025)
- **Static Web App**: `stapp-cryptoportfolio-prod-9rc2a6`
- **Live URL (Production)**: https://blue-glacier-0ffdf2d1e.6.azurestaticapps.net
- **Live URL (Preview)**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net
- **Storage Account**: `stcrypto9rc2a6` with public blob container `historical-data`
- **Resource Group**: `rg-cryptoportfolio-prod-9rc2a6`
- **Application Insights**: Monitoring enabled
- **Budget Alerts**: $25/month with email notifications to eddelord@gmail.com
- **Monthly Cost**: ~$0-1 (FREE tier + minimal blob storage)

### ✅ Architecture Achievements
- **Client-Side Implementation**: Direct CoinGecko API calls from browser
- **99% Cost Reduction**: $0/month operational cost achieved
- **Zero Backend Dependencies**: No Azure Functions required for Phase 1
- **Phase 2 Ready**: Blob Storage configured for historical backtesting data

### 🛠️ Infrastructure Details
- **Location**: West US 2
- **Terraform**: Infrastructure as Code in `/infrastructure/environments/production-simple/`
- **Resource Providers**: All registered and functional
- **Monitoring**: Application Insights + budget controls active
- **CORS**: Configured for direct browser access to blob storage

## Project Overview

A web-based cryptocurrency portfolio analyzer that helps users rebalance their holdings according to market capitalization of the top 15 cryptocurrencies, with advanced backtesting capabilities.

## Architecture (Client-Side Implementation - June 8, 2025)

- **Frontend**: Angular 17+ SPA with TypeScript, Angular Material, standalone components
- **API Integration**: Direct CoinGecko API calls from browser with client-side caching
- **Data Storage**: Azure Blob Storage for Phase 2 historical data
- **Backend**: Express.js Node.js server (for local development only, not deployed)
- **Testing**: Jest + Angular Testing Library for comprehensive testing
- **CI/CD**: GitHub Actions pipeline with matrix testing
- **Cost**: $0/month operational cost (99%+ reduction achieved)

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
├── backend/                 # Express.js API server (development only, not deployed)
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
├── frontend/                # Angular 17+ SPA (client-side architecture)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Portfolio entry, results display
│   │   │   ├── services/    # API service (direct CoinGecko calls), URL persistence
│   │   │   ├── models/      # TypeScript interfaces
│   │   │   └── __tests__/   # Component and service tests
│   │   ├── assets/          # Static assets
│   │   └── styles.scss      # Global styles
│   ├── dist/                # Production build output
│   ├── .eslintrc.json       # ESLint configuration
│   ├── jest.config.js       # Jest + Angular testing
│   └── angular.json         # Angular project configuration
│
├── docs/                    # Documentation
│   ├── TESTING_GUIDE.md     # Comprehensive testing guide
│   ├── PROJECT_OVERVIEW.md  # High-level project documentation
│   └── *.md                 # Other planning documents
│
├── infrastructure/          # Terraform Infrastructure as Code
│   ├── environments/
│   │   └── production-simple/ # Active production environment
│   │       ├── main.tf      # Static Web App + Blob Storage
│   │       ├── outputs.tf   # Infrastructure outputs
│   │       └── variables.tf # Configuration variables
│   └── modules/            # Reusable Terraform modules
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

### Phase 1 (MVP) ✅ COMPLETE - CLIENT-SIDE ARCHITECTURE
- Manual portfolio entry with text-based coin exclusion
- Client-side market cap-based rebalancing for configurable portfolio size (1-50 coins)
- Direct CoinGecko API integration with 5-minute caching
- URL-based portfolio persistence (clean URLs without timestamps)
- Trade recommendations with USD values
- Enhanced allocations view with current vs target comparison
- Zero backend dependencies and $0/month operational cost

### Phase 2 (Ready for Implementation)
- Historical backtesting with Azure Blob Storage data
- Multiple rebalancing frequencies (monthly/quarterly/yearly)
- Performance metrics (Sharpe ratio, max drawdown)
- Transaction cost modeling
- Monthly Azure Function for data updates (~$0.01/month)

## API Integration (Client-Side Implementation)

### CoinGecko API (Direct Browser Calls)
- **Market Data**: `https://api.coingecko.com/api/v3/coins/markets` - Top coins by market cap
- **Price Data**: `https://api.coingecko.com/api/v3/simple/price` - Current prices for symbols
- **Search**: `https://api.coingecko.com/api/v3/search` - Search coins by name/symbol
- **Rebalancing**: Client-side calculation using fetched market data

### Client-Side Features
- **5-minute caching**: Reduces API calls and improves performance
- **Error handling**: Graceful fallbacks for rate limiting and API failures
- **CORS support**: Direct browser access to CoinGecko API
- **No authentication**: Uses free tier of CoinGecko API

### Legacy Backend (Development Only)
```bash
# Local testing endpoints (not deployed)
curl http://localhost:3001/api/v1/health
curl "http://localhost:3001/api/v1/market/top-coins?limit=5"
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

## 🚀 **IMMEDIATE NEXT STEPS FOR NEW DEVELOPER**

### ✅ **PHASE 1 CLIENT-SIDE ARCHITECTURE COMPLETE (June 8, 2025)**

**Phase 1 client-side architecture has been successfully implemented and deployed. The next developer should focus on Phase 2 backtesting implementation.**

### 📋 **PHASE 1 COMPLETION CHECKLIST**

- [x] **TASK 1**: Configure Azure Blob Storage with public read access and CORS
- [x] **TASK 2**: Modify Angular frontend to call CoinGecko API directly from browser  
- [x] **TASK 3**: Remove all backend dependencies from frontend code
- [x] **TASK 4**: Deploy client-side frontend to existing Azure Static Web App
- [x] **TASK 5**: Test portfolio analysis functionality with direct API calls
- **✅ Result Achieved**: $0/month cost, deployed and functional Phase 1

### 📋 **PHASE 2: BACKTESTING IMPLEMENTATION (NEXT PRIORITIES)**
- [ ] **TASK 6**: Create monthly Azure Function for historical data fetching (1st of month)
- [ ] **TASK 7**: Populate Azure Blob Storage with historical crypto data (5 years)  
- [ ] **TASK 8**: Implement client-side backtesting calculations in Angular
- [ ] **TASK 9**: Add monthly/quarterly/yearly rebalancing frequency options
- [ ] **TASK 10**: Create backtesting UI components and charts
- [ ] **TASK 11**: Test complete backtesting workflow end-to-end
- **Expected Result**: ~$0.01/month cost, sub-second backtesting performance

### 📋 **KEY IMPLEMENTATION DETAILS**

#### **Data Architecture (Finalized)**
- **Storage**: Azure Blob Storage with public read access (no authentication needed)
- **Format**: Single JSON file per coin (btc.json, eth.json) - 7.2KB each
- **Access**: Direct browser fetch using standard fetch() API calls
- **Updates**: Monthly Azure Function (100 CoinGecko API calls/month)
- **Computation**: All backtesting calculations run in browser JavaScript

#### **Critical Files to Reference**
- **`/docs/DEPLOYMENT_INFRASTRUCTURE.md`**: Complete architecture decisions and rationale
- **`/docs/TECHNICAL_ARCHITECTURE.md`**: Updated system architecture diagrams  
- **`/docs/PHASE2_BACKTESTING.md`**: Simplified backtesting implementation details
- **Existing infrastructure**: Azure Static Web App already deployed and functional

### 🎯 **SUCCESS CRITERIA**
- **Phase 1**: Portfolio analysis works with $0/month operational cost
- **Phase 2**: 5-year backtesting completes in under 1 second
- **Performance**: 99% cost reduction achieved while maintaining full functionality

### 📝 **HANDOFF NOTES**

#### **Phase 1 Status: ✅ COMPLETE**
- **Clean codebase**: All tests passing (70%+ coverage)
- **Client-side architecture**: Successfully deployed and functional
- **Live application**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net
- **Cost optimization**: 99%+ reduction achieved ($0/month operational cost)

#### **What's Been Implemented (June 8, 2025)**
- **Frontend**: Rewritten to call CoinGecko API directly from browser
- **Caching**: 5-minute client-side cache for API efficiency
- **Infrastructure**: Azure Blob Storage added for Phase 2 data
- **Deployment**: Production-ready Static Web App deployment
- **Backend Dependencies**: Completely eliminated for Phase 1

#### **Ready for Phase 2**
The next developer has everything needed for backtesting implementation:
- **Infrastructure**: Blob Storage configured and ready
- **Architecture**: Client-side foundation complete
- **Documentation**: Complete technical specifications in `/docs/` folder
- **Codebase**: Clean, tested, and production-deployed

**Estimated Phase 2 implementation time**: 1-2 weeks for historical backtesting

## Development Guidelines

### Client-Side Architecture (Current)
- Use TypeScript strict mode
- Follow Angular style guide for standalone components
- Implement comprehensive error handling for direct API calls
- Use client-side caching (5-minute window) to minimize API usage
- Write tests for all new features (Jest setup already complete)
- Test locally with `cd frontend && npm start` (backend optional)
- Deploy using Azure Static Web Apps CLI

### Phase 2 Development
- Implement historical data fetching with Azure Functions
- Store data in Azure Blob Storage (JSON format)
- Maintain client-side calculations for performance
- Test backtesting performance (target: sub-second execution)

### Commands
- `cd frontend && npm start` - Start development (client-side only)
- `npm test` - Run all tests
- `./test-all.sh` - Comprehensive test suite
- `terraform apply` - Deploy infrastructure changes