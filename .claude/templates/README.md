# Smart File Templates for Crypto Portfolio Analyzer

These templates follow the established patterns in the codebase and ensure consistency across all new files.

## Available Templates

### 1. Component Template (`component.template.ts`)
Use this when creating new Angular components.

**Usage:**
```bash
# Copy template and rename
cp .claude/templates/component.template.ts frontend/src/app/components/your-component/your-component.component.ts
```

**Replace placeholders:**
- `[component-name]` → `your-component` (kebab-case)
- `[ComponentName]` → `YourComponent` (PascalCase)
- `[Component Title]` → Human-readable title
- `[Component Description]` → Brief description

### 2. Service Template (`service.template.ts`)
Use this when creating new Angular services.

**Usage:**
```bash
# Copy template and rename
cp .claude/templates/service.template.ts frontend/src/app/services/your.service.ts
```

**Replace placeholders:**
- `[ServiceName]` → `YourService` (PascalCase)
- Update `apiBaseUrl` if needed
- Add proper type imports

### 3. Test Template (`test.template.spec.ts`)
Use this when creating new test files.

**Usage:**
```bash
# Copy template and rename
cp .claude/templates/test.template.spec.ts frontend/src/app/components/__tests__/your-component.spec.ts
```

**Replace placeholders:**
- `[ComponentName]` → Your component name
- Import actual component and services
- Add specific test cases

### 4. Model Template (`model.template.ts`)
Use this when creating new TypeScript interfaces and types.

**Usage:**
```bash
# Copy template and rename
cp .claude/templates/model.template.ts frontend/src/app/models/your.model.ts
```

**Replace placeholders:**
- `[ModelName]` → `YourModel` (PascalCase)
- `[MODEL_NAME]` → `YOUR_MODEL` (SCREAMING_SNAKE_CASE)
- `[Feature Name]` → Description of the feature

## Best Practices

1. **Always follow existing patterns** - Check similar files before modifying templates
2. **Maintain type safety** - Use TypeScript strict mode
3. **Include proper error handling** - Follow the error patterns in templates
4. **Add comprehensive tests** - Aim for >70% coverage
5. **Use Material Design** - Stick to Angular Material components

## Template Features

### Component Template Features:
- Standalone component setup (Angular 17+)
- Reactive forms with validation
- Material Design integration
- Error handling
- Loading states
- Input/Output decorators

### Service Template Features:
- HTTP client integration
- 5-minute caching pattern
- Error handling with catchError
- Cache management
- TypeScript strict types

### Test Template Features:
- Jest testing framework
- Component fixture setup
- Service mocking patterns
- Form testing
- Error case testing
- Edge case coverage

### Model Template Features:
- Interface definitions
- Type guards
- Factory functions
- Validation constants
- Enums for type safety

## Important Notes

1. **No Backend Code** - These templates are for frontend only
2. **Client-Side Only** - All logic must run in the browser
3. **No Console.log** - Use the debug system instead
4. **Follow Constraints** - Check CONSTRAINTS.md before using

## Updating Templates

If you need to update these templates:
1. Ensure changes follow all existing patterns
2. Test the template in a real implementation
3. Update this README with any new placeholders
4. Document any new patterns in CODE_PATTERNS.md