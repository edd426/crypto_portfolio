# Deployment & Infrastructure Plan

## Overview
This document outlines the deployment strategy, infrastructure setup, and CI/CD pipeline for the crypto portfolio analyzer using Azure cloud services, Terraform, and GitHub Actions.

## Azure Infrastructure Components

### Resource Organization
```
Resource Group: rg-cryptoportfolio-{env}
├── Static Web Apps: stapp-cryptoportfolio-{env}
├── Function App: func-cryptoportfolio-{env}
├── Storage Account: stcryptoportfolio{env}
├── Redis Cache: redis-cryptoportfolio-{env}
├── Application Insights: appi-cryptoportfolio-{env}
├── Key Vault: kv-cryptoportfolio-{env}
└── API Management: apim-cryptoportfolio-{env}
```

### Environments
- **Development**: Low-cost, minimal redundancy
- **Staging**: Production-like, for testing
- **Production**: High availability, auto-scaling

## Terraform Configuration

### Directory Structure
```
infrastructure/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
├── modules/
│   ├── static-web-app/
│   ├── function-app/
│   ├── redis/
│   ├── monitoring/
│   └── networking/
└── shared/
    ├── providers.tf
    └── backend.tf
```

### Main Terraform Resources

#### Static Web App Module
```hcl
module "static_web_app" {
  source = "../../modules/static-web-app"
  
  name                = "stapp-cryptoportfolio-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  
  sku_tier = var.environment == "production" ? "Standard" : "Free"
  sku_size = var.environment == "production" ? "Standard" : "Free"
  
  app_settings = {
    "API_URL" = module.api_management.gateway_url
  }
}
```

#### Function App Module
```hcl
module "function_app" {
  source = "../../modules/function-app"
  
  name                = "func-cryptoportfolio-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  
  app_service_plan_id = azurerm_app_service_plan.functions.id
  storage_account_name = azurerm_storage_account.functions.name
  
  app_settings = {
    "REDIS_CONNECTION_STRING" = module.redis.connection_string
    "COINGECKO_API_KEY"      = data.azurerm_key_vault_secret.coingecko_key.value
    "NODE_ENV"               = var.environment
  }
  
  cors_allowed_origins = [
    module.static_web_app.default_hostname,
    "http://localhost:4200" # Development
  ]
}
```

#### Redis Cache Configuration
```hcl
module "redis" {
  source = "../../modules/redis"
  
  name                = "redis-cryptoportfolio-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  
  capacity = var.environment == "production" ? 1 : 0
  family   = "C"
  sku_name = var.environment == "production" ? "Standard" : "Basic"
  
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
}
```

### Cost Optimization Settings

#### Development Environment
```hcl
# Minimal costs for development
variable "dev_settings" {
  default = {
    function_app_sku     = "Y1"  # Consumption plan
    redis_sku           = "Basic"
    redis_capacity      = 0       # C0 (250MB)
    enable_api_management = false
  }
}
```

#### Production Environment
```hcl
# Balanced performance and cost
variable "prod_settings" {
  default = {
    function_app_sku     = "EP1"    # Elastic Premium
    redis_sku           = "Standard"
    redis_capacity      = 1         # C1 (1GB)
    enable_api_management = true
    enable_autoscaling  = true
    min_instances       = 1
    max_instances       = 5
  }
}
```

## CI/CD Pipeline (GitHub Actions)

### Workflow Structure
```
.github/workflows/
├── ci.yml           # Continuous Integration
├── cd-dev.yml       # Deploy to Development
├── cd-staging.yml   # Deploy to Staging
├── cd-prod.yml      # Deploy to Production
└── terraform.yml    # Infrastructure updates
```

### CI Workflow
```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      
      - name: Run linting
        run: npm run lint
        working-directory: ./frontend
      
      - name: Run tests
        run: npm run test:ci
        working-directory: ./frontend
      
      - name: Build application
        run: npm run build
        working-directory: ./frontend

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run linting
        run: npm run lint
        working-directory: ./backend
      
      - name: Run tests
        run: npm run test:ci
        working-directory: ./backend
```

### CD Workflow (Production)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-infrastructure:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0
      
      - name: Terraform Init
        run: terraform init
        working-directory: ./infrastructure/environments/production
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
      
      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: ./infrastructure/environments/production

  deploy-backend:
    needs: deploy-infrastructure
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy Functions
        uses: Azure/functions-action@v1
        with:
          app-name: func-cryptoportfolio-prod
          package: ./backend
          
  deploy-frontend:
    needs: deploy-infrastructure
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Frontend
        run: |
          npm ci
          npm run build:prod
        working-directory: ./frontend
        
      - name: Deploy to Static Web App
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend/dist"
```

## Monitoring & Observability

### Application Insights Configuration
```typescript
// backend/src/monitoring.ts
import { setup } from 'applicationinsights';

export function initializeMonitoring() {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .start();
  }
}
```

### Key Metrics to Monitor
- API response times
- Function execution duration
- Redis cache hit rates
- External API call success rates
- Error rates and exceptions
- Cost per transaction

### Alerts Configuration
```hcl
resource "azurerm_monitor_metric_alert" "high_error_rate" {
  name                = "high-error-rate-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  
  criteria {
    metric_namespace = "Microsoft.Insights/components"
    metric_name     = "exceptions/count"
    aggregation     = "Count"
    operator        = "GreaterThan"
    threshold       = 10
  }
  
  window_size        = "PT5M"
  frequency          = "PT1M"
  severity           = 2
  
  action {
    action_group_id = azurerm_monitor_action_group.main.id
  }
}
```

## Security Best Practices

### Key Vault Integration
- All secrets stored in Azure Key Vault
- Managed identities for service authentication
- Rotation policies for API keys

### Network Security
- Private endpoints for Redis
- IP restrictions on Function Apps
- WAF rules for API Management

### Code Security
```yaml
# GitHub Actions security scanning
- name: Run security scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Infrastructure costs reviewed
- [ ] Terraform plan reviewed
- [ ] Rollback plan prepared

### Deployment Steps
1. Run Terraform apply for infrastructure
2. Deploy backend functions
3. Deploy frontend application
4. Verify health endpoints
5. Run smoke tests
6. Monitor metrics for 30 minutes

### Post-deployment
- [ ] Verify all endpoints responding
- [ ] Check Application Insights for errors
- [ ] Confirm Redis cache functioning
- [ ] Test critical user flows
- [ ] Update documentation

## Cost Monitoring

### Budget Alerts
```hcl
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-cryptoportfolio-${var.environment}"
  resource_group_id = azurerm_resource_group.main.id
  
  amount     = var.monthly_budget
  time_grain = "Monthly"
  
  notification {
    enabled   = true
    threshold = 80
    operator  = "GreaterThan"
    
    contact_emails = var.budget_alert_emails
  }
}
```

### Estimated Monthly Costs
- **Development**: ~$10-20
  - Static Web App: Free
  - Functions: Consumption plan
  - Redis: Basic tier
  
- **Production**: ~$50-100
  - Static Web App: Standard
  - Functions: Premium plan
  - Redis: Standard tier
  - API Management: Consumption tier