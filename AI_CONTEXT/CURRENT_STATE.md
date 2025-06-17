# CURRENT_STATE.md
*Single source of truth for project status*

## ✅ DEPLOYMENT STATUS (Updated: June 17, 2025)
**Phase 1**: COMPLETE and LIVE  
**Production URL**: https://blue-glacier-0ffdf2d1e.6.azurestaticapps.net  
**Dev/Preview URL**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net
**Cost**: $0/month operational (99% reduction achieved)  
**CI/CD**: GitHub Actions + Azure Static Web Apps auto-deployment
**Production**: Stable deployment v1.0.1 with automatic deployment working

⚠️ **CRITICAL**: Always test on production URL, not preview URL!

## 🚀 IMMEDIATE NEXT PRIORITIES

Phase 2 infrastructure is complete. Immediate opportunities:
1. **Update frontend** to use all 97 coins (currently limited to 5)
2. **Enhanced UI** for coin selection in backtesting
3. **Performance optimization** for large portfolios
4. **Advanced metrics** (rolling Sharpe, correlation analysis)
5. **Export functionality** (CSV, PDF reports)

## 📝 RECENT SESSION NOTES (June 17, 2025)
- **BACKTESTING IMPROVEMENTS**: Fixed 3 major issues with Historical Backtesting tab
- **Issue 1 FIXED**: Settings form now stays visible after running backtest (like Portfolio Analysis tab)
- **Issue 2 FIXED**: Added Portfolio Value Over Time chart to Performance subtab using Chart.js
- **Issue 3 FIXED**: Updated calendar minimum date to Bitcoin launch (January 3, 2009)
- **Bundle Size**: Updated Angular build budgets to accommodate Chart.js (1.23MB total)
- **Testing notes**: All tests pass (105/105), linting clean, coverage at 56.55%

## 📁 FILES MODIFIED RECENTLY (June 17, 2025)
- `frontend/src/app/components/backtesting/backtesting.component.ts` - UPDATED: Historical Backtesting improvements
  - Added Portfolio Value Over Time chart with Chart.js integration
  - Fixed settings form visibility (always visible after backtest)
  - Set minimum date to Bitcoin launch (January 3, 2009)
  - Enhanced UI with date hints and proper validation
- `frontend/angular.json` - UPDATED: Build budgets increased to accommodate Chart.js
- `frontend/package.json` - UPDATED: Added Chart.js dependency

## 🏗️ ARCHITECTURE
- **Client-side only**: No backend deployment
- **API**: Direct CoinGecko calls from browser
- **Hosting**: Azure Static Web App
- **Storage**: Azure Blob Storage (ready for Phase 2)
- **Caching**: 5-minute client-side cache

## 🎯 WHAT WORKS NOW
- Portfolio entry with text-based exclusions
- Market cap-based rebalancing (1-50 coins)
- Interactive charts and allocations view
- Trade recommendations with USD values
- URL-based portfolio persistence
- Comprehensive error handling

## 📊 AZURE INFRASTRUCTURE

### Active Resources
- **Static Web App**: `stapp-cryptoportfolio-prod-9rc2a6` (FREE tier)
- **Storage Account**: `stcrypto9rc2a6` (Blob Storage - ready for Phase 2)
- **Resource Group**: `rg-cryptoportfolio-prod-9rc2a6`
- **Application Insights**: Monitoring enabled
- **Location**: West US 2

### Cost Optimization Achieved
- **Original Plan**: $50-100/month (Redis + Functions + API Management)
- **Current Cost**: $0/month (99%+ reduction)
- **Phase 2 Target**: $0.01/month (minimal Function for data updates)

### Infrastructure Decisions
- **✅ ELIMINATED**: Redis Cache, API Management, Key Vault
- **✅ SIMPLIFIED**: Single Static Web App + Blob Storage
- **✅ OPTIMIZED**: Client-side computation, direct API calls
- **✅ READY**: Phase 2 infrastructure configured

