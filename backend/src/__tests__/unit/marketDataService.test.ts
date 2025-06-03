import nock from 'nock';
import { MarketDataService } from '../../services/marketDataService';

describe('MarketDataService', () => {
  let marketDataService: MarketDataService;

  beforeEach(() => {
    // Create fresh service instance to avoid cache issues
    marketDataService = new MarketDataService();
    nock.cleanAll();
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe('getTopCoins', () => {
    it('should fetch top coins successfully', async () => {
      const mockResponse = [
        {
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        },
        {
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3000,
          market_cap: 400000000000,
          price_change_percentage_24h: -1.2,
          total_volume: 20000000000
        }
      ];

      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 15,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(200, mockResponse);

      const result = await marketDataService.getTopCoins(15);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        rank: 1,
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 50000,
        marketCap: 1000000000000,
        change24h: 2.5,
        volume24h: 50000000000
      });
      expect(result[1]).toEqual({
        rank: 2,
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3000,
        marketCap: 400000000000,
        change24h: -1.2,
        volume24h: 20000000000
      });
    });

    it('should exclude specified coins', async () => {
      const mockResponse = [
        {
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        },
        {
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3000,
          market_cap: 400000000000,
          price_change_percentage_24h: -1.2,
          total_volume: 20000000000
        },
        {
          symbol: 'doge',
          name: 'Dogecoin',
          current_price: 0.1,
          market_cap: 10000000000,
          price_change_percentage_24h: 5.0,
          total_volume: 1000000000
        }
      ];

      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 16, // 15 + 1 excluded
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(200, mockResponse);

      const result = await marketDataService.getTopCoins(15, ['DOGE']);

      expect(result).toHaveLength(2);
      expect(result.map(coin => coin.symbol)).not.toContain('DOGE');
    });

    it('should handle API errors gracefully', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 15,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(500, { error: 'Internal Server Error' });

      await expect(marketDataService.getTopCoins(15)).rejects.toThrow('API server error. Please try again later.');
    });

    it('should use cache for subsequent requests', async () => {
      const mockResponse = [
        {
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        }
      ];

      const scope = nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 15,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(200, mockResponse);

      // First call
      const result1 = await marketDataService.getTopCoins(15);
      
      // Second call should use cache, not make another API request
      const result2 = await marketDataService.getTopCoins(15);

      // Should only have made one HTTP request
      expect(scope.isDone()).toBe(true);
      expect(result1).toEqual(result2);
    });

    describe('exclusion logic', () => {
      it('should exclude specified coins and count against limit', async () => {
        const mockResponse = [
          { symbol: 'btc', name: 'Bitcoin', current_price: 50000, market_cap: 1000000000000, price_change_percentage_24h: 2.5, total_volume: 50000000000 },
          { symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: 400000000000, price_change_percentage_24h: -1.2, total_volume: 20000000000 },
          { symbol: 'usdt', name: 'Tether', current_price: 1, market_cap: 100000000000, price_change_percentage_24h: 0.1, total_volume: 30000000000 },
          { symbol: 'usdc', name: 'USD Coin', current_price: 1, market_cap: 50000000000, price_change_percentage_24h: 0.05, total_volume: 15000000000 },
          { symbol: 'bnb', name: 'BNB', current_price: 400, market_cap: 60000000000, price_change_percentage_24h: 1.8, total_volume: 2000000000 }
        ];

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 55, // fetchLimit = Math.max(5 + 2, 50) = 55
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          })
          .reply(200, mockResponse);

        const result = await marketDataService.getTopCoins(5, ['USDT', 'USDC']);

        // Should return only 3 coins (5 - 2 excluded from top 5)
        expect(result).toHaveLength(3);
        expect(result.map(c => c.symbol)).toEqual(['BTC', 'ETH', 'BNB']);
        expect(result.map(c => c.symbol)).not.toContain('USDT');
        expect(result.map(c => c.symbol)).not.toContain('USDC');
      });

      it('should handle exclusions that remove all coins from limit', async () => {
        const mockResponse = [
          { symbol: 'btc', name: 'Bitcoin', current_price: 50000, market_cap: 1000000000000, price_change_percentage_24h: 2.5, total_volume: 50000000000 },
          { symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: 400000000000, price_change_percentage_24h: -1.2, total_volume: 20000000000 },
          { symbol: 'usdt', name: 'Tether', current_price: 1, market_cap: 100000000000, price_change_percentage_24h: 0.1, total_volume: 30000000000 }
        ];

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 52, // fetchLimit = Math.max(2 + 2, 50) = 52
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          })
          .reply(200, mockResponse);

        const result = await marketDataService.getTopCoins(2, ['BTC', 'ETH']);

        // Should return empty array since top 2 coins are excluded
        expect(result).toHaveLength(0);
      });

      it('should handle case where no exclusions are provided', async () => {
        const mockResponse = [
          { symbol: 'btc', name: 'Bitcoin', current_price: 50000, market_cap: 1000000000000, price_change_percentage_24h: 2.5, total_volume: 50000000000 },
          { symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: 400000000000, price_change_percentage_24h: -1.2, total_volume: 20000000000 },
          { symbol: 'usdt', name: 'Tether', current_price: 1, market_cap: 100000000000, price_change_percentage_24h: 0.1, total_volume: 30000000000 }
        ];

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50, // fetchLimit = Math.max(3 + 0, 50) = 50
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          })
          .reply(200, mockResponse);

        const result = await marketDataService.getTopCoins(3, []);

        expect(result).toHaveLength(3);
        expect(result.map(c => c.symbol)).toEqual(['BTC', 'ETH', 'USDT']);
      });

      it('should maintain ranking after exclusions', async () => {
        const mockResponse = [
          { symbol: 'btc', name: 'Bitcoin', current_price: 50000, market_cap: 1000000000000, price_change_percentage_24h: 2.5, total_volume: 50000000000 },
          { symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: 400000000000, price_change_percentage_24h: -1.2, total_volume: 20000000000 },
          { symbol: 'usdt', name: 'Tether', current_price: 1, market_cap: 100000000000, price_change_percentage_24h: 0.1, total_volume: 30000000000 },
          { symbol: 'bnb', name: 'BNB', current_price: 400, market_cap: 60000000000, price_change_percentage_24h: 1.8, total_volume: 2000000000 },
          { symbol: 'xrp', name: 'XRP', current_price: 0.6, market_cap: 30000000000, price_change_percentage_24h: 3.2, total_volume: 1500000000 }
        ];

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query({
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 54, // fetchLimit = Math.max(4 + 1, 50) = 54
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          })
          .reply(200, mockResponse);

        const result = await marketDataService.getTopCoins(4, ['USDT']);

        // Should return top 4 coins excluding USDT, which means BTC, ETH, BNB
        expect(result).toHaveLength(3);
        expect(result[0].symbol).toBe('BTC'); // Rank 1
        expect(result[1].symbol).toBe('ETH'); // Rank 2  
        expect(result[2].symbol).toBe('BNB'); // Rank 3 (original rank 4, but becomes rank 3 after exclusion)
        
        // Check that rankings are properly assigned
        expect(result[0].rank).toBe(1);
        expect(result[1].rank).toBe(2);
        expect(result[2].rank).toBe(3);
      });
    });
  });

  describe('getCoinPrices', () => {
    it('should fetch coin prices successfully', async () => {
      const mockResponse = {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 }
      };

      nock('https://api.coingecko.com')
        .get('/api/v3/simple/price')
        .query({
          ids: 'bitcoin,ethereum',
          vs_currencies: 'usd'
        })
        .reply(200, mockResponse);

      const result = await marketDataService.getCoinPrices(['BTC', 'ETH']);

      expect(result).toEqual({
        BTC: {
          price: 50000,
          timestamp: expect.any(String)
        },
        ETH: {
          price: 3000,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle unknown symbols gracefully', async () => {
      const mockResponse = {
        bitcoin: { usd: 50000 }
      };

      nock('https://api.coingecko.com')
        .get('/api/v3/simple/price')
        .query({
          ids: 'bitcoin,unknown',
          vs_currencies: 'usd'
        })
        .reply(200, mockResponse);

      const result = await marketDataService.getCoinPrices(['BTC', 'UNKNOWN']);

      expect(result).toEqual({
        BTC: {
          price: 50000,
          timestamp: expect.any(String)
        }
      });
      expect(result.UNKNOWN).toBeUndefined();
    });
  });

  describe('searchCoins', () => {
    it('should search coins successfully', async () => {
      const mockResponse = {
        coins: [
          {
            symbol: 'btc',
            name: 'Bitcoin',
            thumb: 'https://example.com/bitcoin.png'
          },
          {
            symbol: 'bch',
            name: 'Bitcoin Cash',
            thumb: 'https://example.com/bitcoin-cash.png'
          }
        ]
      };

      nock('https://api.coingecko.com')
        .get('/api/v3/search')
        .query({ query: 'bitcoin' })
        .reply(200, mockResponse);

      const result = await marketDataService.searchCoins('bitcoin');

      expect(result).toEqual([
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          logo: 'https://example.com/bitcoin.png'
        },
        {
          symbol: 'BCH',
          name: 'Bitcoin Cash',
          logo: 'https://example.com/bitcoin-cash.png'
        }
      ]);
    });

    it('should limit search results', async () => {
      const mockResponse = {
        coins: Array.from({ length: 20 }, (_, i) => ({
          symbol: `coin${i}`,
          name: `Coin ${i}`,
          thumb: `https://example.com/coin${i}.png`
        }))
      };

      nock('https://api.coingecko.com')
        .get('/api/v3/search')
        .query({ query: 'coin' })
        .reply(200, mockResponse);

      const result = await marketDataService.searchCoins('coin', 5);

      expect(result).toHaveLength(5);
    });
  });
});