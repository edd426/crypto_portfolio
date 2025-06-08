import { app, InvocationContext, Timer } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import axios from "axios";

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
 * Azure Function to update historical cryptocurrency data monthly
 * Triggered on the 1st of each month at midnight UTC
 */
export async function updateHistoricalData(myTimer: Timer, context: InvocationContext): Promise<void> {
  context.log('Historical data update function triggered at:', new Date().toISOString());

  try {
    // Initialize Azure Blob Storage client
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is required');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('historical-data');

    // Get top 100 coins by market cap
    const topCoins = await getTopCoins();
    context.log(`Fetching data for ${topCoins.length} coins`);

    // Process coins in batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < topCoins.length; i += batchSize) {
      const batch = topCoins.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (coin) => {
        try {
          await updateCoinData(coin, containerClient, context);
          // Small delay between API calls to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          context.log(`Error updating ${coin.symbol}:`, error);
        }
      }));

      // Longer delay between batches
      if (i + batchSize < topCoins.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    context.log('Historical data update completed successfully');
  } catch (error) {
    context.log('Error in historical data update:', error);
    throw error;
  }
}

/**
 * Get top 100 coins by market capitalization
 */
async function getTopCoins(): Promise<CoinMetadata[]> {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false
    }
  });

  return response.data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    lastUpdated: new Date().toISOString()
  }));
}

/**
 * Update historical data for a specific coin
 */
async function updateCoinData(
  coin: CoinMetadata, 
  containerClient: any, 
  context: InvocationContext
): Promise<void> {
  try {
    const fileName = `${coin.symbol.toLowerCase()}.json`;
    const blobClient = containerClient.getBlockBlobClient(fileName);

    // Try to get existing data
    let existingData: HistoricalDataPoint[] = [];
    let lastDataDate: Date | null = null;

    try {
      const downloadResponse = await blobClient.download();
      if (downloadResponse.readableStreamBody) {
        const existingContent = await streamToBuffer(downloadResponse.readableStreamBody);
        const existingJson = JSON.parse(existingContent.toString());
        existingData = existingJson.data || [];
        
        if (existingData.length > 0) {
          lastDataDate = new Date(existingData[existingData.length - 1].date);
        }
      }
    } catch (error) {
      // File doesn't exist yet, start from inception
      context.log(`No existing data for ${coin.symbol}, fetching complete history`);
    }

    // Determine date range for fetching
    const endDate = new Date();
    let startDate: Date;

    if (lastDataDate) {
      // Fetch only new data since last update
      startDate = new Date(lastDataDate);
      startDate.setDate(startDate.getDate() + 1); // Start from day after last data
    } else {
      // Fetch complete history from coin inception
      startDate = new Date('2010-01-01'); // Bitcoin's approximate start
    }

    // Only fetch if we need new data
    if (startDate >= endDate) {
      context.log(`${coin.symbol} is up to date`);
      return;
    }

    // Fetch historical data from CoinGecko
    const newData = await fetchHistoricalData(coin.id, startDate, endDate);
    
    if (newData.length === 0) {
      context.log(`No new data available for ${coin.symbol}`);
      return;
    }

    // Merge with existing data and deduplicate
    const allData = [...existingData, ...newData];
    const deduplicatedData = deduplicateByDate(allData);

    // Sort by date
    deduplicatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare final JSON structure
    const finalData = {
      symbol: coin.symbol,
      name: coin.name,
      lastUpdated: new Date().toISOString(),
      dataPoints: deduplicatedData.length,
      data: deduplicatedData
    };

    // Upload to blob storage
    const content = JSON.stringify(finalData, null, 2);
    await blobClient.upload(content, Buffer.byteLength(content), {
      blobHTTPHeaders: {
        blobContentType: 'application/json'
      }
    });

    context.log(`Successfully updated ${coin.symbol} with ${newData.length} new data points`);
  } catch (error) {
    context.log(`Error updating ${coin.symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch historical data from CoinGecko API
 */
async function fetchHistoricalData(
  coinId: string, 
  startDate: Date, 
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  const startTimestamp = Math.floor(startDate.getTime() / 1000);
  const endTimestamp = Math.floor(endDate.getTime() / 1000);

  const response = await axios.get<CoinGeckoHistoricalResponse>(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range`,
    {
      params: {
        vs_currency: 'usd',
        from: startTimestamp,
        to: endTimestamp
      },
      timeout: 30000
    }
  );

  const { prices, market_caps, total_volumes } = response.data;

  // Convert to monthly data points (first day of each month)
  const monthlyData: HistoricalDataPoint[] = [];
  const processedMonths = new Set<string>();

  for (let i = 0; i < prices.length; i++) {
    const timestamp = prices[i][0];
    const date = new Date(timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Only keep first data point of each month
    if (!processedMonths.has(monthKey)) {
      processedMonths.add(monthKey);

      monthlyData.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        price: prices[i][1],
        marketCap: market_caps[i] ? market_caps[i][1] : 0,
        volume24h: total_volumes[i] ? total_volumes[i][1] : 0
      });
    }
  }

  return monthlyData;
}

/**
 * Remove duplicate data points by date
 */
function deduplicateByDate(data: HistoricalDataPoint[]): HistoricalDataPoint[] {
  const seen = new Set<string>();
  return data.filter(point => {
    if (seen.has(point.date)) {
      return false;
    }
    seen.add(point.date);
    return true;
  });
}

/**
 * Convert stream to buffer
 */
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

// Register the function
app.timer('updateHistoricalData', {
  schedule: '0 0 1 * *', // 1st day of each month at midnight UTC
  handler: updateHistoricalData
});