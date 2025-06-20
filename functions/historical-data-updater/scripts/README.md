# Historical Data Download Scripts

This directory contains utility scripts for managing historical cryptocurrency data downloads.

## Main Script

### `download.js` ⭐ **CONSOLIDATED DOWNLOADER**
**Purpose**: Download historical data for any number of cryptocurrencies (replaces 4 old scripts)  
**Usage**: 
```bash
node download.js --coins 3           # Quick test (3 coins, ~2 minutes)
node download.js --coins 10          # Medium test (10 coins, ~7 minutes)  
node download.js --coins 100         # Production (100 coins, ~45 minutes)
node download.js --coins 5 --force   # Force re-download top 5 coins
node download.js --help              # Show detailed help
```
**Features**: 
- Downloads from coin inception dates (Bitcoin: 2009, Ethereum: 2015, etc.)
- Configurable coin count (1-500)
- Force mode to re-download existing data
- Built-in help and error handling
- Progress tracking and cost estimation

## Monitoring & Analysis Scripts

### `check-progress.js`
**Purpose**: Monitor download progress by counting blob storage files  
**Usage**: `node check-progress.js`  
**Output**: Current count and list of downloaded coins

### `get-exact-list.js`
**Purpose**: Compare downloaded coins vs top 100, find missing coins  
**Usage**: `node get-exact-list.js`  
**Output**: Coverage analysis and missing coin identification

### `detailed-analysis.js`
**Purpose**: Comprehensive analysis with duplicate detection  
**Usage**: `node detailed-analysis.js`  
**Output**: Complete coverage analysis with duplicate symbol detection

## Debug & Testing Scripts

### `debug-api.js`
**Purpose**: Test CoinGecko API health and rate limiting  
**Usage**: `node debug-api.js`  
**Output**: API endpoint status and rate limit verification

### `debug-alternative.js`
**Purpose**: Experiment with alternative API approaches  
**Usage**: `node debug-alternative.js`  
**Output**: Test different API endpoints and parameters

### `test-blob-upload.js`
**Purpose**: Verify Azure Blob Storage upload functionality  
**Usage**: `node test-blob-upload.js`  
**Output**: Storage connection and upload test results

## Quick Start

1. **Set up Azure connection**:
```bash
export AZURE_STORAGE_CONNECTION_STRING="your_connection_string"

# Get connection string from Terraform:
cd infrastructure/environments/production-simple
terraform output storage_connection_string
```

2. **Download crypto data**:
```bash
# Quick test (3 coins, ~2 minutes)
node download.js --coins 3

# Production download (100 coins, ~45 minutes)  
node download.js --coins 100
```

3. **Monitor progress**:
```bash
node check-progress.js
```

## Data Output

All downloaded data is stored in Azure Blob Storage:
- **URL**: https://stcrypto9rc2a6.blob.core.windows.net/historical-data/
- **Format**: JSON files per coin (e.g., `btc.json`, `eth.json`)
- **Coverage**: **LIMITED TO MOST RECENT 1 YEAR ONLY** (CoinGecko Free API restriction)
  - All coins: Maximum 365 days of recent daily data (not historical)
  - Cannot access data from 2010, 2015, etc. - only recent 12 months
  - Full historical data requires CoinGecko Pro API ($129/month)
- **Cost**: <$0.01/month operational

## Recent Improvements (June 20, 2025)

- ✅ **Consolidated scripts** from 15 → 7 files (53% reduction)
- ✅ **API limitations discovered** - CoinGecko free tier limited to recent 1 year only
- ✅ **Fixed download script** to work within free API constraints
- ✅ **Enhanced progress checking** with date ranges and gap detection
- ✅ **Improved rate limiting** and error handling
- ✅ **Command-line interface** with flexible options
- ✅ **Better documentation** and help system

## ⚠️ Important API Limitations

**CoinGecko Free API Restrictions (Discovered June 20, 2025):**
- 🚫 **Historical data access**: Cannot get data from 2010, 2015, etc.
- ✅ **Recent data access**: Can get most recent 365 days only
- 🚫 **Specific date ranges**: Cannot request data from specific years
- 💰 **Upgrade required**: Full historical data needs Pro API ($129/month)

**Impact on Backtesting:**
- Portfolio backtesting limited to recent 12 months
- Cannot test strategies from Bitcoin's early days (2009-2015)
- Long-term historical analysis not possible with free tier