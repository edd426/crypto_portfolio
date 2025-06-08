/**
 * Get exact list of downloaded coins and compare with top 100
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');

async function getExactList() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING not set');
    process.exit(1);
  }

  try {
    // Get current coins in storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('historical-data');
    
    const downloadedCoins = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.endsWith('.json') && blob.name !== 'test.json') {
        const coinSymbol = blob.name.replace('.json', '').toUpperCase();
        downloadedCoins.push(coinSymbol);
      }
    }
    
    // Get top 100 from CoinGecko for comparison
    console.log('📊 Fetching current top 100 from CoinGecko...');
    const marketUrl = 'https://api.coingecko.com/api/v3/coins/markets';
    const response = await axios.get(marketUrl, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      }
    });
    
    const top100Symbols = response.data.map(coin => coin.symbol.toUpperCase());
    
    console.log(`\n📊 Results:`);
    console.log(`✅ Downloaded coins: ${downloadedCoins.length}`);
    console.log(`🎯 Top 100 target: ${top100Symbols.length}`);
    
    // Find missing coins
    const missing = top100Symbols.filter(symbol => !downloadedCoins.includes(symbol));
    const extra = downloadedCoins.filter(symbol => !top100Symbols.includes(symbol));
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing coins (${missing.length}):`);
      missing.forEach(coin => console.log(`   ${coin}`));
    }
    
    if (extra.length > 0) {
      console.log(`\n➕ Extra coins (${extra.length}) - from previous downloads:`);
      extra.forEach(coin => console.log(`   ${coin}`));
    }
    
    if (missing.length === 0) {
      console.log('\n🎉 All top 100 coins are present!');
    }
    
    console.log(`\n📋 Total unique coins available: ${downloadedCoins.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getExactList();