output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "static_web_app_url" {
  description = "URL of the static web app (frontend)"
  value       = module.static_web_app.static_web_app_url
}

output "function_app_url" {
  description = "URL of the function app (backend API)"
  value       = module.function_app.function_app_url
}

output "function_app_name" {
  description = "Name of the function app"
  value       = module.function_app.function_app_name
}

output "static_web_app_name" {
  description = "Name of the static web app"
  value       = module.static_web_app.static_web_app_name
}

# Sensitive outputs for CI/CD
output "static_web_app_api_key" {
  description = "API key for Static Web App deployment"
  value       = module.static_web_app.api_key
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "Application Insights connection string"
  value       = module.monitoring.connection_string
  sensitive   = true
}