import nock from 'nock';
import { MarketDataService } from '../../services/marketDataService';

describe('MarketDataService - Rate Limiting', () => {
  let marketDataService: MarketDataService;

  beforeEach(() => {
    marketDataService = new MarketDataService();
    nock.cleanAll();
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe('getTopCoins - Rate Limiting Scenarios', () => {
    it('should handle 429 Too Many Requests error gracefully', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(429, {
          status: {
            error_code: 429,
            error_message: 'You have exceeded the rate limit. Please try again later.'
          }
        }, {
          'retry-after': '14'
        });

      await expect(marketDataService.getTopCoins(15)).rejects.toThrow('API rate limit exceeded. Please try again in 14 seconds.');
    });

    it('should handle 429 error without retry-after header', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(429, {
          status: {
            error_code: 429,
            error_message: 'Rate limit exceeded'
          }
        });

      await expect(marketDataService.getTopCoins(15)).rejects.toThrow('API rate limit exceeded. Please try again later.');
    });

    it('should handle 500 server errors gracefully', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .reply(500, { error: 'Internal Server Error' });

      await expect(marketDataService.getTopCoins(15)).rejects.toThrow('API server error. Please try again later.');
    });

    it('should handle network timeout errors', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/coins/markets')
        .query({
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        })
        .replyWithError({ code: 'ECONNRESET', message: 'socket hang up' });

      await expect(marketDataService.getTopCoins(15)).rejects.toThrow('Network error. Please check your connection and try again.');
    });
  });

  describe('getCoinPrices - Rate Limiting Scenarios', () => {
    it('should handle 429 Too Many Requests error gracefully', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/simple/price')
        .query({
          ids: 'bitcoin,ethereum',
          vs_currencies: 'usd'
        })
        .reply(429, {
          status: {
            error_code: 429,
            error_message: 'Rate limit exceeded'
          }
        }, {
          'retry-after': '10'
        });

      await expect(marketDataService.getCoinPrices(['BTC', 'ETH'])).rejects.toThrow('API rate limit exceeded. Please try again in 10 seconds.');
    });
  });

  describe('searchCoins - Rate Limiting Scenarios', () => {
    it('should handle 429 Too Many Requests error gracefully', async () => {
      nock('https://api.coingecko.com')
        .get('/api/v3/search')
        .query({ query: 'bitcoin' })
        .reply(429, {
          status: {
            error_code: 429,
            error_message: 'Rate limit exceeded'
          }
        });

      await expect(marketDataService.searchCoins('bitcoin')).rejects.toThrow('API rate limit exceeded. Please try again later.');
    });
  });
});