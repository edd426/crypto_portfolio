variable "location" {
  description = "Azure location for all resources"
  type        = string
  default     = "West US 2"  # Try a different region with more quota availability
}

variable "coingecko_api_key" {
  description = "CoinGecko API key (optional for free tier)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "monthly_budget" {
  description = "Monthly budget in USD for cost alerts"
  type        = number
  default     = 25  # Conservative budget for minimal cost setup
}

variable "budget_alert_emails" {
  description = "List of email addresses to receive budget alerts"
  type        = list(string)
  validation {
    condition     = length(var.budget_alert_emails) > 0
    error_message = "At least one email address must be provided for budget alerts."
  }
}