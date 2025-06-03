import axios from 'axios';
import NodeCache from 'node-cache';
import { Coin } from '../models/types';

export class MarketDataService {
  private baseURL = 'https://api.coingecko.com/api/v3';
  private cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
  
  async getTopCoins(limit: number = 15, exclude: string[] = []): Promise<Coin[]> {
    const cacheKey = `top-coins-${limit}-${exclude.join(',')}`;
    const cached = this.cache.get<Coin[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Fetch more coins to account for exclusions, but final result should respect the limit
      // If we want max 15 coins and exclude 2, we should get 13 coins (not 15)
      const fetchLimit = Math.max(limit + exclude.length, 50); // Fetch enough to filter
      
      const response = await axios.get(`${this.baseURL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: fetchLimit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      // Get the top `limit` coins by market cap, then exclude the specified coins
      const topLimitCoins = response.data.slice(0, limit);
      const coins: Coin[] = topLimitCoins
        .filter((coin: any) => !exclude.includes(coin.symbol.toUpperCase()))
        .map((coin: any, index: number) => ({
          rank: index + 1,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          marketCap: coin.market_cap,
          change24h: coin.price_change_percentage_24h || 0,
          volume24h: coin.total_volume
        }));

      this.cache.set(cacheKey, coins);
      return coins;
    } catch (error: any) {
      console.error('Error fetching top coins:', error);
      
      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const retryAfter = error.response.headers['retry-after'];
        
        switch (status) {
          case 429:
            const retryMessage = retryAfter 
              ? `API rate limit exceeded. Please try again in ${retryAfter} seconds.`
              : 'API rate limit exceeded. Please try again later.';
            throw new Error(retryMessage);
          case 500:
          case 502:
          case 503:
            throw new Error('API server error. Please try again later.');
          default:
            throw new Error(`API error (${status}). Please try again later.`);
        }
      } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to fetch market data. Please try again later.');
      }
    }
  }

  async getCoinPrices(symbols: string[]): Promise<Record<string, { price: number; timestamp: string }>> {
    const cacheKey = `prices-${symbols.sort().join(',')}`;
    const cached = this.cache.get<Record<string, { price: number; timestamp: string }>>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Convert symbols to CoinGecko IDs (simplified mapping)
      const symbolToId: Record<string, string> = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'SOL': 'solana',
        'TRX': 'tron',
        'DOT': 'polkadot',
        'MATIC': 'matic-network',
        'LTC': 'litecoin',
        'SHIB': 'shiba-inu',
        'AVAX': 'avalanche-2',
        'UNI': 'uniswap',
        'LINK': 'chainlink'
      };

      const ids = symbols.map(symbol => symbolToId[symbol] || symbol.toLowerCase()).join(',');
      
      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids,
          vs_currencies: 'usd'
        }
      });

      const timestamp = new Date().toISOString();
      const prices: Record<string, { price: number; timestamp: string }> = {};

      symbols.forEach(symbol => {
        const id = symbolToId[symbol] || symbol.toLowerCase();
        if (response.data[id]) {
          prices[symbol] = {
            price: response.data[id].usd,
            timestamp
          };
        }
      });

      this.cache.set(cacheKey, prices);
      return prices;
    } catch (error: any) {
      console.error('Error fetching coin prices:', error);
      
      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const retryAfter = error.response.headers['retry-after'];
        
        switch (status) {
          case 429:
            const retryMessage = retryAfter 
              ? `API rate limit exceeded. Please try again in ${retryAfter} seconds.`
              : 'API rate limit exceeded. Please try again later.';
            throw new Error(retryMessage);
          case 500:
          case 502:
          case 503:
            throw new Error('API server error. Please try again later.');
          default:
            throw new Error(`API error (${status}). Please try again later.`);
        }
      } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to fetch coin prices. Please try again later.');
      }
    }
  }

  async searchCoins(query: string, limit: number = 10): Promise<Array<{ symbol: string; name: string; logo?: string }>> {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { query }
      });

      return response.data.coins
        .slice(0, limit)
        .map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          logo: coin.thumb
        }));
    } catch (error: any) {
      console.error('Error searching coins:', error);
      
      // Handle specific error types
      if (error.response) {
        const status = error.response.status;
        const retryAfter = error.response.headers['retry-after'];
        
        switch (status) {
          case 429:
            const retryMessage = retryAfter 
              ? `API rate limit exceeded. Please try again in ${retryAfter} seconds.`
              : 'API rate limit exceeded. Please try again later.';
            throw new Error(retryMessage);
          case 500:
          case 502:
          case 503:
            throw new Error('API server error. Please try again later.');
          default:
            throw new Error(`API error (${status}). Please try again later.`);
        }
      } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to search coins. Please try again later.');
      }
    }
  }
}