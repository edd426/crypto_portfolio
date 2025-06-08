/**
 * Check progress of top 100 download by counting files in blob storage
 */

const { BlobServiceClient } = require('@azure/storage-blob');

async function checkProgress() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING not set');
    process.exit(1);
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('historical-data');
    
    console.log('📊 Checking historical data progress...\n');
    
    let count = 0;
    let totalSize = 0;
    const coins = [];
    
    for await (const blob of containerClient.listBlobsFlat()) {
      count++;
      totalSize += blob.properties.contentLength || 0;
      
      const coinSymbol = blob.name.replace('.json', '').toUpperCase();
      coins.push(coinSymbol);
    }
    
    console.log(`✅ Downloaded coins: ${count}/100`);
    console.log(`💾 Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`📈 Estimated data points: ${(count * 366).toLocaleString()}`);
    
    if (count > 0) {
      console.log('\n🪙 Available coins:');
      // Sort coins and display in rows of 10
      coins.sort();
      for (let i = 0; i < coins.length; i += 10) {
        const row = coins.slice(i, i + 10).join(', ');
        console.log(`   ${row}`);
      }
    }
    
    if (count < 100) {
      console.log(`\n⏳ Download in progress... ${100 - count} coins remaining`);
      console.log('💡 Run "tail -f download-top100.log" to monitor progress');
    } else {
      console.log('\n🎉 All 100 coins downloaded successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error checking progress:', error.message);
  }
}

checkProgress();