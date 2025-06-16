import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin, of, catchError } from 'rxjs';
import { Coin, Portfolio, RebalanceResult, Trade, Allocation } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(private http: HttpClient) {}

  getTopCoins(limit: number = 15, exclude: string[] = []): Observable<{data: Coin[], timestamp: string, cached: boolean}> {
    const cacheKey = `top-coins-${limit}-${exclude.join(',')}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return of({
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true
      });
    }

    const params = new HttpParams()
      .set('vs_currency', 'usd')
      .set('order', 'market_cap_desc')
      .set('per_page', (limit + exclude.length + 10).toString()) // Get extra to account for exclusions
      .set('page', '1')
      .set('sparkline', 'false');

    return this.http.get<any[]>(`${this.coinGeckoBaseUrl}/coins/markets`, { params })
      .pipe(
        map(coins => {
          const excludeSet = new Set(exclude.map(coin => coin.toUpperCase()));
          const filteredCoins = coins
            .filter(coin => !excludeSet.has(coin.symbol.toUpperCase()))
            .slice(0, limit)
            .map(coin => ({
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              price: coin.current_price,
              marketCap: coin.market_cap,
              rank: coin.market_cap_rank,
              change24h: coin.price_change_percentage_24h || 0,
              volume24h: coin.total_volume || 0
            }));
          
          this.setCache(cacheKey, filteredCoins);
          
          return {
            data: filteredCoins,
            timestamp: new Date().toISOString(),
            cached: false
          };
        }),
        catchError(error => {
          // Error: Failed to fetch top coins
          throw error;
        })
      );
  }

  getCoinPrices(symbols: string[]): Observable<{data: Record<string, {price: number, timestamp: string}>}> {
    const cacheKey = `prices-${symbols.join(',')}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return of({ data: cachedData });
    }

    const params = new HttpParams()
      .set('ids', symbols.map(s => this.symbolToId(s)).join(','))
      .set('vs_currencies', 'usd');

    return this.http.get<Record<string, {usd: number}>>(`${this.coinGeckoBaseUrl}/simple/price`, { params })
      .pipe(
        map(prices => {
          const result: Record<string, {price: number, timestamp: string}> = {};
          const timestamp = new Date().toISOString();
          
          symbols.forEach(symbol => {
            const id = this.symbolToId(symbol);
            if (prices[id]) {
              result[symbol.toUpperCase()] = {
                price: prices[id].usd,
                timestamp
              };
            }
          });
          
          this.setCache(cacheKey, result);
          return { data: result };
        }),
        catchError(error => {
          // Error: Failed to fetch coin prices
          throw error;
        })
      );
  }

  searchCoins(query: string, limit: number = 10): Observable<{results: Array<{symbol: string, name: string, logo?: string}>}> {
    const params = new HttpParams().set('query', query);
    
    return this.http.get<{coins: Array<{id: string, symbol: string, name: string, thumb: string}>}>(`${this.coinGeckoBaseUrl}/search`, { params })
      .pipe(
        map(response => ({
          results: response.coins.slice(0, limit).map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            logo: coin.thumb
          }))
        })),
        catchError(error => {
          // Error: Failed to search coins
          throw error;
        })
      );
  }

  calculateRebalancing(portfolio: Portfolio, excludedCoins: string[] = [], topN: number = 15): Observable<RebalanceResult> {
    return this.getTopCoins(topN, excludedCoins).pipe(
      map(response => {
        const topCoins = response.data;
        const totalMarketCap = topCoins.reduce((sum, coin) => sum + coin.marketCap, 0);
        
        // Calculate target allocations based on market cap
        const targetAllocations: Allocation[] = topCoins.map(coin => {
          const percentage = (coin.marketCap / totalMarketCap) * 100;
          return {
            symbol: coin.symbol,
            percentage,
            targetPercentage: percentage, // Backward compatibility
            price: coin.price,
            targetValue: 0, // Will be calculated below
            targetAmount: 0 // Will be calculated below
          };
        });
        
        // Calculate current portfolio value
        const currentHoldings = portfolio.holdings.map(holding => {
          const coin = topCoins.find(c => c.symbol === holding.symbol);
          return {
            ...holding,
            value: coin ? holding.amount * coin.price : 0,
            price: coin?.price || 0
          };
        });
        
        const currentPortfolioValue = currentHoldings.reduce((sum, h) => sum + h.value, 0);
        const totalValue = currentPortfolioValue + portfolio.cashBalance;
        
        // Calculate target values and amounts
        targetAllocations.forEach(allocation => {
          allocation.targetValue = (allocation.percentage / 100) * totalValue;
          allocation.targetAmount = allocation.targetValue / allocation.price;
        });
        
        // Calculate trades
        const trades: Trade[] = [];
        
        targetAllocations.forEach(target => {
          const currentHolding = currentHoldings.find(h => h.symbol === target.symbol);
          const currentAmount = currentHolding?.amount || 0;
          const difference = target.targetAmount - currentAmount;
          
          if (Math.abs(difference * target.price) > 1) { // Only trade if difference > $1
            const tradeValue = Math.abs(difference * target.price);
            trades.push({
              symbol: target.symbol,
              action: difference > 0 ? 'BUY' : 'SELL',
              amount: Math.abs(difference),
              value: tradeValue,
              usdValue: tradeValue, // Backward compatibility
              price: target.price
            });
          }
        });
        
        // Calculate summary
        const totalBuys = trades.filter(t => t.action === 'BUY').reduce((sum, t) => sum + t.value, 0);
        const totalSells = trades.filter(t => t.action === 'SELL').reduce((sum, t) => sum + t.value, 0);
        const estimatedFees = (totalBuys + totalSells) * 0.005; // 0.5% fee estimate

        return {
          targetAllocations,
          trades,
          totalValue,
          currentValue: totalValue, // Backward compatibility
          summary: {
            totalBuys,
            totalSells,
            estimatedFees
          },
          metadata: {
            timestamp: new Date().toISOString(),
            topN,
            excludedCoins
          }
        };
      })
    );
  }

  checkHealth(): Observable<{status: string, version: string, timestamp: string}> {
    return of({
      status: 'healthy',
      version: '2.0.0-client-side',
      timestamp: new Date().toISOString()
    });
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private symbolToId(symbol: string): string {
    // Simple mapping for common cryptocurrencies
    const symbolMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'USDC': 'usd-coin',
      'XRP': 'ripple',
      'DOGE': 'dogecoin',
      'TON': 'the-open-network',
      'ADA': 'cardano'
    };
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }
}