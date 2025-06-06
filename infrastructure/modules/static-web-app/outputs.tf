output "static_web_app_name" {
  description = "Name of the static web app"
  value       = azurerm_static_web_app.main.name
}

output "default_hostname" {
  description = "Default hostname of the static web app"
  value       = azurerm_static_web_app.main.default_host_name
}

output "static_web_app_url" {
  description = "URL of the static web app"
  value       = "https://${azurerm_static_web_app.main.default_host_name}"
}

output "api_key" {
  description = "API key for deployment"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}