Execute a comprehensive session handoff for the crypto portfolio project. Complete the following tasks in order:

1. **Clean up temporary files**: Remove any .tmp, .bak files, debug console.log statements, and experimental code that shouldn't be committed.

2. **Verify everything works**: Run `./test-all.sh` to ensure all tests pass, run `npm run lint` to check for errors, and manually test the application locally with `cd frontend && npm start` to verify core functionality.

3. **Review this session's work**: Check git status and summarize all features added, bugs fixed, and architecture changes made during this session.

4. **Update AI_CONTEXT documentation**:
   - Update `AI_CONTEXT/CURRENT_STATE.md` with current deployment status, testing results, and any new features
   - Update `AI_CONTEXT/FILE_MAP.md` if new components, services, or directories were created
   - Update `AI_CONTEXT/CODE_PATTERNS.md` if new architectural approaches or implementation patterns were used
   - Update `AI_CONTEXT/CONSTRAINTS.md` if new limitations were discovered or cost constraints changed

5. **Update main documentation**:
   - Update `CLAUDE.md` only if essential operational info changed (project status, quick start commands, key file locations, tech stack - keep under 40 lines)
   - Update `README.md` if features list, tech stack, or live demo URL changed
   - Update `README.md` Development Guide section if development workflow or setup instructions changed

6. **Document next steps**: Update `AI_CONTEXT/CURRENT_STATE.md` with a clear handoff section containing 3 immediate priorities for the next developer, including what was just completed, any known issues, and specific files to focus on.

7. **Prepare final commit**: Stage changes with `git add .`, review with `git diff --staged` to check for sensitive information, then create a comprehensive commit message documenting features added, bugs fixed, architecture changes, testing status, and clear next steps for the next developer. Finally, push the changes with `git push origin main`.