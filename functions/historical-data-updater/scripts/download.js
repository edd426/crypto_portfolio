/**
 * CONSOLIDATED CRYPTO DATA DOWNLOADER
 * Replaces: download-top100.js, download-top10.js, test-download.js, force-download.js
 * 
 * Downloads historical cryptocurrency data from coin inception dates.
 * 
 * Usage:
 *   node download.js --coins 3           # Download top 3 coins (quick test)
 *   node download.js --coins 10          # Download top 10 coins 
 *   node download.js --coins 100         # Download top 100 coins (production)
 *   node download.js --coins 5 --force   # Force re-download top 5 coins
 *   node download.js --help              # Show detailed help
 */

const axios = require('axios');
const { BlobServiceClient } = require('@azure/storage-blob');

// Coin inception dates for maximum historical data
const INCEPTION_DATES = {
  'bitcoin': '2009-01-03',
  'ethereum': '2015-07-30',
  'binancecoin': '2017-07-08',
  'ripple': '2013-01-01',
  'cardano': '2017-09-29',
  'solana': '2020-03-16',
  'dogecoin': '2013-12-06',
  'polkadot': '2020-08-19',
  'matic-network': '2019-05-15',
  'avalanche-2': '2020-09-22',
  'chainlink': '2017-09-20',
  'uniswap': '2020-09-17',
  'litecoin': '2011-10-07',
  'bitcoin-cash': '2017-08-01',
  'ethereum-classic': '2015-07-30',
  'stellar': '2014-07-31',
  'filecoin': '2020-10-15',
  'tron': '2017-09-13',
  'monero': '2014-04-18',
  'cosmos': '2019-03-14',
  'tether': '2014-11-26',
  'usd-coin': '2018-09-26'
};

const CONFIG = {
  RATE_LIMIT_DELAY: 1500, // 1.5 seconds (40 requests/minute)
  STORAGE_ACCOUNT: 'stcrypto9rc2a6',
  STORAGE_CONTAINER: 'historical-data',
  REQUEST_TIMEOUT: 30000
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    coins: 10, // Default to top 10
    force: false
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--coins' && args[i + 1]) {
      options.coins = parseInt(args[i + 1]);
      if (isNaN(options.coins) || options.coins < 1 || options.coins > 500) {
        console.error('❌ Error: --coins must be a number between 1 and 500');
        process.exit(1);
      }
      i++; // Skip next arg
    } else if (args[i] === '--force') {
      options.force = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      showHelp();
      process.exit(0);
    } else {
      console.error(`❌ Error: Unknown argument '${args[i]}'`);
      console.log('Use --help for usage information');
      process.exit(1);
    }
  }
  
  return options;
}

// Show help information
function showHelp() {
  console.log(`
CONSOLIDATED CRYPTO DATA DOWNLOADER

Downloads historical cryptocurrency data for backtesting.

Usage:
  node download.js [options]

Options:
  --coins NUMBER    Number of top coins to download (1-500, default: 10)
  --force          Force re-download existing files
  --help           Show this help

Examples:
  node download.js --coins 3           # Quick test (3 coins, ~2 minutes)
  node download.js --coins 10          # Medium test (10 coins, ~7 minutes)  
  node download.js --coins 100         # Production (100 coins, ~45 minutes)
  node download.js --coins 5 --force   # Re-download top 5 coins

Data Coverage:
  • All coins: Maximum 1 year (365 days) of daily data
  • CoinGecko free API limitation - full historical data requires Pro API ($129/month)
  • Rate limiting: ~45 requests/minute (respects CoinGecko limits)

Storage:
  • Azure Blob Storage: https://stcrypto9rc2a6.blob.core.windows.net/historical-data/
  • Cost: <$0.01/month operational
  • Format: JSON files per coin (btc.json, eth.json, etc.)

Requirements:
  • AZURE_STORAGE_CONNECTION_STRING environment variable must be set
  • Internet connection for CoinGecko API access
  `);
}

// Get estimated time for download
function getEstimatedTime(coinCount) {
  const minutesPerCoin = 0.7; // ~42 seconds per coin with rate limiting
  const totalMinutes = coinCount * minutesPerCoin;
  
  if (totalMinutes < 1) return 'Less than 1 minute';
  if (totalMinutes < 60) return `${Math.ceil(totalMinutes)} minutes`;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.ceil(totalMinutes % 60);
  return `${hours}h ${minutes}m`;
}

