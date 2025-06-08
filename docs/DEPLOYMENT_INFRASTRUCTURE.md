# Deployment & Infrastructure Guide

**Last Updated**: June 8, 2025  
**Status**: Production deployment active

> **Note**: For current deployment status and architecture details, see `AI_CONTEXT/CURRENT_STATE.md`

## Quick Reference

### Active Resources
- **Static Web App**: `stapp-cryptoportfolio-prod-9rc2a6`
- **Storage Account**: `stcrypto9rc2a6` 
- **Resource Group**: `rg-cryptoportfolio-prod-9rc2a6`
- **Location**: West US 2
- **Cost**: $0/month

## Terraform Infrastructure

### Directory Structure
```
infrastructure/
├── environments/
│   └── production-simple/     # Active environment
│       ├── main.tf           # Resource definitions
│       ├── variables.tf      # Configuration variables
│       ├── outputs.tf        # Resource outputs
│       └── terraform.tfvars  # Environment values
├── modules/                  # Reusable components
│   ├── static-web-app/
│   ├── storage/
│   └── monitoring/
└── shared/                   # Common configuration
    ├── providers.tf
    └── backend.tf
```

### **OPTIMIZED Terraform Resources**

#### **Static Web App Module (FREE Tier)**
```hcl
module "static_web_app" {
  source = "../../modules/static-web-app"
  
  static_web_app_name = "stapp-cryptoportfolio-prod"
  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  
  # Always FREE tier for cost optimization
  sku_tier = "Free"
  sku_size = "Free"
  
  # No API_URL needed - direct CoinGecko calls
}
```

#### **Blob Storage Module (Public Read Access)**
```hcl
module "storage" {
  source = "../../modules/storage"
  
  storage_account_name = "stcryptoportfolio${random_string.suffix.result}"
  resource_group_name  = azurerm_resource_group.main.name
  location            = var.location
  
  # Public blob access for historical data
  container_access_type = "blob"
  
  # CORS configuration for browser access
  cors_allowed_origins = [
    "https://blue-glacier-0ffdf2d1e.6.azurestaticapps.net",
    "http://localhost:4200"
  ]
}
```

#### **Minimal Function App (Data Updates Only)**
```hcl
module "data_update_function" {
  source = "../../modules/function-app"
  
  function_app_name   = "func-data-update-${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location           = var.location
  
  # Y1 Consumption Plan (pay-per-execution)
  service_plan_sku = "Y1"
  
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"     = "node"
    "WEBSITE_NODE_DEFAULT_VERSION" = "~18"
    "STORAGE_CONNECTION_STRING"    = module.storage.connection_string
    # No Redis, no API keys needed for CoinGecko free tier
  }
  
  # Monthly schedule only
  schedule = "0 0 1 * *"  # 1st day of each month
}
```

## Deployment Commands

### Deploy Infrastructure
```bash
cd infrastructure/environments/production-simple
terraform init
terraform plan
terraform apply
```

### Deploy Frontend
```bash
cd frontend
npm run build:prod
# Automatic deployment via GitHub Actions on main branch push
```

### Manual Static Web App Deploy
```bash
# Using Azure CLI
az staticwebapp deploy \
  --name stapp-cryptoportfolio-prod-9rc2a6 \
  --source-location ./frontend/dist
```

## Cost Monitoring

### Active Budget Controls
- **Monthly Budget**: $25/month with email alerts to eddelord@gmail.com
- **Current Usage**: $0/month 
- **Alert Thresholds**: 80% and 100% of budget

### Monitoring Commands
```bash
# Check monthly spending
az consumption usage list --start-date 2025-06-01 --end-date 2025-06-30

# View budget status
az consumption budgets list --resource-group rg-cryptoportfolio-prod-9rc2a6

# Verify subscription status
az account show --query "{subscriptionId:id,name:name,state:state}"
```

## CI/CD Pipeline

Current deployment is automated via GitHub Actions:
- **Trigger**: Push to main branch
- **Build**: Frontend production build
- **Deploy**: Automatic to Azure Static Web App
- **Status**: Active and functional

## Troubleshooting

### Common Issues
- **Build failures**: Check Node.js version compatibility in GitHub Actions
- **Deploy issues**: Verify Azure Static Web App API token is current
- **Cost alerts**: Monitor resource usage via Azure portal

### Support Resources
- **Azure Documentation**: https://docs.microsoft.com/en-us/azure/static-web-apps/
- **Terraform Documentation**: https://registry.terraform.io/providers/hashicorp/azurerm/
- **Project Status**: See `AI_CONTEXT/CURRENT_STATE.md`