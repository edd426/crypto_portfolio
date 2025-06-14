# CLAUDE.md - AI Agent Instructions

## 🎯 Project: Crypto Portfolio Analyzer
**Status**: Phase 2 Complete | **Cost**: $0/month operational | **Architecture**: Client-side only  
**Live**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net

## 🚀 Quick Start
```bash
cd frontend && npm start        # Dev server: http://localhost:4200
./test-all.sh                  # All tests (must pass)
npm run lint                   # Code quality check
```

## 📁 Key Files
- **Portfolio Logic**: `frontend/src/app/services/api.service.ts`
- **Rebalancing**: `frontend/src/app/components/rebalancing-results/`
- **Portfolio Entry**: `frontend/src/app/components/portfolio-entry/`
- **Types**: `frontend/src/app/models/portfolio.model.ts`
- **Tests**: `frontend/src/app/__tests__/`, `frontend/src/app/*//__tests__/`

## 🔗 Detailed Context
- `AI_CONTEXT/CURRENT_STATE.md` - Current deployment status & next priorities
- `AI_CONTEXT/CODE_PATTERNS.md` - How to implement features correctly
- `AI_CONTEXT/FILE_MAP.md` - Where to find and modify specific features
- `AI_CONTEXT/CONSTRAINTS.md` - Hard rules and limitations (critical reading)
- `AI_CONTEXT/AI_TASKS.md` - Step-by-step templates for common tasks

## 🏗️ Tech Stack
- **Frontend**: Angular 17+ with standalone components, TypeScript strict mode
- **UI**: Angular Material design system
- **API**: Direct CoinGecko integration (free tier, rate limited)
- **Hosting**: Azure Static Web App
- **Data**: Azure Blob Storage (97 cryptocurrencies, 1 year historical data)
- **Testing**: Jest (105/105 tests passing, 57.3% coverage)

