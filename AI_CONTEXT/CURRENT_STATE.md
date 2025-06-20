# CURRENT_STATE.md
*Single source of truth for project status*

## ✅ DEPLOYMENT STATUS (Updated: June 20, 2025)
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

## 📝 RECENT SESSION NOTES (June 20, 2025)
- **CRITICAL API DISCOVERY**: CoinGecko free API severely limited - only recent 1 year of data, no historical access
- **SCRIPT CONSOLIDATION**: Reduced scripts from 15 → 9 files (40% reduction), eliminated redundant download variants
- **DATA RESEARCH**: Identified multiple free alternatives (CryptoDataDownload, Kaggle, yfinance) for full historical data
- **ENHANCED MONITORING**: Created detailed progress checker with date ranges and gap detection capabilities
- **DOCUMENTATION UPDATED**: Added comprehensive API limitations and alternative data sources
- **Testing notes**: All tests pass (105/105), linting clean, coverage at 55.65%

## 📁 FILES MODIFIED RECENTLY (June 20, 2025)
- `functions/historical-data-updater/scripts/download.js` - NEW: Consolidated downloader replacing 4 scripts
  - Works within CoinGecko free API limits (365 days max)
  - Command-line interface with --coins and --force options
  - Fixed historical data calculation (was incorrectly limited to 2000 days)
- `functions/historical-data-updater/scripts/check-progress-enhanced.js` - NEW: Advanced progress analysis
  - Shows date ranges, data gaps, and coverage quality for each coin
  - Comprehensive statistics and recommendations
- `functions/historical-data-updater/scripts/README.md` - MAJOR UPDATE: API limitations documentation
- `AI_CONTEXT/CONSTRAINTS.md` - UPDATED: Added CoinGecko free API limitations
- `CLAUDE.md` - UPDATED: Highlighted data limitation impact
- DELETED: 5 redundant scripts (download-top10.js, download-top100.js, etc.)

## 🏗️ ARCHITECTURE
- **Client-side only**: No backend deployment
- **API**: Direct CoinGecko calls from browser (**MAJOR LIMITATION**: Free tier only provides recent 1 year data)
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
- **Coverage**: 55.65% statements (target: 70%) - Stable
- **Frontend Tests**: 105/105 passing 
- **Backend Tests**: REMOVED (architecture change)
- **Framework**: Jest (modernized from mixed Jest/Jasmine)
- **CI/CD**: GitHub Actions active
- **Recent**: All tests pass after script consolidation, no regressions introduced

## 🚀 PHASE 2 STATUS
- **BLOCKED**: CoinGecko free API only provides recent 1 year data, not full historical data needed for backtesting
- **Alternative Data Sources Identified**: CryptoDataDownload.com, Kaggle datasets, yfinance library
- **Next**: Implement alternative data collection strategy for full historical data (Bitcoin from 2014, Ethereum from 2016)
- **Timeline**: 2-3 weeks estimated (increased due to data source change)
- **Cost**: $0.01/month projected (still achievable with free data sources)

---

## 🚀 HANDOFF NOTES (Updated: June 20, 2025)

### **What Was Just Completed**
- **CRITICAL DATA DISCOVERY**: Identified major limitation in CoinGecko free API - only provides recent 1 year of data, blocking historical backtesting
- **COMPREHENSIVE RESEARCH**: Analyzed 10+ alternative data sources, identified viable free solutions (CryptoDataDownload, Kaggle, yfinance)
- **SCRIPT CONSOLIDATION**: Eliminated 5 redundant download scripts (40% reduction), created unified download.js with proper API limits
- **ENHANCED MONITORING**: Built detailed progress checker showing date ranges, gaps, and data quality metrics
- **COMPREHENSIVE DOCUMENTATION**: Updated all relevant docs with API limitations and alternative solutions
- **CODE QUALITY**: All tests passing (105/105), linting clean, no regressions introduced

### **Immediate Priorities for Next Developer**

#### 1. **Implement Alternative Historical Data Collection** (Priority: CRITICAL)
- **BLOCKER**: CoinGecko free API cannot provide historical data needed for backtesting (only recent 365 days)
- **Solution**: Implement multi-source data collection using free alternatives identified in research
- **Sources**: CryptoDataDownload.com (CSV files), Kaggle datasets, yfinance library
- **Coverage**: Bitcoin from 2014, Ethereum from 2016, 50+ major cryptocurrencies
- **Files**: `functions/historical-data-updater/scripts/` - create new collection strategy
- **Research**: Complete research document available in session notes above

#### 2. **Test Coverage to 70%** (Priority: HIGH)
- **Current**: 55.65% statements (target: 70%) 
- **Focus Areas**: Backtesting Service (4.21% coverage), Historical Data Service (28.75% coverage)
- **Files**: `frontend/src/app/services/backtesting.service.ts`, `frontend/src/app/services/historical-data.service.ts`
- **Action**: Use `.claude/templates/test.template.spec.ts` as starting point for comprehensive test suites

#### 3. **Validate Current Historical Data** (Priority: MEDIUM)
- **Issue**: Current Azure Blob Storage data is limited to 1 year (2024-2025) 
- **Action**: Run enhanced progress checker to audit existing data: `node check-progress-enhanced.js`
- **Next**: Compare with requirements and plan data replacement strategy
- **Files**: `functions/historical-data-updater/scripts/check-progress-enhanced.js`

### **Known Issues**
- **CRITICAL DATA LIMITATION**: CoinGecko free API blocks historical backtesting functionality
- **Test Coverage Gap**: Need additional 14.35% coverage to reach 70% target (currently 55.65%)
- **Data Strategy**: Must implement alternative data sources for project viability
- **Timeline Impact**: Phase 2 delayed until historical data collection is resolved

### **Files to Focus On**
- **CRITICAL**: `functions/historical-data-updater/scripts/` - implement new data collection strategy
- **DATA AUDIT**: `functions/historical-data-updater/scripts/check-progress-enhanced.js` - run to assess current data
- **TEST COVERAGE**: `frontend/src/app/services/backtesting.service.ts` (4.21% coverage - add comprehensive tests)
- **TEST COVERAGE**: `frontend/src/app/services/historical-data.service.ts` (28.75% coverage - add service tests)
- **RESEARCH REFERENCE**: Alternative data sources documented in session notes above