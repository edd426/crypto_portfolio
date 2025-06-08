/**
 * Upload sample historical data for testing backtesting functionality
 */
const { BlobServiceClient } = require('@azure/storage-blob');

async function uploadSampleData() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    return;
  }

  try {
    console.log('🚀 Uploading sample historical data for backtesting...');
    
    // Create blob service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = 'historical-data';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Sample coins with historical data
    const sampleCoins = [
      {
        symbol: 'btc',
        name: 'Bitcoin',
        priceHistory: [
          { date: '2024-01-01', price: 42000.0, marketCap: 825000000000, volume: 15000000000 },
          { date: '2024-02-01', price: 45000.0, marketCap: 884000000000, volume: 16000000000 },
          { date: '2024-03-01', price: 51000.0, marketCap: 1002000000000, volume: 18000000000 },
          { date: '2024-04-01', price: 62000.0, marketCap: 1218000000000, volume: 20000000000 },
          { date: '2024-05-01', price: 58000.0, marketCap: 1139000000000, volume: 19000000000 },
          { date: '2024-06-01', price: 60000.0, marketCap: 1178000000000, volume: 18500000000 },
          { date: '2024-07-01', price: 63000.0, marketCap: 1237000000000, volume: 17000000000 },
          { date: '2024-08-01', price: 59000.0, marketCap: 1158000000000, volume: 16500000000 },
          { date: '2024-09-01', price: 61000.0, marketCap: 1198000000000, volume: 18000000000 },
          { date: '2024-10-01', price: 65000.0, marketCap: 1276000000000, volume: 21000000000 },
          { date: '2024-11-01', price: 67000.0, marketCap: 1315000000000, volume: 22000000000 },
          { date: '2024-12-01', price: 69000.0, marketCap: 1354000000000, volume: 20000000000 },
          { date: '2025-01-01', price: 71000.0, marketCap: 1393000000000, volume: 19000000000 },
          { date: '2025-02-01', price: 68000.0, marketCap: 1335000000000, volume: 18000000000 },
          { date: '2025-03-01', price: 66000.0, marketCap: 1296000000000, volume: 17500000000 },
          { date: '2025-04-01', price: 64000.0, marketCap: 1257000000000, volume: 17000000000 },
          { date: '2025-05-01', price: 67000.0, marketCap: 1315000000000, volume: 18500000000 },
          { date: '2025-06-01', price: 69500.0, marketCap: 1364000000000, volume: 19500000000 }
        ]
      },
      {
        symbol: 'eth',
        name: 'Ethereum',
        priceHistory: [
          { date: '2024-01-01', price: 2400.0, marketCap: 288000000000, volume: 8000000000 },
          { date: '2024-02-01', price: 2650.0, marketCap: 318000000000, volume: 9000000000 },
          { date: '2024-03-01', price: 3200.0, marketCap: 384000000000, volume: 11000000000 },
          { date: '2024-04-01', price: 3800.0, marketCap: 456000000000, volume: 13000000000 },
          { date: '2024-05-01', price: 3500.0, marketCap: 420000000000, volume: 12000000000 },
          { date: '2024-06-01', price: 3600.0, marketCap: 432000000000, volume: 11500000000 },
          { date: '2024-07-01', price: 3750.0, marketCap: 450000000000, volume: 10500000000 },
          { date: '2024-08-01', price: 3400.0, marketCap: 408000000000, volume: 10000000000 },
          { date: '2024-09-01', price: 3550.0, marketCap: 426000000000, volume: 11000000000 },
          { date: '2024-10-01', price: 3800.0, marketCap: 456000000000, volume: 13500000000 },
          { date: '2024-11-01', price: 3900.0, marketCap: 468000000000, volume: 14000000000 },
          { date: '2024-12-01', price: 4100.0, marketCap: 492000000000, volume: 13000000000 },
          { date: '2025-01-01', price: 4250.0, marketCap: 510000000000, volume: 12500000000 },
          { date: '2025-02-01', price: 4000.0, marketCap: 480000000000, volume: 11500000000 },
          { date: '2025-03-01', price: 3850.0, marketCap: 462000000000, volume: 11000000000 },
          { date: '2025-04-01', price: 3700.0, marketCap: 444000000000, volume: 10500000000 },
          { date: '2025-05-01', price: 3950.0, marketCap: 474000000000, volume: 12000000000 },
          { date: '2025-06-01', price: 4150.0, marketCap: 498000000000, volume: 12800000000 }
        ]
      },
      {
        symbol: 'usdt',
        name: 'Tether',
        priceHistory: [
          { date: '2024-01-01', price: 1.0, marketCap: 91000000000, volume: 25000000000 },
          { date: '2024-02-01', price: 1.0, marketCap: 94000000000, volume: 27000000000 },
          { date: '2024-03-01', price: 1.0, marketCap: 97000000000, volume: 30000000000 },
          { date: '2024-04-01', price: 1.0, marketCap: 100000000000, volume: 32000000000 },
          { date: '2024-05-01', price: 1.0, marketCap: 102000000000, volume: 31000000000 },
          { date: '2024-06-01', price: 1.0, marketCap: 104000000000, volume: 29000000000 },
          { date: '2024-07-01', price: 1.0, marketCap: 106000000000, volume: 28000000000 },
          { date: '2024-08-01', price: 1.0, marketCap: 108000000000, volume: 27000000000 },
          { date: '2024-09-01', price: 1.0, marketCap: 110000000000, volume: 30000000000 },
          { date: '2024-10-01', price: 1.0, marketCap: 112000000000, volume: 33000000000 },
          { date: '2024-11-01', price: 1.0, marketCap: 114000000000, volume: 35000000000 },
          { date: '2024-12-01', price: 1.0, marketCap: 116000000000, volume: 32000000000 },
          { date: '2025-01-01', price: 1.0, marketCap: 118000000000, volume: 30000000000 },
          { date: '2025-02-01', price: 1.0, marketCap: 119000000000, volume: 28000000000 },
          { date: '2025-03-01', price: 1.0, marketCap: 120000000000, volume: 27000000000 },
          { date: '2025-04-01', price: 1.0, marketCap: 121000000000, volume: 26000000000 },
          { date: '2025-05-01', price: 1.0, marketCap: 122000000000, volume: 29000000000 },
          { date: '2025-06-01', price: 1.0, marketCap: 123000000000, volume: 31000000000 }
        ]
      },
      {
        symbol: 'xrp',
        name: 'XRP',
        priceHistory: [
          { date: '2024-01-01', price: 0.52, marketCap: 28000000000, volume: 1200000000 },
          { date: '2024-02-01', price: 0.58, marketCap: 31000000000, volume: 1400000000 },
          { date: '2024-03-01', price: 0.72, marketCap: 39000000000, volume: 1800000000 },
          { date: '2024-04-01', price: 0.68, marketCap: 37000000000, volume: 1600000000 },
          { date: '2024-05-01', price: 0.63, marketCap: 34000000000, volume: 1500000000 },
          { date: '2024-06-01', price: 0.65, marketCap: 35000000000, volume: 1450000000 },
          { date: '2024-07-01', price: 0.61, marketCap: 33000000000, volume: 1300000000 },
          { date: '2024-08-01', price: 0.59, marketCap: 32000000000, volume: 1250000000 },
          { date: '2024-09-01', price: 0.67, marketCap: 36000000000, volume: 1600000000 },
          { date: '2024-10-01', price: 0.74, marketCap: 40000000000, volume: 1900000000 },
          { date: '2024-11-01', price: 0.78, marketCap: 42000000000, volume: 2000000000 },
          { date: '2024-12-01', price: 0.71, marketCap: 38000000000, volume: 1750000000 },
          { date: '2025-01-01', price: 0.69, marketCap: 37000000000, volume: 1650000000 },
          { date: '2025-02-01', price: 0.66, marketCap: 35000000000, volume: 1550000000 },
          { date: '2025-03-01', price: 0.63, marketCap: 34000000000, volume: 1500000000 },
          { date: '2025-04-01', price: 0.61, marketCap: 33000000000, volume: 1400000000 },
          { date: '2025-05-01', price: 0.68, marketCap: 37000000000, volume: 1700000000 },
          { date: '2025-06-01', price: 0.72, marketCap: 39000000000, volume: 1850000000 }
        ]
      },
      {
        symbol: 'sol',
        name: 'Solana',
        priceHistory: [
          { date: '2024-01-01', price: 85.0, marketCap: 37000000000, volume: 2000000000 },
          { date: '2024-02-01', price: 105.0, marketCap: 46000000000, volume: 2500000000 },
          { date: '2024-03-01', price: 175.0, marketCap: 76000000000, volume: 4000000000 },
          { date: '2024-04-01', price: 185.0, marketCap: 81000000000, volume: 4200000000 },
          { date: '2024-05-01', price: 165.0, marketCap: 72000000000, volume: 3800000000 },
          { date: '2024-06-01', price: 145.0, marketCap: 63000000000, volume: 3200000000 },
          { date: '2024-07-01', price: 155.0, marketCap: 68000000000, volume: 3400000000 },
          { date: '2024-08-01', price: 135.0, marketCap: 59000000000, volume: 3000000000 },
          { date: '2024-09-01', price: 125.0, marketCap: 55000000000, volume: 2800000000 },
          { date: '2024-10-01', price: 165.0, marketCap: 72000000000, volume: 3800000000 },
          { date: '2024-11-01', price: 195.0, marketCap: 85000000000, volume: 4500000000 },
          { date: '2024-12-01', price: 210.0, marketCap: 92000000000, volume: 4800000000 },
          { date: '2025-01-01', price: 225.0, marketCap: 98000000000, volume: 5000000000 },
          { date: '2025-02-01', price: 205.0, marketCap: 89000000000, volume: 4500000000 },
          { date: '2025-03-01', price: 185.0, marketCap: 81000000000, volume: 4000000000 },
          { date: '2025-04-01', price: 175.0, marketCap: 76000000000, volume: 3800000000 },
          { date: '2025-05-01', price: 195.0, marketCap: 85000000000, volume: 4200000000 },
          { date: '2025-06-01', price: 215.0, marketCap: 94000000000, volume: 4600000000 }
        ]
      }
    ];

    // Upload each coin's data
    for (const coin of sampleCoins) {
      const coinData = {
        symbol: coin.symbol,
        name: coin.name,
        lastUpdated: '2025-06-08T14:45:00.000Z',
        priceHistory: coin.priceHistory
      };

      const blobName = `${coin.symbol}.json`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const dataString = JSON.stringify(coinData, null, 2);
      console.log(`📤 Uploading ${blobName} (${dataString.length} bytes, ${coin.priceHistory.length} data points)...`);
      
      await blockBlobClient.upload(dataString, dataString.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json'
        }
      });
    }
    
    console.log('✅ Sample data upload completed!');
    
    // Test public access to one file
    const testUrl = 'https://stcrypto9rc2a6.blob.core.windows.net/historical-data/eth.json';
    console.log(`🌐 Testing public access: ${testUrl}`);
    
    const fetch = require('node-fetch');
    const response = await fetch(testUrl);
    
    if (response.ok) {
      const downloadedData = await response.json();
      console.log(`✅ ETH data accessible: ${downloadedData.priceHistory.length} data points`);
      console.log(`📊 Price range: $${Math.min(...downloadedData.priceHistory.map(p => p.price))} - $${Math.max(...downloadedData.priceHistory.map(p => p.price))}`);
    } else {
      console.error(`❌ Public read failed: ${response.status} ${response.statusText}`);
    }
    
    console.log('🎉 Historical data is ready for backtesting!');
    console.log('📋 Available coins: BTC, ETH, USDT, XRP, SOL');
    console.log('📅 Date range: 2024-01-01 to 2025-06-01 (18 months)');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

uploadSampleData();