# AI_TASKS.md - Common Task Templates
*Updated: June 8, 2025 - Added comprehensive session handoff protocol*

## 🔧 Adding a New Feature

### Steps:
1. **Check constraints**: Review `AI_CONTEXT/CONSTRAINTS.md` for limitations
2. **Find patterns**: Look at similar features in `AI_CONTEXT/CODE_PATTERNS.md`
3. **Locate files**: Use `AI_CONTEXT/FILE_MAP.md` for component locations
4. **Follow patterns**: Implement using existing architectural patterns
5. **Test thoroughly**: Run `./test-all.sh` and add new tests
6. **Lint code**: Run `npm run lint` to ensure code quality

### Example: Adding a new chart type
```bash
# 1. Create component
cd frontend/src/app/components/rebalancing-results
# Edit rebalancing-results.component.ts and .html

# 2. Add to types if needed
# Edit frontend/src/app/models/portfolio.model.ts

# 3. Test
./test-all.sh
```

## 🐛 Fixing a Bug

### Steps:
1. **Reproduce locally**: Start frontend with `cd frontend && npm start`
2. **Identify location**: Use `AI_CONTEXT/FILE_MAP.md` to find relevant files
3. **Check patterns**: Review `AI_CONTEXT/CODE_PATTERNS.md` for proper approach
4. **Apply fix**: Maintain existing architecture (client-side only)
5. **Add test case**: Prevent regression with specific test
6. **Verify fix**: Run `npm test` and manual testing

### Common Bug Locations:
- **API errors**: `frontend/src/app/services/api.service.ts`
- **Chart issues**: `frontend/src/app/components/rebalancing-results/`
- **Form validation**: `frontend/src/app/components/portfolio-entry/`

## 🔄 Updating API Integration

### Steps:
1. **Check CoinGecko docs**: Ensure API endpoint compatibility
2. **Update service**: Modify `frontend/src/app/services/api.service.ts`
3. **Update types**: Modify `frontend/src/app/models/portfolio.model.ts` if needed
4. **Test API calls**: Verify caching and error handling work
5. **Update tests**: Ensure API mocks match new implementation

### Key Files:
- `frontend/src/app/services/api.service.ts` - Main API logic
- `frontend/src/app/services/__tests__/api.service.spec.ts` - API tests

## ⚖️ Modifying Rebalancing Logic

### Steps:
1. **Understand current logic**: Review existing calculation methods
2. **Test with sample data**: Use known portfolio data for validation
3. **Update calculations**: Modify rebalancing algorithms
4. **Verify accuracy**: Compare results with manual calculations
5. **Update tests**: Ensure test cases cover new logic

### Key Files:
- `frontend/src/app/components/rebalancing-results/rebalancing-results.component.ts`
- `backend/src/services/rebalancingService.ts` (local dev reference)

## 🧪 Adding Tests

### Frontend Tests:
```bash
cd frontend
npm run test:watch  # Watch mode for development
```

### Backend Tests (Local Dev):
```bash
cd backend  
npm run test:watch
```

### Test Patterns:
- **Component tests**: Test user interactions and rendering
- **Service tests**: Test API calls and business logic
- **Integration tests**: Test complete workflows

## 🚀 Phase 2 Implementation (Backtesting)

### Steps for Historical Data Integration:
1. **Set up Azure Function**: Monthly data fetching
2. **Design data schema**: Historical price data structure
3. **Implement client-side backtesting**: Browser-based calculations
4. **Add time period selection**: Monthly/quarterly/yearly options
5. **Create performance metrics**: Sharpe ratio, drawdown, returns
6. **Build backtesting UI**: Charts and results display

### Key Considerations:
- Maintain $0.01/month cost target
- Keep calculations client-side for performance
- Use Azure Blob Storage for historical data
- Implement progressive loading for large datasets

## 🔍 Debug Common Issues

### Debug Mode:
```javascript
// Browser console
localStorage.setItem('portfolioDebugLevel', '3');
// Or URL parameter: ?debug=3
```

### Common Issues:
- **API rate limiting**: Check CoinGecko API status
- **Chart rendering**: Enable debug mode for chart data
- **Caching issues**: Clear localStorage or disable cache
- **Type errors**: Check TypeScript compilation

## 📋 Before Every Commit

### Checklist:
1. ✅ Run `./test-all.sh` - All tests pass
2. ✅ Run `npm run lint` - No linting errors  
3. ✅ Test manually in browser - Features work
4. ✅ Check debug output - No console errors
5. ✅ Verify client-side only - No backend dependencies
6. ✅ Maintain $0/month cost - No new cloud resources

## 🔄 Session Handoff Protocol

**Use this protocol when completing a work session to prepare for the next AI agent.**

### Phase 1: Session Review & Cleanup

#### 1. Review Accomplishments
```bash
# Check git status for all changes
git status
git diff --cached
git diff
```

**Document what was accomplished**:
- List all features added/modified
- Note any bugs fixed
- Record architecture changes
- Identify any incomplete work

#### 2. Clean Up Temporary Files
```bash
# Remove any temporary files created during session
find . -name "*.tmp" -delete
find . -name "*.bak" -delete

# Check for any debug files or console logs
grep -r "console.log" frontend/src/ --exclude-dir=node_modules
```

#### 3. Remove Outdated Information
- Delete any obsolete documentation files
- Remove outdated comments in code
- Clean up any experimental code that wasn't used
- Archive old files to `.archive/` if historically relevant

### Phase 2: Documentation Updates

#### 4. Update Current State
**Update `AI_CONTEXT/CURRENT_STATE.md`**:
- [ ] Current deployment status
- [ ] Live URL (if changed)
- [ ] Testing status and coverage
- [ ] Phase completion status
- [ ] Any new Azure resources

