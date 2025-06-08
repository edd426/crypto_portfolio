# Contributing to Crypto Portfolio Analyzer

Welcome! This guide will help you get started with contributing to the project.

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- No API keys required

### Development Setup
```bash
# Clone and start development
git clone <repo-url>
cd crypto_portfolio
./start-dev.sh
```

**Access**: http://localhost:4200

## 🏗️ Architecture Overview

### Current (Phase 1) - Client-Side Only
```
Browser → CoinGecko API (direct)
   ↓
Angular SPA (calculations, charts, state)
   ↓
Azure Static Web App (hosting)
```

### Key Principles
- **Client-side only**: No backend deployment
- **$0/month cost**: Free Azure Static Web App
- **Direct API integration**: Browser calls CoinGecko
- **Anonymous usage**: No authentication

## 📁 Project Structure

```
crypto_portfolio/
├── frontend/                # Angular 17+ SPA (production)
│   ├── src/app/
│   │   ├── components/      # UI components
│   │   ├── services/        # API & business logic
│   │   └── models/          # TypeScript types
├── backend/                 # Express.js (local dev only)
├── AI_CONTEXT/              # AI agent reference files
├── docs/                    # Detailed documentation
└── infrastructure/          # Terraform (Azure)
```

## 🛠️ Development Workflow

### 1. Making Changes
```bash
# Start development servers
./start-dev.sh

# Make your changes in frontend/src/

# Test your changes
./test-all.sh
npm run lint
```

### 2. Key Files to Know
- **Portfolio Logic**: `frontend/src/app/services/api.service.ts`
- **Main Components**: `frontend/src/app/components/`
- **Types**: `frontend/src/app/models/portfolio.model.ts`
- **Tests**: `*/__tests__/*` directories

### 3. Testing Requirements
- **Coverage**: Maintain 70%+ test coverage
- **All tests must pass**: Run `./test-all.sh`
- **Linting**: No ESLint errors allowed

## 🚨 Critical Constraints

### What You MUST NOT Do
1. **Deploy backend** to any cloud service
2. **Add monthly costs** (keep at $0/month)
3. **Break test coverage** below 70%
4. **Add authentication** or user accounts
5. **Use databases** or persistent storage

### What You CAN Do
- UI/UX improvements
- Client-side feature additions
- Performance optimizations
- Bug fixes
- Test improvements

## 🧪 Testing

### Run Tests
```bash
./test-all.sh              # Full test suite (recommended)
npm test                   # Quick run
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Test Structure
- **Frontend**: Jest + Angular Testing Library
- **Backend**: Jest + Supertest (local dev reference)
- **Coverage threshold**: 70% minimum

### Writing Tests
- Component tests: User interactions and rendering
- Service tests: API calls and business logic
- Mock external APIs (CoinGecko)

## 🔧 Common Tasks

### Adding a New Feature
1. Check `AI_CONTEXT/CONSTRAINTS.md` for limitations
2. Look at `AI_CONTEXT/CODE_PATTERNS.md` for examples
3. Use `AI_CONTEXT/FILE_MAP.md` to find relevant files
4. Follow existing patterns and architecture
5. Add comprehensive tests
6. Update documentation if needed

### Fixing Bugs
1. Reproduce the issue locally
2. Write a test that demonstrates the bug
3. Fix the issue while maintaining architecture
4. Ensure the test passes
5. Run full test suite

### Code Style
- **TypeScript strict mode** required
- **Angular style guide** for components
- **ESLint** must pass with zero errors
- **Material Design** for UI components

## 📊 API Integration

### CoinGecko API
- **Endpoint**: https://api.coingecko.com/api/v3
- **Rate limit**: Respect 50 calls/minute
- **Caching**: 5-minute minimum cache
- **No API key**: Use free tier only

### Error Handling
- Handle rate limiting (429 errors)
- Provide user-friendly error messages
- Implement retry logic with backoff
- Cache responses appropriately

## 🚀 Deployment

### Automatic Deployment
- **GitHub Actions** handles all deployments
- **Push to main** triggers production deployment
- **Pull requests** create preview deployments

### Manual Testing
- Test locally before creating PR
- Verify in browser console for errors
- Check responsive design
- Test error scenarios

## 📖 Documentation

### For New Features
- Update `AI_CONTEXT/FILE_MAP.md` if adding new files
- Add patterns to `AI_CONTEXT/CODE_PATTERNS.md`
- Update `AI_TASKS.md` if creating new workflows

### For AI Agents
- Keep `CLAUDE.md` updated with current status
- Maintain `AI_CONTEXT/CURRENT_STATE.md`
- Update constraints if needed

## 🎯 Phase 2 (Future)

### Ready for Implementation
- Historical backtesting (5 years data)
- Performance metrics (Sharpe ratio, drawdown)
- Azure Function for monthly data updates
- Cost target: $0.01/month

### Implementation Guide
See `docs/PHASE2_BACKTESTING.md` for detailed specifications.

## 💡 Getting Help

### Resources
- **Architecture**: `docs/TECHNICAL_ARCHITECTURE.md`
- **Testing**: `docs/TESTING_GUIDE.md`
- **AI Context**: `AI_CONTEXT/` directory
- **Live Demo**: Check the deployed app for reference

### Common Issues
- **API Rate Limiting**: Enable caching, respect limits
- **Test Failures**: Check mocks and async handling
- **Type Errors**: Use TypeScript strict mode
- **Chart Issues**: Enable debug mode (`?debug=3`)

## 📝 Pull Request Process

1. **Create feature branch** from main
2. **Make changes** following guidelines
3. **Run full test suite** (`./test-all.sh`)
4. **Create pull request** with clear description
5. **Address review feedback**
6. **Merge after approval**

### PR Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] Test coverage maintained
- [ ] Documentation updated
- [ ] Manual testing completed
- [ ] No new monthly costs introduced

---

Thank you for contributing! 🎉