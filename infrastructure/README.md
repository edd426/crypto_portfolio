# Crypto Portfolio Infrastructure

## Overview
This directory contains Terraform configurations for deploying the crypto portfolio application to Azure with **minimal cost optimization**.

## Target Monthly Cost: ~$5-15

### What's Included (Minimal Cost)
- **Static Web App**: FREE tier (frontend hosting)
- **Azure Functions**: Consumption plan (backend API)
- **Storage Account**: Standard LRS (function storage)
- **Application Insights**: FREE tier (monitoring)
- **Budget Alerts**: Cost monitoring

### What's NOT Included (To Save Money)
- ❌ Redis Cache (~$15/month saved)
- ❌ API Management (~$10/month saved)
- ❌ Premium Function plans (~$25/month saved)

## Quick Start

### 1. Prerequisites
```bash
# Install Azure CLI
brew install azure-cli

# Install Terraform
brew install terraform

# Login to Azure
az login
```

### 2. Configure Variables
```bash
cd infrastructure/environments/production
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your email and preferences
```

### 3. Deploy Infrastructure
```bash
# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Deploy (after reviewing)
terraform apply
```

### 4. Get Deployment URLs
```bash
# Get frontend URL
terraform output static_web_app_url

# Get backend API URL  
terraform output function_app_url
```

## Directory Structure
```
infrastructure/
├── environments/
│   └── production/          # Production environment
├── modules/
│   ├── static-web-app/      # Frontend hosting
│   ├── function-app/        # Backend API
│   ├── storage/             # Storage account
│   └── monitoring/          # Application Insights + budgets
└── shared/
    ├── providers.tf         # Terraform providers
    └── backend.tf           # State management
```

## Cost Optimization Features

### Budget Monitoring
- Budget alerts at 80% and 100% of monthly limit
- Email notifications to prevent overspend
- Default budget: $25/month (very conservative)

### Resource Sizing
- Function App: Consumption plan (pay-per-use)
- Storage: Local redundancy only
- No premium features enabled

## Upgrade Path
When you need better performance, you can easily add:

1. **Redis Cache** (~$15/month):
   ```hcl
   # Add to main.tf
   module "redis" {
     source = "../../modules/redis"
     # ... configuration
   }
   ```

2. **Premium Functions** (~$25/month):
   ```hcl
   # Change in function-app module
   sku_name = "EP1"  # Instead of "Y1"
   ```

3. **API Management** (~$10/month):
   ```hcl
   # Add API Management module
   ```

## Troubleshooting

### Common Issues
1. **Resource name conflicts**: Random suffix is added to prevent conflicts
2. **Budget alerts not working**: Verify email address in terraform.tfvars
3. **High costs**: Check budget alerts and review resource sizing

### Cost Monitoring
```bash
# Check current costs
az consumption usage list --start-date 2024-01-01 --end-date 2024-01-31

# View budget status
az consumption budget list
```

## Security Notes
- All sensitive values (API keys, connection strings) are marked as sensitive
- Managed identities are used where possible
- CORS is configured for security
- Free tier monitoring provides basic security insights