output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "static_web_app_url" {
  description = "URL of the static web app (frontend)"
  value       = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "static_web_app_name" {
  description = "Name of the static web app"
  value       = azurerm_static_web_app.main.name
}

output "static_web_app_api_key" {
  description = "API key for Static Web App deployment"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}