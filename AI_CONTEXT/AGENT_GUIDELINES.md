# AI Agent Behavioral Guidelines
*Essential rules and best practices for AI agents working on this project*

## 🚨 Quick Decision Framework

**STOP and ask for clarification if:**
- Cost impact > $0 (check with user before adding ANY paid services)
- Changing fundamental architecture (client-side only!)
- Test coverage would drop below 70%
- Creating new cloud resources
- Modifying test files to make them pass
- Unsure about the right approach after checking patterns

**PROCEED with confidence if:**
- Following established patterns in CODE_PATTERNS.md
- Making UI/UX improvements within Material Design
- Adding tests to increase coverage
- Refactoring without changing architecture
- Fixing bugs with existing patterns
- Improving error handling

## ❌ Common AI Agent Pitfalls to Avoid

### 1. **File Management Mistakes**
- ❌ Creating new files when existing ones could be modified
- ❌ Creating documentation files proactively (only when asked)
- ❌ Leaving temporary files (.tmp, .bak) after session
- ✅ Always prefer editing existing files
- ✅ Use established directory structure

### 2. **Architecture Violations**
- ❌ Adding backend endpoints (this is client-side only!)
- ❌ Creating databases or persistent storage
- ❌ Adding authentication or user management
- ❌ Implementing server-side processing
- ✅ Keep all logic in the browser
- ✅ Use URL params and localStorage only

### 3. **Testing Mistakes**
- ❌ Modifying tests to make them pass
- ❌ Disabling failing tests with .skip()
- ❌ Reducing test assertions to pass
- ❌ Committing with failing tests
- ✅ Fix the code, not the tests
- ✅ Add new tests for new features
- ✅ Run ./test-all.sh before EVERY commit

### 4. **Code Quality Issues**
- ❌ Using console.log() - use debugLog() instead
- ❌ Ignoring TypeScript errors
- ❌ Skipping ESLint warnings
- ❌ Adding // @ts-ignore comments
- ✅ Fix all type errors properly
- ✅ Follow existing code patterns

### 5. **API Integration Mistakes**
- ❌ Making rapid API calls without caching
- ❌ Using paid API tiers or keys
- ❌ Creating proxy services
- ❌ Ignoring rate limits
- ✅ Respect 5-minute cache minimum
- ✅ Handle 429 errors gracefully

## 📋 Before Starting ANY Task

### Pre-Implementation Checklist:
- [ ] Run `./test-all.sh` - ensure clean starting state
- [ ] Read `AI_CONTEXT/CURRENT_STATE.md` - understand context
- [ ] Check `AI_CONTEXT/CONSTRAINTS.md` - know the limits
- [ ] Review `AI_CONTEXT/CODE_PATTERNS.md` - find similar examples
- [ ] Use TodoWrite for tasks with 3+ steps
- [ ] Verify you're in the frontend directory for most work

### Ask vs Assume Guidelines:
**Always ASK when:**
- Adding new dependencies (npm packages)
- Changing project structure
- Modifying build configuration
- Adding new API integrations
- Creating new file types
- Implementing features not in current patterns

**Safe to ASSUME:**
- Following existing code patterns exactly
- Using already-imported libraries
- Maintaining current architecture
- Using established Material Design components
- Following TypeScript types already defined

## 🔄 Error Recovery Procedures

### When Tests Fail After Your Changes:
```bash
# 1. Check what you modified
git status
git diff

# 2. Identify the failing test
npm test -- --verbose

# 3. If you can't fix it, revert the file
git checkout -- <file-path>

# 4. Re-run tests to confirm
./test-all.sh
```

### When You Break The Build:
```bash
# 1. Check TypeScript errors
cd frontend && npm run build

# 2. Check ESLint errors  
npm run lint

# 3. Revert problematic files if needed
git checkout -- <file-path>

# 4. Document the issue in your handoff
```

### When You're Stuck:
1. Check if there's a similar pattern in the codebase
2. Use Grep/Glob to find examples
3. Read the test files for expected behavior
4. Check git history for similar changes
5. Document blockers clearly for next agent