## 🧪 TESTING STATUS
- **Coverage**: 56.55% statements (target: 70%) - Down slightly due to new Chart.js code
- **Frontend Tests**: 105/105 passing 
- **Backend Tests**: REMOVED (architecture change)
- **Framework**: Jest (modernized from mixed Jest/Jasmine)
- **CI/CD**: GitHub Actions active
- **Recent**: Fixed Angular Material datepicker binding issue for Bitcoin launch date

## 🚀 PHASE 2 STATUS
- **Ready**: Infrastructure and foundation complete
- **Next**: Historical backtesting implementation
- **Timeline**: 1-2 weeks estimated
- **Cost**: $0.01/month projected

---

## 🚀 HANDOFF NOTES (Updated: June 17, 2025)

### **What Was Just Completed**
- **Historical Backtesting UI Improvements**: Fixed 3 major user-reported issues with the backtesting functionality
- **Settings Persistence**: Form now stays visible after running backtest (matching Portfolio Analysis behavior)
- **Performance Charts**: Added Portfolio Value Over Time chart using Chart.js library with proper formatting
- **Date Validation**: Set minimum date to Bitcoin launch (January 3, 2009) with user-friendly hints
- **Bundle Optimization**: Updated Angular build budgets to accommodate Chart.js without deployment failures
- **Code Quality**: All tests passing (105/105), linting clean, production deployment successful

### **Immediate Priorities for Next Developer**

#### 1. **Implement Additional Chart Types** (Priority: MEDIUM)
- **Next Step**: Add Cumulative Returns, Drawdown, and Asset Allocation charts to Performance tab
- **Foundation**: Chart.js integration is complete, reuse patterns from Portfolio Value Over Time chart
- **Files**: `frontend/src/app/components/backtesting/backtesting.component.ts:622-702` (createPerformanceChart method)
- **User Request**: "I would personally like to see more graphs over time on this part of the application"

#### 2. **Enhance Rebalancing Logic** (Priority: MEDIUM) 
- **Issue**: Current algorithm doesn't handle cash-only periods before first crypto appears
- **Requirements**: Cash should remain as cash until Bitcoin (2009), then 100% Bitcoin, then rebalance by market cap
- **Data Constraint**: Historical data only covers 1 year (2024-2025), not full crypto history
- **Files**: `frontend/src/app/services/backtesting.service.ts` (rebalancing logic)

#### 3. **Improve Test Coverage to 70%** (Priority: HIGH)
- **Current**: 56.55% statements, 39.15% branches (target: 70%)
- **Focus Areas**: Backtesting Service (4.21% coverage), Historical Data Service (28.75% coverage)
- **Files**: `frontend/src/app/services/backtesting.service.ts`, `frontend/src/app/services/historical-data.service.ts`
- **Action**: Use `.claude/templates/test.template.spec.ts` as starting point for comprehensive test suites

### **Known Issues**
- **Test Coverage Gap**: Need additional 13.45% coverage to reach 70% target (currently 56.55%)
- **Bundle Size**: 1.23 MB (up from 1.09 MB due to Chart.js, within acceptable limits)
- **Future Enhancement**: Rebalancing logic could be more sophisticated for long historical periods
- **Data Limitation**: Historical data only covers 1 year, not full cryptocurrency history

### **Files to Focus On**
- **NEXT CHARTS**: `frontend/src/app/components/backtesting/backtesting.component.ts:622-702` (add more chart types)
- **REBALANCING**: `frontend/src/app/services/backtesting.service.ts` (enhance algorithm logic)
- **TEST COVERAGE**: `frontend/src/app/services/backtesting.service.ts` (4.21% coverage - add comprehensive tests)
- **TEST COVERAGE**: `frontend/src/app/services/historical-data.service.ts` (28.75% coverage - add service tests)
- **REFERENCE**: Chart.js integration pattern already established in createPerformanceChart method