#### 5. Update File Mappings
**Update `AI_CONTEXT/FILE_MAP.md`** if you:
- Added new components or services
- Moved files to different locations
- Created new directories
- Modified the project structure

#### 6. Update Code Patterns
**Update `AI_CONTEXT/CODE_PATTERNS.md`** if you:
- Established new coding patterns
- Changed existing patterns
- Added new architectural approaches
- Implemented new testing patterns

#### 7. Update Constraints
**Update `AI_CONTEXT/CONSTRAINTS.md`** if you:
- Identified new limitations
- Changed cost constraints
- Added new "never do" rules
- Modified testing requirements

#### 8. Update Task Templates
**Update `AI_TASKS.md`** if you:
- Created new workflows
- Found better approaches to existing tasks
- Identified common issues and solutions
- Added new debugging techniques

### Phase 3: Main Documentation Updates

#### 9. Update CLAUDE.md
**⚠️ IMPORTANT: Keep CLAUDE.md concise - detailed updates go in AI_CONTEXT/ files**

**Update only if these core items changed**:
- [ ] Project status (Phase 1/2 completion) 
- [ ] Live URL if changed
- [ ] Critical constraints that affect all development
- [ ] Key file locations if major restructuring occurred

**DO NOT add to CLAUDE.md**:
- ❌ Detailed handoff notes (→ use AI_CONTEXT/CURRENT_STATE.md)
- ❌ Comprehensive file lists (→ use AI_CONTEXT/FILE_MAP.md)  
- ❌ Session accomplishments (→ use AI_CONTEXT/CURRENT_STATE.md)
- ❌ Long context explanations (→ use appropriate AI_CONTEXT/ file)

#### 10. Update README.md
**Update if you changed**:
- [ ] Live demo URL
- [ ] Feature descriptions
- [ ] Tech stack components
- [ ] Setup instructions

#### 11. Update CONTRIBUTING.md
**Update if you modified**:
- [ ] Development workflow
- [ ] New tools or dependencies
- [ ] Testing procedures
- [ ] Project structure

### Phase 4: Prepare Handoff Notes

#### 12. Document Next Steps
**Create or update handoff section in CLAUDE.md**:
```markdown
## 🚀 NEXT STEPS FOR NEW DEVELOPER (Updated: [DATE])

### Immediate Priorities:
1. [Priority 1 task with specific files/areas]
2. [Priority 2 task with context]
3. [Priority 3 task with context]

### Context for Next Developer:
- **What was just completed**: [Brief summary]
- **Known issues**: [Any issues discovered but not fixed]
- **Next logical features**: [What should be worked on next]
- **Testing notes**: [Any testing considerations]

### Files Modified This Session:
- `[file1]` - [what was changed]
- `[file2]` - [what was changed]
```

#### 13. Update Phase Status
**If Phase 1 → Phase 2 transition**:
- [ ] Mark Phase 1 as complete in all documentation
- [ ] Update status from "READY" to "IN PROGRESS" for Phase 2
- [ ] Document any Phase 2 preparation completed
- [ ] Note estimated timeline for Phase 2 completion

### Phase 5: Pre-Commit Verification

#### 14. Verify All Tests Pass
```bash
# Run complete test suite
./test-all.sh

# Check linting
npm run lint

# Verify no console.log statements in production code
grep -r "console.log" frontend/src/ --exclude-dir=node_modules --exclude-dir=__tests__
```

#### 15. Manual Testing
- [ ] Test application locally (`cd frontend && npm start`)
- [ ] Verify all features work as expected
- [ ] Check browser console for errors
- [ ] Test responsive design if UI changes were made

#### 16. Final Documentation Review
- [ ] All AI_CONTEXT files updated with session changes
- [ ] CLAUDE.md reflects current status
- [ ] README.md accurate for current state
- [ ] Handoff notes clearly written

#### 17. Complete Handoff Checklist
- [ ] All documentation updated to reflect current state
- [ ] Next steps clearly documented for next developer
- [ ] No temporary files left behind
- [ ] All tests passing with 70%+ coverage
- [ ] No linting errors
- [ ] Application working locally
- [ ] Cost constraints maintained ($0/month for Phase 1)
- [ ] Handoff notes written with specific next priorities

### Phase 6: Git Commit & Push (FINAL STEP)

#### 18. Stage and Review Changes
```bash
# Stage all changes
git add .

# Review what's being committed
git status
git diff --cached

# Check for any sensitive information
grep -r "password\|secret\|key" . --exclude-dir=node_modules --exclude-dir=.git
```

#### 19. Create Comprehensive Commit
```bash
# Create detailed commit message
git commit -m "Complete [session summary] and prepare handoff

Features Added:
- [Feature 1 with file references]
- [Feature 2 with file references]

Bugs Fixed:
- [Bug 1 description]
- [Bug 2 description]

Documentation Updates:
- Reorganized AI-optimized documentation structure
- Updated current state and constraints
- Added handoff notes for next developer

Testing:
- All tests passing (XX/XX)
- Coverage maintained at XX%
- No linting errors

Next Steps:
- [Clear priority 1 for next developer]
- [Clear priority 2 for next developer]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### 20. Push Changes (FINAL ACTION)
```bash
# Push to main branch (or create PR if preferred)
git push origin main

# Verify push was successful
git status
```

## ✅ Handoff Complete

**The project is now ready for the next AI agent or developer to take over.**

**Key files for next developer to read**:
1. `CLAUDE.md` - Current status and navigation
2. `AI_CONTEXT/CURRENT_STATE.md` - What's deployed now
3. `AI_CONTEXT/CONSTRAINTS.md` - Critical limitations
4. Handoff notes section in `CLAUDE.md` - Immediate next steps