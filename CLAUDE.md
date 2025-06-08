# CLAUDE.md - AI Agent Instructions

**⚠️ REMINDER: Always check the web for today's date when referencing dates in documentation**

## 🎯 Project: Crypto Portfolio Analyzer
**Status**: ✅ PHASE 2 COMPLETE - TOP 100 COINS READY (June 8, 2025)  
**Live URL**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net  
**Architecture**: Client-side with Azure Functions + Blob Storage  
**Data Coverage**: 97 unique cryptocurrencies from top 100 by market cap

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

## ✅ Complete Features (Phase 1 + Phase 2)

### **Phase 1 - Portfolio Analysis**
- Portfolio entry with text-based coin exclusions
- Market cap-based rebalancing (1-50 coins configurable)
- Interactive charts showing current vs target allocations
- Trade recommendations with USD values
- URL-based portfolio persistence (no timestamps)
- 5-minute client-side caching for API efficiency

### **Phase 2 - Historical Backtesting (COMPLETE - June 8, 2025)**
- ✅ **Complete historical data**: 97 unique cryptocurrencies from top 100
- ✅ **1 year of daily data**: 2024-06-09 to 2025-06-08 (366 days)
- ✅ **Total dataset**: ~36,600 data points, 4.6MB comprehensive coverage
- ✅ Azure Functions for monthly data updates (deployed and ready)
- ✅ Azure Blob Storage with public read access and CORS enabled
- ✅ Client-side backtesting engine with sub-second performance
- ✅ Multiple rebalancing frequencies (monthly/quarterly/yearly)
- ✅ Performance metrics (Sharpe ratio, max drawdown, total return)
- ✅ Transaction cost modeling (configurable fees)
- ✅ Comprehensive CoinGecko API integration with rate limiting
- ✅ Cost monitoring and budget alerts ($0.01/month operational cost)
- ✅ Data validation and quality assurance (zero errors detected)

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

## 🌐 **Historical Data Coverage (June 8, 2025)**
**Live Data**: https://stcrypto9rc2a6.blob.core.windows.net/historical-data/
- **97 unique cryptocurrencies** (100% of top 100 unique symbols)
- **Major coins**: BTC, ETH, BNB, ADA, SOL, AVAX, DOT, LINK, UNI, AAVE
- **Stablecoins**: USDT, USDC, DAI, USDS, FDUSD
- **DeFi tokens**: Complete coverage of major protocols
- **Meme coins**: DOGE, SHIB, PEPE, BONK
- **Layer 1s**: All major blockchains represented
- **Format**: JSON with priceHistory arrays, direct browser access

## 🔄 **Data Updates**
- **Azure Function**: Deployed for monthly updates (1st of each month)
- **Cost**: $0.01/month operational cost achieved
- **Rate limiting**: CoinGecko API compliance (45 requests/minute)
- **Quality assurance**: Automated validation and error detection

## 🚀 **Next Steps for New Developer**
Phase 2 infrastructure is complete. Immediate opportunities:
1. **Update frontend** to use all 97 coins (currently limited to 5)
2. **Enhanced UI** for coin selection in backtesting
3. **Performance optimization** for large portfolios
4. **Advanced metrics** (rolling Sharpe, correlation analysis)
5. **Export functionality** (CSV, PDF reports)