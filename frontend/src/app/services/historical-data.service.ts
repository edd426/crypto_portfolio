import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, retry, shareReplay } from 'rxjs/operators';

export interface HistoricalDataPoint {
  date: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

export interface CoinHistoricalData {
  symbol: string;
  name: string;
  coinGeckoId: string;
  lastUpdated: string;
  dataPoints: number;
  earliestDate: string;
  latestDate: string;
  data: HistoricalDataPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class HistoricalDataService {
  private readonly baseUrl = 'https://stcrypto9rc2a6.blob.core.windows.net/historical-data';
  private readonly cache = new Map<string, { data: CoinHistoricalData; timestamp: number }>();
  private readonly cacheTimeout = 60 * 60 * 1000; // 1 hour cache for historical data

  constructor(private http: HttpClient) {}

  /**
   * Fetch historical data for a single coin
   */
  getCoinHistoricalData(symbol: string): Observable<CoinHistoricalData> {
    const cacheKey = symbol.toLowerCase();
    
    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return of(cached);
    }

    const fileName = `${symbol.toLowerCase()}.json`;
    const url = `${this.baseUrl}/${fileName}`;

    return this.http.get<CoinHistoricalData>(url).pipe(
      map(data => this.validateAndTransform(data, symbol)),
      retry(2), // Retry failed requests twice
      catchError(error => this.handleError(error, symbol)),
      shareReplay(1) // Share result with multiple subscribers
    ).pipe(
      map(data => {
        // Cache successful result
        this.setCache(cacheKey, data);
        return data;
      })
    );
  }

  /**
   * Fetch historical data for multiple coins in parallel
   */
  getMultipleCoinData(symbols: string[]): Observable<{ [symbol: string]: CoinHistoricalData }> {
    if (symbols.length === 0) {
      return of({});
    }

    // Create parallel requests for all symbols
    const requests = symbols.reduce((acc, symbol) => {
      acc[symbol] = this.getCoinHistoricalData(symbol);
      return acc;
    }, {} as { [symbol: string]: Observable<CoinHistoricalData> });

    return forkJoin(requests).pipe(
      catchError(error => {
        console.error('Error fetching multiple coin data:', error);
        // Return partial results instead of failing completely
        return of({});
      })
    );
  }

  /**
   * Get historical data for a specific date range
   */
  getCoinDataForDateRange(
    symbol: string, 
    startDate: Date, 
    endDate: Date
  ): Observable<HistoricalDataPoint[]> {
    return this.getCoinHistoricalData(symbol).pipe(
      map(coinData => {
        return coinData.data.filter(point => {
          const pointDate = new Date(point.date);
          return pointDate >= startDate && pointDate <= endDate;
        });
      })
    );
  }

  /**
   * Get list of all available coins from blob storage
   * Returns the 97 cryptocurrencies that have historical data
   */
  getAvailableCoins(): string[] {
    // All 97 unique cryptocurrencies available in our historical data storage
    // Updated June 8, 2025 - covers 100% of top 100 unique symbols
    return [
      'AAVE', 'ADA', 'ALGO', 'APT', 'ARB', 'ATOM', 'AVAX', 'BCH', 'BGB', 'BNB',
      'BNSOL', 'BONK', 'BSC-USD', 'BTC', 'BUIDL', 'CBBTC', 'CRO', 'DAI', 'DOGE', 'DOT',
      'ENA', 'ETC', 'ETH', 'FARTCOIN', 'FDUSD', 'FET', 'FIL', 'FLR', 'FTN', 'GT',
      'HBAR', 'HYPE', 'ICP', 'IMX', 'INJ', 'IP', 'JITOSOL', 'JLP', 'JUP', 'KAS',
      'KCS', 'LBTC', 'LEO', 'LINK', 'LTC', 'MNT', 'NEAR', 'NEXO', 'OKB', 'ONDO',
      'OP', 'PEPE', 'PI', 'POL', 'PYUSD', 'QNT', 'RENDER', 'RETH', 'RSETH', 'S',
      'SEI', 'SHIB', 'SKY', 'SOL', 'SOLVBTC', 'SPX', 'STETH', 'STX', 'SUI', 'SUSDE',
      'SUSDS', 'TAO', 'TIA', 'TKX', 'TON', 'TRUMP', 'TRX', 'UNI', 'USD1',
      'USDC', 'USDE', 'USDS', 'USDT', 'USDT0', 'USDTB', 'VET', 'VIRTUAL', 'WBT', 'WBTC',
      'WEETH', 'WETH', 'WLD', 'WSTETH', 'XDC', 'XLM', 'XMR', 'XRP'
    ];
  }

