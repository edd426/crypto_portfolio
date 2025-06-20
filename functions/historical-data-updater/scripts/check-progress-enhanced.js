/**
 * Enhanced progress checker with date ranges and gap detection
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
    
    console.log('📊 ENHANCED HISTORICAL DATA ANALYSIS');
    console.log('='.repeat(50));
    console.log('');
    
    const coinData = [];
    let totalSize = 0;
    let totalDataPoints = 0;
    
    console.log('📥 Analyzing downloaded files...\n');
    
    for await (const blob of containerClient.listBlobsFlat()) {
      if (blob.name.endsWith('.json') && blob.name !== 'test.json') {
        try {
          // Download and parse the JSON file
          const blobClient = containerClient.getBlobClient(blob.name);
          const downloadResponse = await blobClient.download();
          const content = await streamToString(downloadResponse.readableStreamBody);
          const data = JSON.parse(content);
          
          // Analyze the data
          const analysis = analyzeData(data);
          
          coinData.push({
            symbol: blob.name.replace('.json', '').toUpperCase(),
            name: data.name || 'Unknown',
            dataPoints: data.dataPoints || data.data?.length || 0,
            earliestDate: data.earliestDate,
            latestDate: data.latestDate,
            lastUpdated: data.lastUpdated,
            fileSize: blob.properties.contentLength || 0,
            gaps: analysis.gaps,
            coverage: analysis.coverage
          });
          
          totalSize += blob.properties.contentLength || 0;
          totalDataPoints += data.dataPoints || data.data?.length || 0;
          
        } catch (error) {
          console.warn(`⚠️  Could not analyze ${blob.name}: ${error.message}`);
        }
      }
    }
    
    // Sort by symbol
    coinData.sort((a, b) => a.symbol.localeCompare(b.symbol));
    
    // Summary statistics
    console.log('📊 SUMMARY STATISTICS');
    console.log('-'.repeat(30));
    console.log(`✅ Downloaded coins: ${coinData.length}`);
    console.log(`💾 Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`📈 Total data points: ${totalDataPoints.toLocaleString()}`);
    console.log(`📅 Average points per coin: ${Math.round(totalDataPoints / coinData.length)}`);
    console.log('');
    
    // Detailed coin analysis
    console.log('📋 DETAILED COIN ANALYSIS');
    console.log('-'.repeat(70));
    console.log('Symbol  | Data Points | Date Range                    | Coverage | Gaps');
    console.log('-'.repeat(70));
    
    coinData.forEach(coin => {
      const symbol = coin.symbol.padEnd(7);
      const points = coin.dataPoints.toString().padStart(11);
      const dateRange = `${coin.earliestDate || 'Unknown'} to ${coin.latestDate || 'Unknown'}`.padEnd(29);
      const coverage = coin.coverage.padEnd(8);
      const gaps = coin.gaps > 0 ? `⚠️ ${coin.gaps}` : '✅ None';
      
      console.log(`${symbol} | ${points} | ${dateRange} | ${coverage} | ${gaps}`);
    });
    
    // Gap analysis summary
    const coinsWithGaps = coinData.filter(coin => coin.gaps > 0);
    if (coinsWithGaps.length > 0) {
      console.log('\n⚠️  DATA QUALITY ISSUES');
      console.log('-'.repeat(30));
      coinsWithGaps.forEach(coin => {
        console.log(`${coin.symbol}: ${coin.gaps} missing days`);
      });
    } else {
      console.log('\n✅ DATA QUALITY: All coins have complete daily coverage');
    }
    
    // Historical coverage analysis
    console.log('\n📅 HISTORICAL COVERAGE ANALYSIS');
    console.log('-'.repeat(40));
    
    const currentYear = new Date().getFullYear();
    const coverageStats = {
      '5+ years': 0,
      '3-5 years': 0,
      '1-3 years': 0,
      '<1 year': 0
    };
    
    coinData.forEach(coin => {
      if (coin.earliestDate) {
        const startYear = new Date(coin.earliestDate).getFullYear();
        const years = currentYear - startYear;
        
        if (years >= 5) coverageStats['5+ years']++;
        else if (years >= 3) coverageStats['3-5 years']++;
        else if (years >= 1) coverageStats['1-3 years']++;
        else coverageStats['<1 year']++;
      }
    });
    
    Object.entries(coverageStats).forEach(([range, count]) => {
      console.log(`${range.padEnd(10)}: ${count} coins`);
    });
    
    console.log('\n🎯 NEXT STEPS');
    console.log('-'.repeat(15));
    if (coinsWithGaps.length > 0) {
      console.log('• Fix data gaps with: node download.js --force');
    }
    if (coinData.some(coin => coin.coverage === 'Limited')) {
      console.log('• Extend historical coverage for better backtesting');
    }
    console.log('• Test frontend backtesting with extended date ranges');
    console.log(`• Scale up: node download.js --coins ${Math.min(coinData.length * 2, 200)}`);
    
  } catch (error) {
    console.error('❌ Error checking progress:', error.message);
  }
}

// Helper function to convert stream to string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}

// Analyze data for gaps and coverage
function analyzeData(data) {
  if (!data.data || !Array.isArray(data.data)) {
    return { gaps: 0, coverage: 'Unknown' };
  }
  
  const dataPoints = data.data;
  let gaps = 0;
  
  // Check for gaps (assuming daily data)
  for (let i = 1; i < dataPoints.length; i++) {
    const prevDate = new Date(dataPoints[i - 1].date);
    const currDate = new Date(dataPoints[i].date);
    const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      gaps += (daysDiff - 1);
    }
  }
  
  // Determine coverage quality
  const totalDays = dataPoints.length;
  let coverage = 'Limited';
  
  if (totalDays >= 1800) coverage = 'Excellent'; // 5+ years
  else if (totalDays >= 1095) coverage = 'Good';     // 3+ years  
  else if (totalDays >= 365) coverage = 'Fair';      // 1+ year
  
  return { gaps, coverage };
}

checkProgress();