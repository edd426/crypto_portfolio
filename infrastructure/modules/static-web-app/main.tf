resource "azurerm_static_web_app" "main" {
  name                = var.static_web_app_name
  resource_group_name = var.resource_group_name
  location           = var.location
  sku_tier           = "Free"  # Free tier for minimal cost
  sku_size           = "Free"

  app_settings = merge({
    "API_URL" = var.api_url
  }, var.additional_app_settings)

  tags = var.tags
}