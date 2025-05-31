import axios from 'axios';
import NodeCache from 'node-cache';
import { Coin } from '../models/types';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export class MarketDataService {
  private baseURL = 'https://api.coingecko.com/api/v3';
  
  async getTopCoins(limit: number = 15, exclude: string[] = []): Promise<Coin[]> {
    const cacheKey = `top-coins-${limit}-${exclude.join(',')}`;
    const cached = cache.get<Coin[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseURL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit + exclude.length,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      const coins: Coin[] = response.data
        .filter((coin: any) => !exclude.includes(coin.symbol.toUpperCase()))
        .slice(0, limit)
        .map((coin: any, index: number) => ({
          rank: index + 1,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          marketCap: coin.market_cap,
          change24h: coin.price_change_percentage_24h || 0,
          volume24h: coin.total_volume
        }));

      cache.set(cacheKey, coins);
      return coins;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  async getCoinPrices(symbols: string[]): Promise<Record<string, { price: number; timestamp: string }>> {
    const cacheKey = `prices-${symbols.sort().join(',')}`;
    const cached = cache.get<Record<string, { price: number; timestamp: string }>>(cacheKey);
    
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

      cache.set(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error('Error fetching coin prices:', error);
      throw new Error('Failed to fetch coin prices');
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
    } catch (error) {
      console.error('Error searching coins:', error);
      throw new Error('Failed to search coins');
    }
  }
}