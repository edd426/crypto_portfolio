resource "azurerm_service_plan" "functions" {
  name                = "plan-${var.function_app_name}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "Y1"  # Consumption plan (cheapest)
  
  tags = var.tags
}

resource "azurerm_linux_function_app" "main" {
  name                = var.function_app_name
  resource_group_name = var.resource_group_name
  location            = var.location

  storage_account_name       = var.storage_account_name
  storage_account_access_key = var.storage_account_access_key
  service_plan_id           = azurerm_service_plan.functions.id

  # Minimal cost configuration
  functions_extension_version = "~4"
  
  site_config {
    application_stack {
      node_version = "18"
    }
    
    # CORS configuration for frontend
    cors {
      allowed_origins = var.cors_allowed_origins
      support_credentials = false
    }
    
    # Cost optimization
    use_32_bit_worker = true  # Use less memory
  }

  app_settings = merge({
    "FUNCTIONS_WORKER_RUNTIME"     = "node"
    "WEBSITE_NODE_DEFAULT_VERSION" = "~18"
    "WEBSITE_RUN_FROM_PACKAGE"     = "1"
    
    # Application settings
    "NODE_ENV"                     = var.environment
    "COINGECKO_API_KEY"           = var.coingecko_api_key
    "API_CACHE_TTL_MINUTES"       = "5"
    "DEBUG_LEVEL"                 = var.environment == "production" ? "1" : "3"
    
    # Cost optimization - no premium features
    "WEBSITE_ENABLE_SYNC_UPDATE_SITE" = "true"
    "WEBSITE_CONTENTOVERVNET"         = "0"
  }, var.additional_app_settings)

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}