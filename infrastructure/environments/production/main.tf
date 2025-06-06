# Include shared configuration
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# Generate random suffix for unique naming
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  project_name = "cryptoportfolio"
  environment  = "prod"
  
  # Resource naming convention
  resource_prefix = "${local.project_name}-${local.environment}-${random_string.suffix.result}"
  
  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
    CostCenter  = "development"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.resource_prefix}"
  location = var.location
  
  tags = local.common_tags
}

# Storage Account Module
module "storage" {
  source = "../../modules/storage"
  
  project_name        = local.project_name
  environment         = local.environment
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  
  tags = local.common_tags
}

# Function App Module
module "function_app" {
  source = "../../modules/function-app"
  
  function_app_name           = "func-${local.resource_prefix}"
  resource_group_name         = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  environment                = local.environment
  storage_account_name       = module.storage.storage_account_name
  storage_account_access_key = module.storage.storage_account_primary_access_key
  coingecko_api_key         = var.coingecko_api_key
  
  cors_allowed_origins = [
    "*"  # Will be configured after deployment
  ]
  
  additional_app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY" = module.monitoring.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = module.monitoring.connection_string
  }
  
  tags = local.common_tags
}

# Static Web App Module
module "static_web_app" {
  source = "../../modules/static-web-app"
  
  static_web_app_name = "stapp-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  api_url            = module.function_app.function_app_url
  
  tags = local.common_tags
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"
  
  application_insights_name = "appi-${local.resource_prefix}"
  resource_group_name       = azurerm_resource_group.main.name
  resource_group_id         = azurerm_resource_group.main.id
  location                 = azurerm_resource_group.main.location
  project_name             = local.project_name
  environment              = local.environment
  monthly_budget           = var.monthly_budget
  budget_alert_emails      = var.budget_alert_emails
  
  tags = local.common_tags
}