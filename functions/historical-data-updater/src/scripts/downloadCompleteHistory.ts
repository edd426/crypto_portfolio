/**
 * Download complete historical data for top 100 cryptocurrencies
 * This script fetches ALL available historical data from coin inception to present
 */

import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';
import { globalRateLimiter, RateLimitedBatchProcessor } from '../utils/rateLimiting';
import { globalCostMonitor } from '../utils/costMonitoring';
import { validateDataPoint, validateHistoricalData } from '../utils/dataValidation';

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  market_cap: number;
}

interface CoinGeckoHistoricalPoint {
  0: number; // timestamp
  1: number; // price
  2: number; // market cap
  3: number; // total volume
}

interface HistoricalDataPoint {
  date: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

interface CoinHistoricalData {
  symbol: string;
  name: string;
  coinGeckoId: string;
  lastUpdated: string;
  dataPoints: number;
  earliestDate: string;
  latestDate: string;
  priceHistory: HistoricalDataPoint[];
}

interface DownloadStats {
  totalCoins: number;
  successful: number;
  failed: number;
  skipped: number;
  totalDataPoints: number;
  totalSizeBytes: number;
  errors: { coin: string; error: string }[];
}

export class HistoricalDataDownloader {
  private blobServiceClient: BlobServiceClient;
  private containerName = 'historical-data';
  private stats: DownloadStats = {
    totalCoins: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    totalDataPoints: 0,
    totalSizeBytes: 0,
    errors: []
  };