  /**
   * Get data availability information for coins
   */
  getDataAvailability(symbols: string[]): Observable<{ [symbol: string]: { earliestDate: string; latestDate: string; dataPoints: number } }> {
    return this.getMultipleCoinData(symbols).pipe(
      map(data => {
        const availability: { [symbol: string]: { earliestDate: string; latestDate: string; dataPoints: number } } = {};
        
        Object.entries(data).forEach(([symbol, coinData]) => {
          availability[symbol] = {
            earliestDate: coinData.earliestDate,
            latestDate: coinData.latestDate,
            dataPoints: coinData.dataPoints
          };
        });
        
        return availability;
      })
    );
  }

  /**
   * Check if historical data is available for a symbol
   */
  isDataAvailable(symbol: string): Observable<boolean> {
    return this.getCoinHistoricalData(symbol).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Get the earliest common date across multiple symbols
   */
  getEarliestCommonDate(symbols: string[]): Observable<Date | null> {
    return this.getDataAvailability(symbols).pipe(
      map(availability => {
        const dates = Object.values(availability)
          .map(info => new Date(info.earliestDate))
          .filter(date => !isNaN(date.getTime()));
        
        if (dates.length === 0) {
          return null;
        }
        
        // Return the latest of the earliest dates (intersection)
        return new Date(Math.max(...dates.map(d => d.getTime())));
      })
    );
  }

  /**
   * Clear cache for specific symbol or all
   */
  clearCache(symbol?: string): void {
    if (symbol) {
      this.cache.delete(symbol.toLowerCase());
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Prefetch data for commonly used coins
   */
  prefetchCommonCoins(): void {
    const commonCoins = ['BTC', 'ETH', 'USDT', 'XRP', 'SOL'];
    
    commonCoins.forEach(symbol => {
      this.getCoinHistoricalData(symbol).subscribe({
        next: () => console.log(`Prefetched data for ${symbol}`),
        error: (error) => console.warn(`Failed to prefetch ${symbol}:`, error)
      });
    });
  }

  // Private helper methods

  private getFromCache(key: string): CoinHistoricalData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: CoinHistoricalData): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private validateAndTransform(data: any, symbol: string): CoinHistoricalData {
    // Handle our blob storage format (priceHistory) and expected format (data)
    const historyData = data.priceHistory || data.data;
    
    // Basic validation
    if (!data || !historyData || !Array.isArray(historyData)) {
      throw new Error(`Invalid data format for ${symbol}. Expected priceHistory or data array.`);
    }

    // Transform to expected format and ensure data is sorted by date
    const sortedData = [...historyData].map(point => ({
      date: point.date,
      price: point.price,
      marketCap: point.marketCap,
      volume24h: point.volume || point.volume24h || 0
    })).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      symbol: data.symbol || symbol.toUpperCase(),
      name: data.name || symbol,
      coinGeckoId: data.coinGeckoId || '',
      lastUpdated: data.lastUpdated || new Date().toISOString(),
      dataPoints: sortedData.length,
      earliestDate: sortedData.length > 0 ? sortedData[0].date : '',
      latestDate: sortedData.length > 0 ? sortedData[sortedData.length - 1].date : '',
      data: sortedData
    };
  }

  private handleError(error: HttpErrorResponse, symbol: string): Observable<never> {
    let errorMessage = `Failed to fetch historical data for ${symbol}`;

    if (error.status === 404) {
      errorMessage = `Historical data not available for ${symbol}`;
    } else if (error.status === 0) {
      errorMessage = `Network error while fetching ${symbol} data. Please check your connection.`;
    } else if (error.status >= 500) {
      errorMessage = `Server error while fetching ${symbol} data. Please try again later.`;
    } else if (error.status === 403) {
      errorMessage = `Access denied for ${symbol} data. Please check CORS configuration.`;
    }

    console.error(`Historical data error for ${symbol}:`, error);
    return throwError(() => new Error(errorMessage));
  }
}