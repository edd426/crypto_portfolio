/**
 * Download historical data for top 10 cryptocurrencies
 */

const { HistoricalDataDownloader } = require('./dist/src/scripts/downloadCompleteHistory');

async function downloadTop10() {
  console.log('🚀 Downloading historical data for top 10 cryptocurrencies...');
  
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    process.exit(1);
  }

  try {
    const downloader = new HistoricalDataDownloader(connectionString);
    
    // Download top 10 coins
    const stats = await downloader.downloadCompleteHistory(10);
    
    console.log('\n🎉 Top 10 download completed!');
    console.log(`✅ Successfully downloaded data for ${stats.successful} coins`);
    console.log(`📈 Total data points: ${stats.totalDataPoints.toLocaleString()}`);
    console.log(`💾 Total size: ${(stats.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`💰 Estimated cost: $${stats.totalSizeBytes * 0.0000152 / (1024 * 1024)}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      stats.errors.forEach(({ coin, error }) => {
        console.log(`   ${coin}: ${error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    process.exit(1);
  }
}

downloadTop10();