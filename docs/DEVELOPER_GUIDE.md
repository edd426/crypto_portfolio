# Developer Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Azure CLI
- Terraform 1.5+
- Git
- VS Code (recommended) with Angular Language Service

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/crypto_portfolio.git
   cd crypto_portfolio
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example env files
   cp .env.example .env
   ```

4. **Configure local development**
   - Get a free CoinGecko API key
   - Set up local Redis (Docker recommended)
   - Configure environment variables

## Project Structure

```
crypto_portfolio/
├── frontend/              # Angular SPA
│   ├── src/
│   │   ├── app/          # Application code
│   │   ├── assets/       # Static assets
│   │   └── environments/ # Environment configs
│   ├── angular.json      # Angular configuration
│   └── package.json      # Frontend dependencies
├── backend/              # Azure Functions
│   ├── src/
│   │   ├── functions/    # Function endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── host.json         # Functions host config
│   └── package.json      # Backend dependencies
├── infrastructure/       # Terraform IaC
├── docs/                # Documentation
└── .github/             # CI/CD workflows
```

## Development Workflow

### Local Development

1. **Start Redis locally**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Start backend functions**
   ```bash
   cd backend
   npm run start
   # Functions will be available at http://localhost:7071
   ```

3. **Start frontend dev server**
   ```bash
   cd frontend
   npm run start
   # App will be available at http://localhost:4200
   ```

### Code Style Guidelines

#### TypeScript
- Use strict mode
- Prefer interfaces over types
- Use explicit return types
- Document complex functions

#### Angular
- Use standalone components
- Follow Angular style guide
- Implement OnPush change detection
- Use reactive forms

#### Git Workflow
- Feature branches from `develop`
- PR reviews required
- Squash commits on merge
- Semantic commit messages

### Testing

#### Frontend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Coverage report
npm run test:coverage
```

#### Backend Testing
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Load tests
npm run test:load
```

## API Development

### Adding a New Endpoint

1. **Create function file**
   ```typescript
   // backend/src/functions/newEndpoint.ts
   import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
   
   export async function newEndpoint(
     request: HttpRequest,
     context: InvocationContext
   ): Promise<HttpResponseInit> {
     // Implementation
   }
   
   app.http('newEndpoint', {
     methods: ['GET', 'POST'],
     authLevel: 'anonymous',
     handler: newEndpoint
   });
   ```

2. **Add service logic**
   ```typescript
   // backend/src/services/newService.ts
   export class NewService {
     // Service implementation
   }
   ```

3. **Update API documentation**
   - Add endpoint to TECHNICAL_ARCHITECTURE.md
   - Include request/response examples

## Frontend Development

### Creating Components

```bash
# Generate new component
ng generate component components/my-component --standalone
```

### State Management
- Use Angular signals for local state
- Use services for shared state
- Consider NgRx for complex state

### Styling Guidelines
- Use Angular Material components
- Follow Material Design principles
- Use Tailwind for utility classes
- Keep component styles scoped

## Debugging

### Frontend Debugging
- Chrome DevTools
- Angular DevTools extension
- Redux DevTools (if using NgRx)
- Network tab for API calls

### Backend Debugging
- Azure Functions Core Tools
- VS Code debugger
- Application Insights locally
- Postman for API testing

## Performance Optimization

### Frontend
- Lazy load routes
- Use OnPush change detection
- Implement virtual scrolling
- Optimize bundle size

### Backend
- Implement caching strategy
- Use connection pooling
- Minimize cold starts
- Batch API requests

## Common Tasks

### Update Dependencies
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Update Angular
ng update
```

### Add New Coin Data
1. Update coin list service
2. Add coin logo to assets
3. Update autocomplete data
4. Test market cap calculations

### Modify Rebalancing Logic
1. Update algorithm in `rebalancing.service.ts`
2. Add unit tests for edge cases
3. Update API documentation
4. Test with various portfolios

## Troubleshooting

### Common Issues

#### CORS Errors
- Check Function App CORS settings
- Verify allowed origins
- Check request headers

#### Redis Connection Failed
- Verify Redis is running
- Check connection string
- Ensure firewall rules

#### Build Failures
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check Node.js version

## Deployment

### Deploy to Development
```bash
# Automated via push to develop branch
git push origin develop
```

### Deploy to Production
1. Create PR to main branch
2. Get approval from reviewer
3. Merge PR (triggers deployment)

## Resources

### Documentation
- [Angular Documentation](https://angular.io/docs)
- [Azure Functions Documentation](https://docs.microsoft.com/azure/azure-functions/)
- [CoinGecko API Documentation](https://www.coingecko.com/api/documentation)

### Internal Docs
- [Project Overview](./PROJECT_OVERVIEW.md)
- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT_INFRASTRUCTURE.md)

### Tools
- [Azure Portal](https://portal.azure.com)
- [GitHub Repository](https://github.com/yourusername/crypto_portfolio)
- [Project Board](https://github.com/yourusername/crypto_portfolio/projects)

## Getting Help

1. Check existing documentation
2. Search closed issues on GitHub
3. Ask in team chat
4. Create new issue with details

## Contributing

1. Pick an issue from backlog
2. Create feature branch
3. Implement with tests
4. Submit PR for review
5. Address feedback
6. Celebrate merge! 🎉