resource "random_string" "storage_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "azurerm_storage_account" "functions" {
  name                     = "st${substr(random_string.storage_suffix.result, 0, 6)}${substr(var.project_name, 0, 8)}${substr(var.environment, 0, 4)}"
  resource_group_name      = var.resource_group_name
  location                = var.location
  account_tier            = "Standard"
  account_replication_type = "LRS"  # Cheapest option
  
  # Minimal cost settings
  min_tls_version = "TLS1_2"
  
  tags = var.tags
}

resource "azurerm_storage_container" "functions" {
  name                  = "functions"
  storage_account_name  = azurerm_storage_account.functions.name
  container_access_type = "private"
}