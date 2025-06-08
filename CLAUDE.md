# CLAUDE.md - AI Agent Instructions

**⚠️ REMINDER: Always check the web for today's date when referencing dates in documentation**

## 🎯 Project: Crypto Portfolio Analyzer
**Status**: Phase 1 DEPLOYED | Phase 2 READY  
**Live URL**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net  
**Architecture**: Client-side only (no backend deployment)

## 🚀 Quick Start
```bash
cd frontend && npm start   # Frontend: http://localhost:4200
# Backend is local-only, not deployed
```

## ⚡ Essential Commands
- **Tests**: `./test-all.sh` (must pass before commits)
- **Lint**: `npm run lint` (frontend and backend)
- **Build**: `cd frontend && npm run build:prod`

## 📁 Key Files for Common Tasks
- **Portfolio Logic**: `frontend/src/app/services/api.service.ts`
- **Rebalancing**: `frontend/src/app/components/rebalancing-results/`
- **Portfolio Entry**: `frontend/src/app/components/portfolio-entry/`
- **Types**: `frontend/src/app/models/portfolio.model.ts`

## 🛑 Critical Constraints
1. **NO backend deployment** - Client-side only
2. **$0/month cost** - Must maintain
3. **Direct API calls** - Browser to CoinGecko
4. **Test coverage** - Keep above 70%
5. **No authentication** - Anonymous usage only

## 📋 Common Tasks
See `AI_TASKS.md` for step-by-step templates:
- Add new feature
- Fix bug
- Update API integration
- Modify rebalancing logic
- **Session handoff protocol** (preparing project for next AI agent)

## 🔗 Detailed Context Files
- `AI_CONTEXT/CURRENT_STATE.md` - What's deployed now
- `AI_CONTEXT/CODE_PATTERNS.md` - How to implement features
- `AI_CONTEXT/FILE_MAP.md` - Where to make changes
- `AI_CONTEXT/CONSTRAINTS.md` - What not to do

## 🎯 Current Features (Phase 1 Complete)
- Portfolio entry with text-based coin exclusions
- Market cap-based rebalancing (1-50 coins configurable)
- Interactive charts showing current vs target allocations
- Trade recommendations with USD values
- URL-based portfolio persistence (no timestamps)
- 5-minute client-side caching for API efficiency

## 🚀 Next Phase
Phase 2 backtesting ready for implementation:
- Historical data analysis (5 years)
- Azure Blob Storage configured
- Performance metrics and comparisons
- Estimated implementation: 1-2 weeks

## 🧪 Testing
- Coverage requirement: 70%+
- All tests must pass before commits
- Use `./test-all.sh` for comprehensive testing
- Frontend: Jest + Angular Testing Library
- Backend: Jest + Supertest (local dev only)

## 🏗️ Architecture Notes
- Angular 17+ SPA with standalone components
- TypeScript strict mode
- Angular Material design system
- Direct CoinGecko API integration (free tier)
- Azure Static Web App hosting
- No user authentication required

## 📝 Development Guidelines
- Follow existing code patterns
- Maintain client-side architecture
- Write tests for new features
- Use TypeScript strict mode
- Follow Angular style guide
- Implement comprehensive error handling

## 🚀 Next Phase
Phase 2 backtesting ready for implementation:
- Historical data analysis (5 years)
- Azure Blob Storage configured
- Performance metrics and comparisons
- Estimated implementation: 1-2 weeks