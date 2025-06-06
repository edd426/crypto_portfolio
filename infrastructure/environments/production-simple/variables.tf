variable "location" {
  description = "Azure location for all resources"
  type        = string
  default     = "West US 2"  # Available for Static Web Apps
}

variable "monthly_budget" {
  description = "Monthly budget in USD for cost alerts"
  type        = number
  default     = 25
}

variable "budget_alert_emails" {
  description = "List of email addresses to receive budget alerts"
  type        = list(string)
  default     = ["eddelord@gmail.com"]
}