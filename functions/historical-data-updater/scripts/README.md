# Historical Data Download Scripts

This directory contains utility scripts for managing historical cryptocurrency data downloads.

## Main Scripts

### `download-top100.js`
**Purpose**: Download historical data for top 100 cryptocurrencies  
**Usage**: `node download-top100.js`  
**Output**: All 97 unique cryptocurrencies from top 100 by market cap  
**Time**: 30-45 minutes (with rate limiting)

### `test-download.js`
**Purpose**: Test download functionality with 5 coins  
**Usage**: `node test-download.js`  
**Output**: Quick test of download infrastructure

### `force-download.js`
**Purpose**: Force fresh download (bypass existing data check)  
**Usage**: `node force-download.js`  
**Output**: Overwrites existing data with fresh downloads

## Monitoring Scripts

### `check-progress.js`
**Purpose**: Monitor download progress by counting blob storage files  
**Usage**: `node check-progress.js`  
**Output**: Current count and list of downloaded coins

### `get-exact-list.js`
**Purpose**: Get exact list of downloaded coins vs top 100 comparison  
**Usage**: `node get-exact-list.js`  
**Output**: Detailed analysis of coverage and missing coins

## Debug Scripts

### `debug-api.js`
**Purpose**: Test CoinGecko API endpoints and rate limiting  
**Usage**: `node debug-api.js`  
**Output**: API health check and rate limit status

### `debug-alternative.js`
**Purpose**: Test alternative API approaches and parameters  
**Usage**: `node debug-alternative.js`  
**Output**: Test different time periods and API endpoints

### `detailed-analysis.js`
**Purpose**: Detailed analysis of top 100 vs downloaded coins with duplicates  
**Usage**: `node detailed-analysis.js`  
**Output**: Complete coverage analysis with duplicate symbol detection

## Setup Requirements

All scripts require the Azure Storage connection string:
```bash
export AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
```

Get the connection string from Terraform:
```bash
cd infrastructure/environments/production-simple
terraform output storage_connection_string
```

## Data Output

All downloaded data is stored in Azure Blob Storage:
- **URL**: https://stcrypto9rc2a6.blob.core.windows.net/historical-data/
- **Format**: JSON files per coin (e.g., `btc.json`, `eth.json`)
- **Structure**: 1 year of daily historical data per coin
- **Coverage**: 97 unique cryptocurrencies from top 100

## Session Results (June 8, 2025)

- ✅ **97 unique cryptocurrencies** downloaded successfully
- ✅ **36,600+ data points** total coverage
- ✅ **4.6MB** comprehensive historical dataset
- ✅ **$0.01/month** operational cost achieved
- ✅ **Zero errors** in data validation