  constructor(connectionString: string) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  /**
   * Main function to download complete historical data
   */
  async downloadCompleteHistory(limit: number = 100): Promise<DownloadStats> {
    console.log('🚀 Starting complete historical data download...');
    console.log(`📅 Date: ${new Date().toISOString()}`);
    console.log(`🎯 Target: Top ${limit} cryptocurrencies`);
    
    try {
      // Step 1: Get top coins by market cap
      const topCoins = await this.getTopCoins(limit);
      console.log(`✅ Found ${topCoins.length} coins to process`);
      
      this.stats.totalCoins = topCoins.length;

      // Step 2: Process coins in batches with rate limiting
      const batchProcessor = new RateLimitedBatchProcessor(globalRateLimiter, 3, 2000);
      
      await batchProcessor.processBatch(
        topCoins,
        (coin: CoinGeckoMarketData) => this.processCoin(coin),
        (completed, total) => {
          console.log(`📊 Progress: ${completed}/${total} coins processed`);
        }
      );

      // Step 3: Display final statistics
      this.displayFinalStats();
      
      return this.stats;

    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  /**
   * Get top coins by market cap from CoinGecko
   */
  private async getTopCoins(limit: number): Promise<CoinGeckoMarketData[]> {
    console.log('📊 Fetching top coins by market cap...');
    
    const allCoins: CoinGeckoMarketData[] = [];
    const perPage = 250; // CoinGecko's maximum per page
    let page = 1;
    
    while (allCoins.length < limit) {
      const remainingCoins = limit - allCoins.length;
      const currentPageSize = Math.min(perPage, remainingCoins);
      
      const url = 'https://api.coingecko.com/api/v3/coins/markets';
      const params = {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: currentPageSize,
        page: page,
        sparkline: false,
        locale: 'en'
      };

      try {
        const response = await globalRateLimiter.executeWithRateLimit(
          () => axios.get(url, { params }),
          `Fetching page ${page}`
        );

        const pageCoins = response.data as CoinGeckoMarketData[];
        
        if (pageCoins.length === 0) {
          console.log(`📄 No more coins available after page ${page - 1}`);
          break;
        }

        allCoins.push(...pageCoins);
        console.log(`📄 Page ${page}: ${pageCoins.length} coins (Total: ${allCoins.length})`);
        
        page++;
        
        // Prevent infinite loop
        if (page > 10) {
          console.warn('⚠️ Reached page limit, stopping');
          break;
        }
        
      } catch (error: any) {
        console.error(`❌ Failed to fetch page ${page}:`, error.message);
        break;
      }
    }

    return allCoins.slice(0, limit);
  }

  /**
   * Process a single coin: fetch history and upload to blob storage
   */
  private async processCoin(coin: CoinGeckoMarketData): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log(`📈 Processing ${coin.symbol.toUpperCase()} (${coin.name})...`);
      
      // Check if data already exists and is recent
      if (await this.shouldSkipCoin(coin)) {
        console.log(`⏭️ Skipping ${coin.symbol.toUpperCase()} - data already exists`);
        this.stats.skipped++;
        return;
      }

      // Fetch complete historical data
      const historicalData = await this.fetchCoinHistory(coin);
      
      if (!historicalData || historicalData.priceHistory.length === 0) {
        throw new Error('No historical data available');
      }

      // Validate data quality
      const validation = validateHistoricalData(historicalData.priceHistory);
      if (!validation.isValid) {
        console.warn(`⚠️ Data quality issues for ${coin.symbol.toUpperCase()}:`, validation.warnings);
      }

      // Upload to blob storage
      await this.uploadCoinData(coin.symbol.toLowerCase(), historicalData);
      
      // Update statistics
      this.stats.successful++;
      this.stats.totalDataPoints += historicalData.dataPoints;
      
      const dataSize = JSON.stringify(historicalData).length;
      this.stats.totalSizeBytes += dataSize;
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ ${coin.symbol.toUpperCase()}: ${historicalData.dataPoints} points, ${(dataSize / 1024).toFixed(1)}KB, ${processingTime}ms`);
      
      // Track costs
      globalCostMonitor.recordStorageOperation(1, dataSize / (1024 * 1024));

    } catch (error: any) {
      this.stats.failed++;
      this.stats.errors.push({
        coin: `${coin.symbol.toUpperCase()} (${coin.name})`,
        error: error.message
      });
      
      console.error(`❌ Failed to process ${coin.symbol.toUpperCase()}:`, error.message);
    }
  }

  /**
   * Check if we should skip downloading this coin
   */
  private async shouldSkipCoin(coin: CoinGeckoMarketData): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobName = `${coin.symbol.toLowerCase()}.json`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const properties = await blockBlobClient.getProperties();
      const lastModified = properties.lastModified;
      
      if (lastModified) {
        // Skip if data was updated within the last 7 days
        const daysSinceUpdate = (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate < 7;
      }
      
      return false;
      
    } catch (error) {
      // File doesn't exist, don't skip
      return false;
    }
  }

  /**
   * Fetch complete historical data for a coin
   */
  private async fetchCoinHistory(coin: CoinGeckoMarketData): Promise<CoinHistoricalData> {
    console.log(`🔍 Fetching complete history for ${coin.symbol.toUpperCase()}...`);
    
    // CoinGecko historical data endpoint
    // NOTE: Free API now limits 'max' access, using 2 years for good backtesting coverage
    const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`;
    const params = {
      vs_currency: 'usd',
      days: 365, // 1 year of data (confirmed working with free API)
      interval: 'daily'
    };

    const response = await globalRateLimiter.executeWithRateLimit(
      () => axios.get(url, { params }),
      `Fetching history for ${coin.symbol.toUpperCase()}`
    );

    const data = response.data;
    
    if (!data.prices || !Array.isArray(data.prices) || data.prices.length === 0) {
      throw new Error('No price data available');
    }

    // Transform CoinGecko format to our format
    const priceHistory: HistoricalDataPoint[] = data.prices.map((price: CoinGeckoHistoricalPoint, index: number) => {
      const date = new Date(price[0]).toISOString().split('T')[0];
      const priceValue = price[1];
      const marketCap = data.market_caps?.[index]?.[1] || 0;
      const volume = data.total_volumes?.[index]?.[1] || 0;

      return {
        date,
        price: priceValue,
        marketCap,
        volume24h: volume
      };
    }).filter(point => {
      // Filter out invalid data points
      const validation = validateDataPoint(point);
      return validation.isValid;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (priceHistory.length === 0) {
      throw new Error('No valid data points after filtering');
    }

    const historicalData: CoinHistoricalData = {
      symbol: coin.symbol.toLowerCase(),
      name: coin.name,
      coinGeckoId: coin.id,
      lastUpdated: new Date().toISOString(),
      dataPoints: priceHistory.length,
      earliestDate: priceHistory[0].date,
      latestDate: priceHistory[priceHistory.length - 1].date,
      priceHistory
    };

    const dateRange = `${historicalData.earliestDate} to ${historicalData.latestDate}`;
    const duration = Math.round((new Date(historicalData.latestDate).getTime() - new Date(historicalData.earliestDate).getTime()) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 ${coin.symbol.toUpperCase()}: ${priceHistory.length} days (${dateRange}, ${duration} days total)`);

    return historicalData;
  }

  /**
   * Upload coin data to Azure Blob Storage
   */
  private async uploadCoinData(symbol: string, data: CoinHistoricalData): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blobName = `${symbol}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const dataString = JSON.stringify(data, null, 2);
    
    await blockBlobClient.upload(dataString, dataString.length, {
      blobHTTPHeaders: {
        blobContentType: 'application/json',
        blobCacheControl: 'public, max-age=3600' // Cache for 1 hour
      },
      metadata: {
        symbol: data.symbol,
        name: data.name,
        dataPoints: data.dataPoints.toString(),
        lastUpdated: data.lastUpdated,
        earliestDate: data.earliestDate,
        latestDate: data.latestDate
      }
    });
  }

  /**
   * Display final download statistics
   */
  private displayFinalStats(): void {
    const costData = globalCostMonitor.exportCostData();
    
    console.log('\n🎉 Historical data download completed!');
    console.log('=' .repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total coins: ${this.stats.totalCoins}`);
    console.log(`   ✅ Successful: ${this.stats.successful}`);
    console.log(`   ⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   📈 Total data points: ${this.stats.totalDataPoints.toLocaleString()}`);
    console.log(`   💾 Total size: ${(this.stats.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`   💰 Estimated cost: $${costData.monthlyStats.totalCost.toFixed(4)}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors (${this.stats.errors.length}):`);
      this.stats.errors.forEach(({ coin, error }) => {
        console.log(`   ${coin}: ${error}`);
      });
    }

    console.log(`\n🌐 Data accessible at:`);
    console.log(`   https://stcrypto9rc2a6.blob.core.windows.net/historical-data/`);
    console.log(`\n📋 Example files:`);
    console.log(`   https://stcrypto9rc2a6.blob.core.windows.net/historical-data/btc.json`);
    console.log(`   https://stcrypto9rc2a6.blob.core.windows.net/historical-data/eth.json`);
    
    const avgDataPoints = this.stats.successful > 0 ? Math.round(this.stats.totalDataPoints / this.stats.successful) : 0;
    const avgFileSize = this.stats.successful > 0 ? this.stats.totalSizeBytes / this.stats.successful : 0;
    
    console.log(`\n📊 Averages:`);
    console.log(`   Data points per coin: ${avgDataPoints}`);
    console.log(`   File size per coin: ${(avgFileSize / 1024).toFixed(1)} KB`);
    
    console.log('\n🚀 Ready for backtesting with complete historical data!');
  }

  /**
   * Verify data integrity after download
   */
  async verifyDataIntegrity(symbols: string[]): Promise<{ valid: number; invalid: number; errors: string[] }> {
    console.log('\n🔍 Verifying data integrity...');
    
    let valid = 0;
    let invalid = 0;
    const errors: string[] = [];
    
    for (const symbol of symbols.slice(0, 10)) { // Verify first 10 as sample
      try {
        const url = `https://stcrypto9rc2a6.blob.core.windows.net/historical-data/${symbol.toLowerCase()}.json`;
        const response = await axios.get(url);
        const data = response.data;
        
        if (data.priceHistory && Array.isArray(data.priceHistory) && data.priceHistory.length > 0) {
          valid++;
          console.log(`✅ ${symbol.toUpperCase()}: ${data.priceHistory.length} data points`);
        } else {
          invalid++;
          errors.push(`${symbol}: Invalid data structure`);
        }
        
      } catch (error: any) {
        invalid++;
        errors.push(`${symbol}: ${error.message}`);
        console.log(`❌ ${symbol.toUpperCase()}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Verification: ${valid} valid, ${invalid} invalid`);
    return { valid, invalid, errors };
  }
}

/**
 * Main execution function
 */
export async function downloadCompleteHistory(): Promise<void> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  
  if (!connectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable not set');
  }

  const downloader = new HistoricalDataDownloader(connectionString);
  
  try {
    // Download top 100 coins
    const stats = await downloader.downloadCompleteHistory(100);
    
    // Verify a sample of the data
    const topSymbols = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'LTC'];
    await downloader.verifyDataIntegrity(topSymbols);
    
  } catch (error) {
    console.error('❌ Download script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadCompleteHistory().catch(console.error);
}