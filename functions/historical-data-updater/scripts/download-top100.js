/**
 * Download historical data for top 100 cryptocurrencies
 * This is the main production script for comprehensive backtesting coverage
 */

const { HistoricalDataDownloader } = require('./dist/src/scripts/downloadCompleteHistory');

async function downloadTop100() {
  console.log('🚀 Downloading historical data for top 100 cryptocurrencies...');
  console.log('📅 This may take 30-45 minutes due to API rate limiting');
  
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    process.exit(1);
  }

  try {
    const downloader = new HistoricalDataDownloader(connectionString);
    
    console.log('🎯 Starting download of top 100 cryptocurrencies...');
    console.log('⏱️  Estimated time: 30-45 minutes (with rate limiting)');
    console.log('💰 Estimated cost: ~$0.05-0.10');
    
    // Download top 100 coins with full historical data
    const stats = await downloader.downloadCompleteHistory(100);
    
    console.log('\n🎉 Top 100 download completed!');
    console.log('============================================================');
    console.log(`✅ Successfully downloaded: ${stats.successful} coins`);
    console.log(`⏭️  Skipped (already exist): ${stats.skipped} coins`);
    console.log(`❌ Failed: ${stats.failed} coins`);
    console.log(`📈 Total data points: ${stats.totalDataPoints.toLocaleString()}`);
    console.log(`💾 Total size: ${(stats.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`💰 Estimated cost: $${(stats.totalSizeBytes * 0.0000152 / (1024 * 1024)).toFixed(4)}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      stats.errors.forEach(({ coin, error }) => {
        console.log(`   ${coin}: ${error}`);
      });
    }
    
    console.log('\n🌐 Data accessible at:');
    console.log('   https://stcrypto9rc2a6.blob.core.windows.net/historical-data/');
    
    console.log('\n🎯 Top 100 coverage complete - ready for comprehensive backtesting!');
    
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    process.exit(1);
  }
}

downloadTop100();