## 📊 Context Priority Guide

### 🔴 Essential Context (Always Load First)
**Must read these files in order:**
1. `CLAUDE.md` - Project overview and status
2. `AI_CONTEXT/CURRENT_STATE.md` - Latest updates
3. `AI_CONTEXT/CONSTRAINTS.md` - Hard rules
4. Relevant section of `AI_CONTEXT/CODE_PATTERNS.md`

**Why:** These contain critical rules and current state that prevent major mistakes.

### 🟡 Important Context (Load When Relevant)
**Include based on task type:**
- `AI_CONTEXT/FILE_MAP.md` - When searching for features
- `AI_CONTEXT/AI_TASKS.md` - For workflow templates
- Recent test results - Before making changes
- `package.json` - When using libraries
- Relevant component/service files

**Why:** These guide implementation but aren't always needed.

### 🟢 Optional Context (Large Context Available)
**Load only if needed:**
- Full file contents of unchanged files
- Historical git commits
- Detailed documentation in `/docs`
- Test implementation details
- Build output logs

**Why:** These provide deep context but can overwhelm limited token windows.

### Context Loading Strategy:
```bash
# 1. Start with essentials
Read CLAUDE.md
Read AI_CONTEXT/CURRENT_STATE.md
Read AI_CONTEXT/CONSTRAINTS.md

# 2. Identify task type
# For bug fixes: Load error messages and relevant code
# For features: Load patterns and similar components
# For refactoring: Load all affected files

# 3. Batch load relevant files
# Use concurrent reads when possible
```

## 🎯 Session Success Metrics

Track these during your session:
- ✅ All tests passing? (./test-all.sh)
- ✅ No new ESLint errors? (npm run lint)
- ✅ Coverage maintained >70%? (check test output)
- ✅ No console.log added? (grep search)
- ✅ CONSTRAINTS.md followed? (review checklist)
- ✅ Handoff notes updated? (CURRENT_STATE.md)

## 💡 Pro Tips for AI Agents

### 1. **Use Tools Efficiently**
- Batch file reads in single tool calls
- Use Glob/Grep before reading many files
- Run multiple bash commands in parallel
- Cache results mentally to avoid re-reading

### 2. **Maintain Code Quality**
- Copy exact indentation from existing code
- Follow naming conventions precisely
- Match import styles already used
- Keep functions small and focused

### 3. **Communication Best Practices**
- Be concise in responses (user has CLI interface)
- Show commands being run
- Report specific errors, not generic messages
- Update TodoWrite frequently

### 4. **Testing Discipline**
- Write tests BEFORE implementation when possible
- Test edge cases, not just happy paths
- Mock external dependencies properly
- Never trust, always verify

## 🚀 Advanced Patterns

### When Implementing Complex Features:
1. Break down into smallest possible units
2. Implement and test each unit separately
3. Integrate incrementally
4. Run full test suite between integrations
5. Document architectural decisions

### When Debugging Difficult Issues:
1. Enable debug mode (localStorage)
2. Use the browser DevTools Network tab
3. Check for race conditions in async code
4. Verify API responses match expectations
5. Test in incognito mode (clean state)

### When Refactoring:
1. Ensure 100% test coverage of affected code first
2. Make small, incremental changes
3. Run tests after each change
4. Keep commits atomic and descriptive
5. Update patterns documentation if creating new patterns

## 📝 Remember

**You are a highly capable AI agent, but:**
- The constraints exist for good reasons (cost, architecture, quality)
- Tests are your safety net, not your enemy
- When in doubt, check the patterns
- Small, correct changes > large, risky changes
- Documentation is for humans; code is for machines

**Your success is measured by:**
- Zero production bugs introduced
- Maintained or improved test coverage
- Clean, readable code following patterns
- Clear handoff for the next agent
- Respect for project constraints

Keep this guide open during your work sessions and refer to it whenever making decisions!