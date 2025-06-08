# FILE_MAP.md
*Where to find and modify specific features*

## 🎯 Feature → File Mapping

### Portfolio Entry & Forms
- **Main Component**: `frontend/src/app/components/portfolio-entry/portfolio-entry.component.ts`
- **Template**: `frontend/src/app/components/portfolio-entry/portfolio-entry.component.html`
- **Tests**: `frontend/src/app/components/__tests__/portfolio-entry.component.spec.ts`

### Rebalancing & Charts
- **Main Component**: `frontend/src/app/components/rebalancing-results/rebalancing-results.component.ts`
- **Template**: `frontend/src/app/components/rebalancing-results/rebalancing-results.component.html`
- **Tests**: `frontend/src/app/components/__tests__/rebalancing-results-charts.component.spec.ts`

### API Integration
- **Main Service**: `frontend/src/app/services/api.service.ts`
- **Tests**: `frontend/src/app/services/__tests__/api.service.spec.ts`

### URL Persistence
- **Service**: `frontend/src/app/services/portfolio-url.service.ts`
- **Tests**: `frontend/src/app/services/__tests__/portfolio-url.service.spec.ts`

### Type Definitions
- **Main Types**: `frontend/src/app/models/portfolio.model.ts`
- **Backend Types**: `backend/src/models/types.ts` (local dev reference)

## 📁 Directory Structure Reference

### Frontend (Client-Side Production)
```
frontend/src/app/
├── components/
│   ├── portfolio-entry/           # Portfolio input form
│   │   ├── portfolio-entry.component.ts
│   │   └── portfolio-entry.component.html
│   ├── rebalancing-results/       # Results display & charts
│   │   ├── rebalancing-results.component.ts
│   │   └── rebalancing-results.component.html
│   └── __tests__/                 # Component tests
├── services/
│   ├── api.service.ts             # CoinGecko API calls
│   ├── portfolio-url.service.ts   # URL state management
│   └── __tests__/                 # Service tests
├── models/
│   └── portfolio.model.ts         # TypeScript interfaces
└── app.component.ts               # Root component
```

### Backend (Local Development Only)
```
backend/src/
├── controllers/
│   ├── marketController.ts        # Market data endpoints
│   └── rebalanceController.ts     # Rebalancing logic
├── services/
│   ├── marketDataService.ts       # Business logic
│   └── rebalancingService.ts      # Calculation engine
├── models/
│   └── types.ts                   # Shared interfaces
└── __tests__/                     # Backend tests
```

## 🔧 Common Modification Scenarios

### Adding New Portfolio Input Field
**Files to modify**:
1. `frontend/src/app/models/portfolio.model.ts` - Add to Portfolio interface
2. `frontend/src/app/components/portfolio-entry/portfolio-entry.component.ts` - Add form control
3. `frontend/src/app/components/portfolio-entry/portfolio-entry.component.html` - Add form field
4. `frontend/src/app/services/portfolio-url.service.ts` - Add URL serialization
5. **Tests**: Add to portfolio entry component tests

### Modifying Chart Display
**Files to modify**:
1. `frontend/src/app/components/rebalancing-results/rebalancing-results.component.ts` - Chart logic
2. `frontend/src/app/components/rebalancing-results/rebalancing-results.component.html` - Chart template
3. **Tests**: Add to rebalancing results tests

### Adding New API Endpoint Integration
**Files to modify**:
1. `frontend/src/app/services/api.service.ts` - Add new method
2. `frontend/src/app/models/portfolio.model.ts` - Add response types if needed
3. **Tests**: Add to api service tests

### Changing Rebalancing Algorithm
**Files to modify**:
1. `frontend/src/app/components/rebalancing-results/rebalancing-results.component.ts` - Update calculation
2. `backend/src/services/rebalancingService.ts` - Reference implementation (local)
3. **Tests**: Update rebalancing tests

### Adding Error Handling
**Files to modify**:
1. `frontend/src/app/services/api.service.ts` - Add error cases
2. `frontend/src/app/app.component.ts` - Global error display
3. **Tests**: Add error scenario tests

## 🧪 Test File Locations

### Frontend Tests
- **Component Tests**: `frontend/src/app/components/__tests__/`
- **Service Tests**: `frontend/src/app/services/__tests__/`
- **Test Config**: `frontend/jest.config.js`
- **Setup**: `frontend/src/setup-jest.ts`

### Backend Tests (Local Dev)
- **Unit Tests**: `backend/src/__tests__/unit/`
- **Integration Tests**: `backend/src/__tests__/integration/`
- **Test Config**: `backend/jest.config.js`
- **Setup**: `backend/src/__tests__/setup.ts`

## 🎨 Styling & Assets

### Styles
- **Global Styles**: `frontend/src/styles.scss`
- **Component Styles**: Inline in component files (Angular convention)

### Static Assets
- **Images/Icons**: `frontend/src/assets/`
- **Favicon**: `frontend/src/favicon.ico`

## 🏗️ Configuration Files

### Frontend Config
- **Angular Config**: `frontend/angular.json`
- **TypeScript**: `frontend/tsconfig.json`, `frontend/tsconfig.app.json`
- **Linting**: `frontend/.eslintrc.json`
- **Package**: `frontend/package.json`

### Backend Config (Local Dev)
- **TypeScript**: `backend/tsconfig.json`
- **Linting**: `backend/.eslintrc.js`
- **Package**: `backend/package.json`

## 🚀 Deployment & Infrastructure

### Azure Infrastructure
- **Terraform**: `infrastructure/environments/production-simple/`
- **Main Config**: `infrastructure/environments/production-simple/main.tf`

### CI/CD
- **GitHub Actions**: `.github/workflows/ci.yml`
- **Build Scripts**: `frontend/package.json` scripts section

### Development Scripts
- **Start Development**: `./start-dev.sh`
- **Run All Tests**: `./test-all.sh`

## 🔍 Debug & Monitoring

### Debug System
- **Debug Levels**: Configurable via localStorage `portfolioDebugLevel`
- **URL Parameter**: `?debug=3` for temporary debugging
- **Console Output**: Browser DevTools console

### Error Tracking
- **Frontend Errors**: Browser console + user notifications
- **API Errors**: Handled in api.service.ts with user-friendly messages

## 📦 Dependencies

### Frontend Dependencies
- **Angular**: 17+ with standalone components
- **Material**: Angular Material design system
- **RxJS**: Reactive programming for API calls
- **Chart.js**: Chart visualization (if used)

### Backend Dependencies (Local Dev)
- **Express**: Node.js web framework
- **Jest**: Testing framework
- **Supertest**: HTTP testing
- **Nock**: HTTP mocking