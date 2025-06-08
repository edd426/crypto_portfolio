/**
 * Detailed analysis of top 100 vs downloaded coins
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');

async function detailedAnalysis() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  try {
    // Get downloaded coins
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('historical-data');
    
    const downloadedCoins = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.endsWith('.json') && blob.name !== 'test.json') {
        downloadedCoins.push(blob.name.replace('.json', '').toUpperCase());
      }
    }
    
    // Get top 100 with full details
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      }
    });
    
    console.log(`Downloaded coins: ${downloadedCoins.length}`);
    console.log(`Top 100 from API: ${response.data.length}`);
    
    // Check for duplicate symbols in top 100
    const symbolCounts = {};
    const duplicateSymbols = [];
    
    response.data.forEach((coin, index) => {
      const symbol = coin.symbol.toUpperCase();
      if (symbolCounts[symbol]) {
        symbolCounts[symbol]++;
        if (symbolCounts[symbol] === 2) {
          duplicateSymbols.push(symbol);
        }
      } else {
        symbolCounts[symbol] = 1;
      }
    });
    
    if (duplicateSymbols.length > 0) {
      console.log(`\n🔄 Duplicate symbols in top 100: ${duplicateSymbols.length}`);
      duplicateSymbols.forEach(symbol => {
        const coins = response.data.filter(c => c.symbol.toUpperCase() === symbol);
        console.log(`   ${symbol}: ${coins.map(c => c.name).join(', ')}`);
      });
    }
    
    // Find unique symbols in top 100
    const uniqueTop100 = [...new Set(response.data.map(coin => coin.symbol.toUpperCase()))];
    console.log(`\nUnique symbols in top 100: ${uniqueTop100.length}`);
    
    // Find missing
    const missing = uniqueTop100.filter(symbol => !downloadedCoins.includes(symbol));
    
    if (missing.length > 0) {
      console.log(`\n❌ Missing symbols: ${missing.length}`);
      missing.forEach(symbol => {
        const coin = response.data.find(c => c.symbol.toUpperCase() === symbol);
        console.log(`   ${symbol} (${coin.name})`);
      });
    } else {
      console.log('\n✅ All unique symbols from top 100 are present!');
    }
    
    // Calculate actual coverage
    const coverage = (downloadedCoins.length / uniqueTop100.length * 100).toFixed(1);
    console.log(`\n📊 Coverage: ${coverage}% (${downloadedCoins.length}/${uniqueTop100.length} unique symbols)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

detailedAnalysis();