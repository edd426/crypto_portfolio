# Terraform state will be stored locally initially
# Later can be moved to Azure Storage for team collaboration

# Uncomment and configure when ready for remote state:
# terraform {
#   backend "azurerm" {
#     resource_group_name  = "rg-terraform-state"
#     storage_account_name = "tfstatecryptoportfolio"
#     container_name       = "terraform-state"
#     key                  = "production.terraform.tfstate"
#   }
# }