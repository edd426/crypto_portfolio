/**
 * Force download script that bypasses existing data check
 */

const { HistoricalDataDownloader } = require('./dist/src/scripts/downloadCompleteHistory');

// Patch the shouldSkipCoin method to always return false
class ForceDownloader extends HistoricalDataDownloader {
  async shouldSkipCoin(coin) {
    return false; // Never skip - always download fresh data
  }
}

async function forceDownload() {
  console.log('🔄 Force downloading fresh historical data...');
  
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('❌ AZURE_STORAGE_CONNECTION_STRING environment variable not set');
    process.exit(1);
  }

  try {
    const downloader = new ForceDownloader(connectionString);
    
    // Download just top 3 coins with fresh data
    const stats = await downloader.downloadCompleteHistory(3);
    
    console.log('\n🎉 Force download completed!');
    console.log(`✅ Successfully downloaded data for ${stats.successful} coins`);
    
  } catch (error) {
    console.error('❌ Force download failed:', error.message);
    process.exit(1);
  }
}

forceDownload();