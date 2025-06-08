# CONSTRAINTS.md
*Hard rules and limitations - DO NOT violate these*

## 🚨 CRITICAL CONSTRAINTS

### 1. NO Backend Deployment
- **NEVER deploy backend code** to Azure or any cloud service
- Backend exists only for local development reference
- All production functionality must be client-side
- Direct browser-to-CoinGecko API calls only

### 2. $0/Month Operational Cost
- **MUST maintain zero monthly cost** for Phase 1
- Only Azure Static Web App (free tier) allowed
- No Azure Functions until Phase 2
- No additional cloud services without approval

### 3. Client-Side Only Architecture  
- All calculations must run in browser JavaScript
- No server-side processing in production
- No database connections from frontend
- Use localStorage/URL params for state only

### 4. Test Coverage Requirement
- **Minimum 70% test coverage** must be maintained
- All tests must pass before commits
- No exceptions for quick fixes
- Run `./test-all.sh` before any commit

### 5. No Authentication
- **Anonymous usage only** - no user accounts
- No login/logout functionality
- No user data storage (beyond URL persistence)
- No session management

## 🔒 API CONSTRAINTS

### CoinGecko API Rules
- **Free tier only** - no paid plans
- Respect rate limits (50 calls/minute)
- Use 5-minute caching minimum
- Handle 429 errors gracefully
- No API key required or allowed

### Direct API Calls Only
- **Browser-to-CoinGecko** direct calls
- No proxy services
- No middleware or backend API calls
- CORS must be handled client-side

## 📊 Data Constraints

### No Database Usage
- **No SQL databases** (PostgreSQL, MySQL, etc.)
- **No NoSQL databases** (MongoDB, CosmosDB, etc.)
- **No Redis or caching services**
- URL parameters and localStorage only

### State Management
- Portfolio data in URL parameters
- Debug settings in localStorage
- 5-minute API response caching only
- No persistent user sessions

## 🏗️ Architecture Constraints

### Angular Framework Rules
- **Angular 17+ only** with standalone components
- TypeScript strict mode required
- Angular Material for UI components
- No third-party component libraries without approval

### Code Quality Requirements
- **ESLint must pass** with zero errors
- TypeScript compilation with zero errors
- No console.log in production builds
- Use debug system for logging

### File Structure Rules
- Follow existing directory structure
- Component tests in `__tests__/` directories
- Services in `services/` directory
- Types in `models/` directory

## 💰 Cost Control Constraints

### Azure Resource Limits
- **Static Web App only** for Phase 1
- Blob Storage ready for Phase 2 (not actively used)
- No additional resource groups
- No premium tiers or paid features

### Phase 2 Cost Constraints
- **Maximum $0.01/month** operational cost
- Azure Functions: 1 function, monthly execution only
- Blob Storage: Public read access, minimal storage
- No Application Insights beyond free tier

## 🔧 Development Constraints

### Local Development Rules
- Backend runs locally only for testing
- Never commit backend deployment configs
- Use `cd frontend && npm start` for development
- Backend testing optional but recommended

### Testing Requirements
- **Jest framework only** for all tests
- No additional testing libraries without approval
- Maintain existing test structure
- Mock all external API calls in tests

### Deployment Rules
- **GitHub Actions only** for CI/CD
- Deploy to existing Azure Static Web App
- No manual deployments to production
- All changes via pull requests

## 🚫 FORBIDDEN ACTIONS

### Never Do These:
1. **Deploy backend** to any cloud service
2. **Add monthly costs** without explicit approval  
3. **Break test coverage** below 70%
4. **Add user authentication** or login systems
5. **Use databases** or persistent storage services
6. **Create new Azure resources** without approval
7. **Bypass rate limiting** or abuse APIs
8. **Remove caching** mechanisms
9. **Add paid API keys** or subscriptions
10. **Change architecture** from client-side

### Code Quality Violations:
1. **Skip linting** or ignore ESLint errors
2. **Commit with failing tests**
3. **Add console.log** without debug system
4. **Break TypeScript strict mode**
5. **Remove error handling**
6. **Add security vulnerabilities**

### API Abuse Prevention:
1. **No rapid API calls** (respect 5-minute cache)
2. **No parallel requests** to same endpoint
3. **No retry loops** without backoff
4. **No API key usage** (free tier only)

## ✅ APPROVED MODIFICATIONS

### Safe Changes:
- UI/UX improvements within Material Design
- Client-side calculation optimizations
- Error handling enhancements
- Test coverage improvements
- Code refactoring without architecture changes
- Debug system enhancements
- Chart visualization improvements

### Requires Discussion:
- New external API integrations
- Additional NPM dependencies
- Architecture changes for Phase 2
- New testing frameworks or tools
- Performance optimization strategies

## 🎯 SUCCESS METRICS

### Must Maintain:
- **$0/month operational cost** for Phase 1
- **70%+ test coverage** across all code
- **Zero linting errors** in CI/CD
- **Sub-second response times** for calculations
- **100% client-side functionality**

### Performance Targets:
- Page load: < 3 seconds
- Rebalancing calculation: < 1 second  
- API response caching: 5 minutes minimum
- Chart rendering: < 500ms