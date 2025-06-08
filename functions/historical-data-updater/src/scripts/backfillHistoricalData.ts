/**
 * One-time script to backfill complete historical data for top 100 cryptocurrencies
 * Run this locally or as a manual Azure Function to populate initial data
 */

import { BlobServiceClient } from "@azure/storage-blob";
import axios from "axios";
import { validateCoinGeckoResponse, validateHistoricalData, cleanHistoricalData } from '../utils/dataValidation';

interface CoinGeckoHistoricalResponse {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface HistoricalDataPoint {
  date: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

interface CoinMetadata {
  id: string;
  symbol: string;
  name: string;
  lastUpdated: string;
}

/**
 * Main backfill function
 */
export async function backfillHistoricalData(): Promise<void> {
  console.log('🚀 Starting historical data backfill...');
  console.log('📅 Date:', new Date().toISOString());

  try {
    // Initialize Azure Blob Storage client
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('historical-data');

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'blob' // Public read access
    });

    // Get top 100 coins by market cap
    console.log('📊 Fetching top 100 coins...');
    const topCoins = await getTopCoins();
    console.log(`✅ Found ${topCoins.length} coins to process`);

    // Track progress
    let processed = 0;
    let successful = 0;
    let failed = 0;

    // Process coins in smaller batches to respect rate limits
    const batchSize = 3; // Very conservative for initial backfill
    
    for (let i = 0; i < topCoins.length; i += batchSize) {
      const batch = topCoins.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(topCoins.length / batchSize)}`);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (coin) => {
        try {
          console.log(`  📈 Processing ${coin.symbol} (${coin.name})...`);
          await backfillCoinData(coin, containerClient);
          console.log(`  ✅ ${coin.symbol} completed successfully`);
          return { success: true, coin: coin.symbol };
        } catch (error) {
          console.error(`  ❌ ${coin.symbol} failed:`, error.message);
          return { success: false, coin: coin.symbol, error: error.message };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      // Update counters
      batchResults.forEach((result) => {
        processed++;
        if (result.status === 'fulfilled' && result.value.success) {
          successful++;
        } else {
          failed++;
        }
      });

      console.log(`📊 Progress: ${processed}/${topCoins.length} (${successful} successful, ${failed} failed)`);

      // Wait between batches to respect rate limits (60 calls/minute = 1 call per second)
      if (i + batchSize < topCoins.length) {
        console.log('⏳ Waiting 20 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 20000));
      }
    }

    console.log('\n🎉 Historical data backfill completed!');
    console.log(`📊 Final stats: ${successful} successful, ${failed} failed out of ${topCoins.length} total`);
    
    // Log failed coins for retry
    if (failed > 0) {
      console.log('\n❌ Failed coins may need manual retry or have insufficient historical data');
    }

  } catch (error) {
    console.error('💥 Fatal error in backfill process:', error);
    throw error;
  }
}

/**
 * Get top 100 coins by market capitalization
 */
async function getTopCoins(): Promise<CoinMetadata[]> {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      },
      timeout: 30000
    });

    return response.data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      lastUpdated: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to fetch top coins:', error);
    throw new Error(`Failed to fetch top coins: ${error.message}`);
  }
}

/**
 * Backfill complete historical data for a specific coin
 */
async function backfillCoinData(coin: CoinMetadata, containerClient: any): Promise<void> {
  const fileName = `${coin.symbol.toLowerCase()}.json`;
  const blobClient = containerClient.getBlockBlobClient(fileName);

  try {
    // Check if file already exists
    const exists = await blobClient.exists();
    if (exists) {
      console.log(`    ⚠️  ${coin.symbol} already exists, skipping...`);
      return;
    }

    // Fetch complete historical data (from inception to now)
    console.log(`    🔍 Fetching complete history for ${coin.symbol}...`);
    const historicalData = await fetchCompleteHistoricalData(coin.id);
    
    if (historicalData.length === 0) {
      throw new Error('No historical data available');
    }

    console.log(`    📊 Retrieved ${historicalData.length} data points`);

    // Validate data
    const validationResult = validateHistoricalData(historicalData);
    if (!validationResult.isValid) {
      console.warn(`    ⚠️  Validation warnings for ${coin.symbol}:`, validationResult.warnings);
      if (validationResult.errors.length > 0) {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }
    }

    // Clean data
    const cleanedData = cleanHistoricalData(historicalData);
    console.log(`    🧹 Cleaned data: ${cleanedData.length} points (${historicalData.length - cleanedData.length} removed)`);

    // Prepare final JSON structure
    const finalData = {
      symbol: coin.symbol,
      name: coin.name,
      coinGeckoId: coin.id,
      lastUpdated: new Date().toISOString(),
      dataPoints: cleanedData.length,
      earliestDate: cleanedData.length > 0 ? cleanedData[0].date : null,
      latestDate: cleanedData.length > 0 ? cleanedData[cleanedData.length - 1].date : null,
      data: cleanedData
    };

    // Upload to blob storage
    const content = JSON.stringify(finalData, null, 2);
    const uploadOptions = {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=3600' // Cache for 1 hour
      }
    };

    await blobClient.upload(content, Buffer.byteLength(content), uploadOptions);
    
    const fileSizeKB = Math.round(Buffer.byteLength(content) / 1024 * 100) / 100;
    console.log(`    💾 Uploaded ${coin.symbol}.json (${fileSizeKB} KB)`);

  } catch (error) {
    console.error(`    ❌ Error processing ${coin.symbol}:`, error.message);
    throw error;
  }
}

/**
 * Fetch complete historical data from CoinGecko API
 */
async function fetchCompleteHistoricalData(coinId: string): Promise<HistoricalDataPoint[]> {
  try {
    // Fetch maximum available historical data (all time)
    const response = await axios.get<CoinGeckoHistoricalResponse>(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days: 'max', // Get maximum available history
          interval: 'daily' // Daily intervals for historical data
        },
        timeout: 60000 // Longer timeout for large datasets
      }
    );

    // Validate response format
    const validationResult = validateCoinGeckoResponse(response.data);
    if (!validationResult.isValid) {
      throw new Error(`Invalid CoinGecko response: ${validationResult.errors.join(', ')}`);
    }

    const { prices, market_caps, total_volumes } = response.data;

    // Convert to our historical data format
    const historicalData: HistoricalDataPoint[] = [];

    // Take every ~30th data point to get roughly monthly data
    // This reduces file size while maintaining historical accuracy
    const monthlyInterval = Math.max(1, Math.floor(prices.length / (prices.length / 30)));

    for (let i = 0; i < prices.length; i += monthlyInterval) {
      const timestamp = prices[i][0];
      const date = new Date(timestamp);

      historicalData.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        price: prices[i][1] || 0,
        marketCap: market_caps[i] ? market_caps[i][1] : 0,
        volume24h: total_volumes[i] ? total_volumes[i][1] : 0
      });
    }

    return historicalData;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Coin not found on CoinGecko');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded - please retry later');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - data set too large');
    }
    
    throw new Error(`API request failed: ${error.message}`);
  }
}

/**
 * CLI runner for local execution
 */
if (require.main === module) {
  // Load environment variables from .env file if available
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available, ignore
  }

  backfillHistoricalData()
    .then(() => {
      console.log('✅ Backfill completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Backfill failed:', error);
      process.exit(1);
    });
}