// Calculate days from inception to now (limited by CoinGecko free API)
function getDaysFromInception(coinGeckoId) {
  const inceptionDate = INCEPTION_DATES[coinGeckoId];
  if (!inceptionDate) {
    return 365; // Default to 1 year
  }
  
  const inception = new Date(inceptionDate);
  const now = new Date();
  const diffDays = Math.ceil((now - inception) / (1000 * 60 * 60 * 24));
  
  // CoinGecko free API limit: ~365 days maximum
  return Math.min(diffDays, 365);
}

// Get top cryptocurrencies from CoinGecko
async function getTopCoins(count) {
  console.log(`📡 Fetching top ${count} cryptocurrencies...`);
  
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: count,
      page: 1,
      sparkline: false
    },
    timeout: CONFIG.REQUEST_TIMEOUT
  });

  console.log(`✅ Retrieved ${response.data.length} coins`);
  return response.data;
}

// Check if blob exists in Azure
async function blobExists(containerClient, blobName) {
  try {
    const blobClient = containerClient.getBlobClient(blobName);
    return await blobClient.exists();
  } catch (error) {
    return false;
  }
}

// Upload data to Azure Blob Storage
async function uploadToBlob(containerClient, blobName, data) {
  const blobClient = containerClient.getBlobClient(blobName);
  const uploadData = Buffer.from(JSON.stringify(data, null, 2));
  
  await blobClient.upload(uploadData, uploadData.length, {
    blobHTTPHeaders: {
      blobContentType: 'application/json'
    }
  });
  
  return uploadData.length;
}

// Download historical data for a single coin
async function downloadCoinData(coin, containerClient, options, progress) {
  const { id: coinGeckoId, symbol, name } = coin;
  const blobName = `${symbol.toLowerCase()}.json`;
  
  console.log(`\n[${progress.current}/${progress.total}] ${name} (${symbol.toUpperCase()})`);
  
  try {
    // Check if already exists (unless force mode)
    if (!options.force) {
      const exists = await blobExists(containerClient, blobName);
      if (exists) {
        console.log(`   ⏭️  Already exists, skipping`);
        return { symbol: symbol.toUpperCase(), status: 'skipped', reason: 'exists' };
      }
    }
    
    // Calculate historical period
    const daysOfHistory = getDaysFromInception(coinGeckoId);
    const inceptionDate = INCEPTION_DATES[coinGeckoId] || 'Unknown';
    const years = (daysOfHistory / 365).toFixed(1);
    
    console.log(`   📅 Downloading ${years} years (${daysOfHistory} days) since ${inceptionDate}`);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, CONFIG.RATE_LIMIT_DELAY));
    
    // Download from CoinGecko
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinGeckoId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: daysOfHistory,
        interval: 'daily'
      },
      timeout: CONFIG.REQUEST_TIMEOUT
    });

    const { prices, market_caps, total_volumes } = response.data;
    
    if (!prices || prices.length === 0) {
      throw new Error('No price data received from API');
    }

    // Transform to our format
    const dataPoints = prices.map((price, index) => ({
      date: new Date(price[0]).toISOString().split('T')[0],
      price: price[1],
      marketCap: market_caps[index] ? market_caps[index][1] : 0,
      volume24h: total_volumes[index] ? total_volumes[index][1] : 0
    }));

    // Create final data structure (matches frontend expectations)
    const coinData = {
      symbol: symbol.toLowerCase(),
      name,
      coinGeckoId,
      lastUpdated: new Date().toISOString(),
      dataPoints: dataPoints.length,
      earliestDate: dataPoints[0]?.date,
      latestDate: dataPoints[dataPoints.length - 1]?.date,
      data: dataPoints
    };

    // Upload to Azure
    console.log(`   📤 Uploading ${dataPoints.length} data points...`);
    const fileSize = await uploadToBlob(containerClient, blobName, coinData);
    
    console.log(`   ✅ Success! ${coinData.earliestDate} to ${coinData.latestDate}`);
    
    return {
      symbol: symbol.toUpperCase(),
      status: 'success',
      dataPoints: dataPoints.length,
      dateRange: `${coinData.earliestDate} to ${coinData.latestDate}`,
      years: years,
      fileSize: fileSize
    };
    
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    
    return {
      symbol: symbol.toUpperCase(),
      status: 'failed',
      error: error.message
    };
  }
}

