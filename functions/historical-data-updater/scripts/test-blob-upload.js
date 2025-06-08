/**
 * Simple test script to verify blob storage upload functionality
 */
const { BlobServiceClient } = require('@azure/storage-blob');

async function testBlobUpload() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    return;
  }

  try {
    console.log('🧪 Testing blob storage upload...');
    
    // Create blob service client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerName = 'historical-data';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Sample historical data for Bitcoin
    const sampleData = {
      symbol: 'btc',
      name: 'Bitcoin',
      lastUpdated: '2025-06-08T14:30:00.000Z',
      priceHistory: [
        { date: '2025-06-01', price: 67500.0, marketCap: 1334325000000, volume: 18500000000 },
        { date: '2025-06-02', price: 68200.0, marketCap: 1348125000000, volume: 19200000000 },
        { date: '2025-06-03', price: 67800.0, marketCap: 1340225000000, volume: 17800000000 },
        { date: '2025-06-04', price: 69100.0, marketCap: 1365925000000, volume: 21100000000 },
        { date: '2025-06-05', price: 68900.0, marketCap: 1361975000000, volume: 20500000000 }
      ]
    };

    // Upload sample data
    const blobName = 'btc.json';
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const dataString = JSON.stringify(sampleData, null, 2);
    console.log(`📤 Uploading ${blobName} (${dataString.length} bytes)...`);
    
    await blockBlobClient.upload(dataString, dataString.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json'
      }
    });
    
    console.log('✅ Upload successful!');
    
    // Test public read access
    const publicUrl = `https://stcrypto9rc2a6.blob.core.windows.net/historical-data/${blobName}`;
    console.log(`🌐 Testing public access: ${publicUrl}`);
    
    const fetch = require('node-fetch');
    const response = await fetch(publicUrl);
    
    if (response.ok) {
      const downloadedData = await response.json();
      console.log('✅ Public read access works!');
      console.log(`📊 Downloaded data has ${downloadedData.priceHistory.length} data points`);
    } else {
      console.error(`❌ Public read failed: ${response.status} ${response.statusText}`);
    }
    
    console.log('🎉 Blob storage test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBlobUpload();