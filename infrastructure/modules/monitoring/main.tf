resource "azurerm_application_insights" "main" {
  name                = var.application_insights_name
  resource_group_name = var.resource_group_name
  location           = var.location
  application_type   = "web"
  
  # Free tier settings for minimal cost
  retention_in_days   = 90  # Free tier default
  sampling_percentage = 100
  
  tags = var.tags
}

# Basic budget alert to prevent cost overruns
resource "azurerm_consumption_budget_resource_group" "main" {
  name              = "budget-${var.project_name}-${var.environment}"
  resource_group_id = var.resource_group_id
  
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