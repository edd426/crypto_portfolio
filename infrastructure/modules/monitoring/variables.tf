variable "application_insights_name" {
  description = "Name of the Application Insights instance"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "resource_group_id" {
  description = "ID of the resource group"
  type        = string
}

variable "location" {
  description = "Azure location"
  type        = string
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "monthly_budget" {
  description = "Monthly budget in USD"
  type        = number
  default     = 50
}

variable "budget_alert_emails" {
  description = "List of email addresses for budget alerts"
  type        = list(string)
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}