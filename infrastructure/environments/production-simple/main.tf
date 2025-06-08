# Simplified Azure deployment - Static Web App only with external API
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

# Static Web App (FREE tier)
resource "azurerm_static_web_app" "main" {
  name                = "stapp-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  sku_tier           = "Free"
  sku_size           = "Free"

  app_settings = {
    # We'll configure the API to use a temporary external service
    # or localhost for now until Azure Functions quota is resolved
    "API_URL" = "http://localhost:3001"
  }

  tags = local.common_tags
}

# Storage Account for historical data (client-side architecture)
resource "azurerm_storage_account" "historical_data" {
  name                     = "stcrypto${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  account_tier            = "Standard"
  account_replication_type = "LRS"  # Cheapest option
  
  # Security settings
  min_tls_version                 = "TLS1_2"
  enable_https_traffic_only       = true
  allow_nested_items_to_be_public = true
  
  # CORS settings for browser access
  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS"]
      allowed_origins    = [
        "https://${azurerm_static_web_app.main.default_host_name}",
        "http://localhost:4200",
        "https://localhost:4200"
      ]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }
  
  tags = local.common_tags
}

# Container for historical crypto data
resource "azurerm_storage_container" "crypto_data" {
  name                  = "historical-data"
  storage_account_name  = azurerm_storage_account.historical_data.name
  container_access_type = "blob"  # Public read access for individual blobs
}

# Service Plan for Azure Function (Consumption Y1)
resource "azurerm_service_plan" "function_plan" {
  name                = "plan-func-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  os_type            = "Linux"
  sku_name           = "Y1"  # Consumption plan (pay-per-execution)
  
  tags = local.common_tags
}

# Function App for historical data updates
resource "azurerm_linux_function_app" "historical_data_updater" {
  name                = "func-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  
  service_plan_id            = azurerm_service_plan.function_plan.id
  storage_account_name       = azurerm_storage_account.historical_data.name
  storage_account_access_key = azurerm_storage_account.historical_data.primary_access_key
  
  site_config {
    application_stack {
      node_version = "18"
    }
    
    # CORS configuration
    cors {
      allowed_origins = [
        "https://${azurerm_static_web_app.main.default_host_name}",
        "http://localhost:4200"
      ]
      support_credentials = false
    }
  }
  
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME"     = "node"
    "WEBSITE_NODE_DEFAULT_VERSION" = "~18"
    "AZURE_STORAGE_CONNECTION_STRING" = azurerm_storage_account.historical_data.primary_connection_string
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
    
    # Function app specific settings
    "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING" = azurerm_storage_account.historical_data.primary_connection_string
    "WEBSITE_CONTENTSHARE" = "func-${local.resource_prefix}"
  }
  
  tags = local.common_tags
}

# Application Insights (FREE tier)
resource "azurerm_application_insights" "main" {
  name                = "appi-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location           = azurerm_resource_group.main.location
  application_type   = "web"
  
  # Free tier settings
  retention_in_days   = 90
  sampling_percentage = 100
  
  tags = local.common_tags
}

# Budget alert
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-${local.project_name}-${local.environment}"
  resource_group_id = azurerm_resource_group.main.id
  
  amount     = var.monthly_budget
  time_grain = "Monthly"
  
  time_period {
    start_date = formatdate("YYYY-MM-01'T'00:00:00Z", timestamp())
  }
  
  notification {
    enabled   = true
    threshold = 80
    operator  = "GreaterThan"
    
    contact_emails = var.budget_alert_emails
  }
  
  notification {
    enabled   = true
    threshold = 100
    operator  = "GreaterThan"
    
    contact_emails = var.budget_alert_emails
  }
}