// Main download function
async function downloadCryptoData() {
  const options = parseArgs();
  
  console.log('🚀 CONSOLIDATED CRYPTO DATA DOWNLOADER');
  console.log('='.repeat(50));
  console.log(`📊 Target: Top ${options.coins} cryptocurrencies`);
  console.log(`🔄 Mode: ${options.force ? 'Force re-download' : 'Skip existing files'}`);
  console.log(`⏱️  Estimated time: ${getEstimatedTime(options.coins)}`);
  console.log(`💰 Estimated cost: ~$${(options.coins * 0.001).toFixed(3)}`);
  console.log('');

  // Validate environment
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    console.log('');
    console.log('To set it:');
    console.log('export AZURE_STORAGE_CONNECTION_STRING="your_connection_string"');
    console.log('');
    console.log('Get it from:');
    console.log('cd infrastructure/environments/production-simple');
    console.log('terraform output storage_connection_string');
    process.exit(1);
  }

  try {
    // Initialize Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(CONFIG.STORAGE_CONTAINER);
    
    console.log(`🎯 Starting download of top ${options.coins} cryptocurrencies...`);
    
    if (options.coins >= 50) {
      console.log('⚠️  Large download detected - this may take a while');
      console.log('💡 Consider testing with fewer coins first (--coins 10)');
    }
    
    if (options.force) {
      console.log('🔄 Force mode: Will re-download all existing files');
    }
    
    console.log('📅 Historical coverage: Maximum 1 year (CoinGecko free API limit)');
    console.log('⏱️  Rate limiting: ~40 requests/minute (CoinGecko limits)');
    console.log('');

    // Get coins
    const coins = await getTopCoins(options.coins);
    
    console.log('\n📋 Download Plan:');
    coins.forEach((coin, i) => {
      const days = getDaysFromInception(coin.id);
      const years = (days / 365).toFixed(1);
      const inception = INCEPTION_DATES[coin.id] || 'Unknown';
      console.log(`   ${i+1}. ${coin.name} (${coin.symbol.toUpperCase()}) - ${years} years since ${inception}`);
    });
    
    console.log(`\nEstimated time: ${(coins.length * CONFIG.RATE_LIMIT_DELAY / 1000 / 60).toFixed(1)} minutes`);
    console.log(''.padEnd(50, '='));
    
    // Download each coin
    const results = { success: [], skipped: [], failed: [] };
    let totalDataPoints = 0;
    let totalSize = 0;
    
    for (let i = 0; i < coins.length; i++) {
      const progress = { current: i + 1, total: coins.length };
      const result = await downloadCoinData(coins[i], containerClient, options, progress);
      
      // Categorize result
      if (result.status === 'success') {
        results.success.push(result);
        totalDataPoints += result.dataPoints || 0;
        totalSize += result.fileSize || 0;
      } else if (result.status === 'skipped') {
        results.skipped.push(result);
      } else {
        results.failed.push(result);
      }
    }
    
    // Results summary
    console.log('\n🎉 DOWNLOAD COMPLETE!');
    console.log('='.repeat(50));
    console.log(`✅ Successfully downloaded: ${results.success.length} coins`);
    console.log(`⏭️  Skipped (already exist): ${results.skipped.length} coins`);
    console.log(`❌ Failed: ${results.failed.length} coins`);
    console.log(`📈 Total data points: ${totalDataPoints.toLocaleString()}`);
    console.log(`💾 Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`💰 Estimated cost: $${(totalSize * 0.0000152 / (1024 * 1024)).toFixed(4)}`);
    
    // Error details
    if (results.failed.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.failed.forEach(result => {
        console.log(`   ${result.symbol}: ${result.error}`);
      });
    }
    
    // Success details
    if (results.success.length > 0) {
      console.log('\n📈 Successfully Downloaded (Maximum Historical Data):');
      results.success.forEach(r => {
        console.log(`   ${r.symbol}: ${r.dataPoints} points, ${r.years} years (${r.dateRange})`);
      });
    }
    
    // Next steps
    console.log('\n🌐 Data accessible at:');
    console.log('   https://stcrypto9rc2a6.blob.core.windows.net/historical-data/');
    
    console.log('\n🎯 Next Steps:');
    if (results.success.length > 0) {
      console.log('1. 📱 Frontend will automatically use new historical data');
      console.log('2. 🧪 Test backtesting with extended date ranges');
      console.log('3. 📊 Check results with: node check-progress-enhanced.js');
      
      if (options.coins < 50) {
        console.log(`4. 🚀 Scale up: node download.js --coins ${Math.min(options.coins * 5, 100)}`);
      }
    }
    
    if (results.failed.length > 0) {
      console.log('🔧 For failed downloads, try:');
      console.log('   • Check internet connection');
      console.log('   • Retry with: node download.js --coins [failed_count] --force');
      console.log('   • Debug API issues: node debug-api.js');
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('• Check AZURE_STORAGE_CONNECTION_STRING is set correctly');
    console.log('• Verify internet connection');
    console.log('• Test Azure access: node test-blob-upload.js');
    console.log('• Debug CoinGecko API: node debug-api.js');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadCryptoData();
}

module.exports = { downloadCryptoData };