output "function_app_name" {
  description = "Name of the function app"
  value       = azurerm_linux_function_app.main.name
}

output "function_app_hostname" {
  description = "Hostname of the function app"
  value       = azurerm_linux_function_app.main.default_hostname
}

output "function_app_url" {
  description = "URL of the function app"
  value       = "https://${azurerm_linux_function_app.main.default_hostname}"
}

output "function_app_id" {
  description = "ID of the function app"
  value       = azurerm_linux_function_app.main.id
}

output "principal_id" {
  description = "Principal ID of the function app managed identity"
  value       = azurerm_linux_function_app.main.identity[0].principal_id
}