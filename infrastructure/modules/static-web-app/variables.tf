variable "static_web_app_name" {
  description = "Name of the static web app"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure location"
  type        = string
}

variable "api_url" {
  description = "URL of the backend API"
  type        = string
}

variable "additional_app_settings" {
  description = "Additional app settings"
  type        = map(string)
  default     = {}
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}