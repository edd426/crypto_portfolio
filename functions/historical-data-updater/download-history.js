/**
 * Simple Node.js script to run the complete history download
 * Usage: node download-history.js
 */

const { downloadCompleteHistory } = require('./dist/src/scripts/downloadCompleteHistory');

async function main() {
  console.log('🚀 Starting complete historical data download...');
  console.log('📋 This will fetch complete history for top 100 cryptocurrencies');
  console.log('⏱️ Estimated time: 45-60 minutes');
  console.log('💾 Estimated data: ~50-100 MB');
  console.log('💰 Estimated cost: ~$0.005');
  console.log('');

  try {
    await downloadCompleteHistory();
    console.log('🎉 Download completed successfully!');
  } catch (error) {
    console.error('❌ Download failed:', error.message);
    process.exit(1);
  }
}

main();