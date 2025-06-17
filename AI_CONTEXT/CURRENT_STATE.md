# CURRENT_STATE.md
*Single source of truth for project status*

## ✅ DEPLOYMENT STATUS (Updated: June 16, 2025)
**Phase 1**: COMPLETE and LIVE  
**Live URL**: https://blue-glacier-0ffdf2d1e-preview.westus2.6.azurestaticapps.net  
**Cost**: $0/month operational (99% reduction achieved)  
**CI/CD**: GitHub Actions passing (105/105 tests)
**Production**: Stable deployment v1.0.1

## 🚀 IMMEDIATE NEXT PRIORITIES

Phase 2 infrastructure is complete. Immediate opportunities:
1. **Update frontend** to use all 97 coins (currently limited to 5)
2. **Enhanced UI** for coin selection in backtesting
3. **Performance optimization** for large portfolios
4. **Advanced metrics** (rolling Sharpe, correlation analysis)
5. **Export functionality** (CSV, PDF reports)

## 📝 RECENT SESSION NOTES (June 17, 2025)
- **What was completed**: AI agent management infrastructure improvements, behavioral guidelines, smart templates
- **Major additions**: AI_CONTEXT/AGENT_GUIDELINES.md for behavioral rules, .claude/templates/ for code consistency
- **Current status**: Enhanced AI agent workflow with context priority guide, error recovery procedures, file templates
- **Known issues**: Historical Backtesting tab not visible in production (renders in build but missing from UI)
- **Testing notes**: All tests pass (105/105), linting clean, coverage at 57.4%

## 📁 FILES MODIFIED RECENTLY (June 17, 2025)
- `AI_CONTEXT/AGENT_GUIDELINES.md` - NEW: AI agent behavioral guidelines with decision framework, pitfalls, recovery procedures
- `.claude/templates/component.template.ts` - NEW: Smart component template following project patterns
- `.claude/templates/service.template.ts` - NEW: Smart service template with caching and error handling
- `.claude/templates/test.template.spec.ts` - NEW: Smart test template with comprehensive coverage patterns  
- `.claude/templates/model.template.ts` - NEW: Smart model template with TypeScript types and validation
- `.claude/templates/README.md` - NEW: Documentation for using smart templates
- `CLAUDE.md` - UPDATED: Added reference to AGENT_GUIDELINES.md and templates directory

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
- **Coverage**: 57.3% statements (target: 70%)
- **Frontend Tests**: 105/105 passing (previously 74/105)
- **Backend Tests**: REMOVED (architecture change)
- **Framework**: Jest (modernized from mixed Jest/Jasmine)
- **CI/CD**: GitHub Actions active

## 🚀 PHASE 2 STATUS
- **Ready**: Infrastructure and foundation complete
- **Next**: Historical backtesting implementation
- **Timeline**: 1-2 weeks estimated
- **Cost**: $0.01/month projected

---

## 🚀 HANDOFF NOTES (Updated: June 17, 2025)

### **What Was Just Completed**
- **AI Agent Infrastructure**: Created comprehensive behavioral guidelines and decision framework for AI agents
- **Smart File Templates**: Built template system for components, services, tests, and models with project patterns
- **Context Management**: Added priority guide for efficient context loading and tool usage optimization
- **Error Recovery System**: Implemented rollback procedures and recovery patterns for common AI mistakes
- **Code Consistency**: Established templates that follow Angular 17+ standalone components and Material Design
- **Documentation Structure**: Enhanced AI agent workflow with clear guidelines and best practices

### **Immediate Priorities for Next Developer**

#### 1. **Use AI Agent Guidelines for All Development** (Priority: HIGH)
- **New Resource**: Read `AI_CONTEXT/AGENT_GUIDELINES.md` before starting any work
- **Benefits**: Prevents common AI mistakes, provides context priority guide, includes error recovery procedures
- **Files**: All development should follow the behavioral guidelines and use smart templates in `.claude/templates/`
- **Impact**: Dramatically improved AI agent effectiveness and code consistency

#### 2. **CRITICAL: Fix Historical Backtesting Tab Visibility** (Priority: URGENT)
- **Issue**: Tab exists in template and builds successfully but doesn't render in production UI
- **Investigation**: BacktestingComponent may be failing silently during runtime initialization
- **Files**: `frontend/src/app/components/backtesting/backtesting.component.ts`, `frontend/src/app/app.component.ts`
- **Action**: Debug runtime component loading, check browser console for errors, verify Material Design tab rendering
- **Impact**: Core feature completely inaccessible to users despite infrastructure being ready

#### 3. **Improve Test Coverage to 70%** (Priority: HIGH)
- **Current**: 57.4% statements, 39.37% branches (target: 70%)
- **Focus Areas**: Backtesting Service (4.21% coverage), Historical Data Service (28.75% coverage)
- **Files**: `frontend/src/app/services/backtesting.service.ts`, `frontend/src/app/services/historical-data.service.ts`
- **Action**: Use `.claude/templates/test.template.spec.ts` as starting point for comprehensive test suites
- **Impact**: Meet project test coverage requirements and improve code reliability

### **Known Issues**
- **BLOCKING**: Historical Backtesting tab not visible in production despite successful builds
- **Test Coverage Gap**: Need additional 12.6% coverage to reach 70% target  
- **Bundle Size Warning**: 1.09 MB bundle (expected for Angular Material, not blocking)
- **Production Status**: Portfolio Analysis works perfectly, Backtesting tab missing from UI

### **Files to Focus On**
- **START HERE**: `AI_CONTEXT/AGENT_GUIDELINES.md` (read behavioral guidelines first)
- **Templates**: `.claude/templates/` (use for new components, services, tests)
- **URGENT**: `frontend/src/app/components/backtesting/backtesting.component.ts` (fix runtime loading issue)
- **Primary**: `frontend/src/app/app.component.ts` (investigate tab group rendering)
- **Secondary**: `frontend/src/app/services/backtesting.service.ts` (add tests once tab is visible)
- **Reference**: Browser developer console in production for component loading errors