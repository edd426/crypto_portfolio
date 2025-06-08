/**
 * Test script to download historical data for just 5 coins
 */

const { HistoricalDataDownloader } = require('./dist/src/scripts/downloadCompleteHistory');

async function testDownload() {
  console.log('🧪 Testing historical data download with 5 coins...');
  
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    console.log('Please set it first:');
    console.log('export AZURE_STORAGE_CONNECTION_STRING="your_connection_string"');
    process.exit(1);
  }

  try {
    const downloader = new HistoricalDataDownloader(connectionString);
    
    // Download just top 5 coins for testing
    const stats = await downloader.downloadCompleteHistory(5);
    
    console.log('\n🎉 Test download completed!');
    console.log(`✅ Successfully downloaded data for ${stats.successful} coins`);
    console.log(`📈 Total data points: ${stats.totalDataPoints.toLocaleString()}`);
    console.log(`💾 Total size: ${(stats.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach(({ coin, error }) => {
        console.log(`   ${coin}: ${error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testDownload();