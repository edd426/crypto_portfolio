import request from 'supertest';
import nock from 'nock';
import app from '../../server';

describe('API Integration Tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Health Check', () => {
    it('GET /api/v1/health should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        version: '1.0.0',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Market Data Endpoints', () => {
    describe('GET /api/v1/market/top-coins', () => {
      it('should return top coins successfully', async () => {
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

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query(true)
          .reply(200, mockResponse);

        const response = await request(app)
          .get('/api/v1/market/top-coins')
          .expect(200);

        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0]).toEqual({
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        });
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.cached).toBe(true);
      });

      it('should handle limit parameter', async () => {
        const mockResponse = Array.from({ length: 5 }, (_, i) => ({
          symbol: `coin${i}`,
          name: `Coin ${i}`,
          current_price: 1000,
          market_cap: 1000000000,
          price_change_percentage_24h: 1.0,
          total_volume: 1000000
        }));

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query(query => query.per_page === '5')
          .reply(200, mockResponse);

        const response = await request(app)
          .get('/api/v1/market/top-coins?limit=5')
          .expect(200);

        expect(response.body.data).toHaveLength(5);
      });

      it('should handle exclude parameter', async () => {
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
          .query(true)
          .reply(200, mockResponse);

        const response = await request(app)
          .get('/api/v1/market/top-coins?exclude=DOGE,SHIB')
          .expect(200);

        expect(response.body.data).toHaveLength(2);
        const symbols = response.body.data.map((coin: any) => coin.symbol);
        expect(symbols).not.toContain('DOGE');
        expect(symbols).not.toContain('SHIB');
      });

      it('should return 400 for invalid limit', async () => {
        const response = await request(app)
          .get('/api/v1/market/top-coins?limit=101')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('GET /api/v1/market/prices', () => {
      it('should return coin prices successfully', async () => {
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

        const response = await request(app)
          .get('/api/v1/market/prices?symbols=BTC,ETH')
          .expect(200);

        expect(response.body.data.BTC.price).toBe(50000);
        expect(response.body.data.ETH.price).toBe(3000);
        expect(response.body.data.BTC.timestamp).toBeDefined();
      });

      it('should return 400 when symbols parameter is missing', async () => {
        const response = await request(app)
          .get('/api/v1/market/prices')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('GET /api/v1/market/search', () => {
      it('should search coins successfully', async () => {
        const mockResponse = {
          coins: [
            {
              symbol: 'btc',
              name: 'Bitcoin',
              thumb: 'https://example.com/bitcoin.png'
            }
          ]
        };

        nock('https://api.coingecko.com')
          .get('/api/v3/search')
          .query({ query: 'bitcoin' })
          .reply(200, mockResponse);

        const response = await request(app)
          .get('/api/v1/market/search?q=bitcoin')
          .expect(200);

        expect(response.body.results).toHaveLength(1);
        expect(response.body.results[0]).toEqual({
          symbol: 'BTC',
          name: 'Bitcoin',
          logo: 'https://example.com/bitcoin.png'
        });
      });

      it('should return 400 when query parameter is missing', async () => {
        const response = await request(app)
          .get('/api/v1/market/search')
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('Rebalancing Endpoints', () => {
    describe('POST /api/v1/rebalance/calculate', () => {
      it('should calculate rebalancing successfully', async () => {
        const mockTopCoins = [
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

        const mockPrices = {
          bitcoin: { usd: 50000 },
          ethereum: { usd: 3000 }
        };

        nock('https://api.coingecko.com')
          .get('/api/v3/coins/markets')
          .query(true)
          .reply(200, mockTopCoins);

        nock('https://api.coingecko.com')
          .get('/api/v3/simple/price')
          .query(true)
          .reply(200, mockPrices);

        const portfolioRequest = {
          portfolio: {
            holdings: [
              { symbol: 'BTC', amount: 0.5 },
              { symbol: 'ETH', amount: 10 }
            ],
            cashBalance: 5000
          },
          excludedCoins: [],
          options: { topN: 2 }
        };

        const response = await request(app)
          .post('/api/v1/rebalance/calculate')
          .send(portfolioRequest)
          .expect(200);

        expect(response.body.currentValue).toBeGreaterThan(0);
        expect(response.body.targetAllocations).toBeInstanceOf(Array);
        expect(response.body.trades).toBeInstanceOf(Array);
        expect(response.body.summary).toHaveProperty('totalBuys');
        expect(response.body.summary).toHaveProperty('totalSells');
        expect(response.body.summary).toHaveProperty('estimatedFees');
      });

      it('should return 400 for invalid portfolio data', async () => {
        const invalidRequest = {
          portfolio: {
            holdings: [
              { symbol: 'BTC' } // Missing amount
            ],
            cashBalance: 5000
          }
        };

        const response = await request(app)
          .post('/api/v1/rebalance/calculate')
          .send(invalidRequest)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for negative amounts', async () => {
        const invalidRequest = {
          portfolio: {
            holdings: [
              { symbol: 'BTC', amount: -1 }
            ],
            cashBalance: 5000
          }
        };

        const response = await request(app)
          .post('/api/v1/rebalance/calculate')
          .send(invalidRequest)
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });

      it('should return 400 for missing portfolio', async () => {
        const response = await request(app)
          .post('/api/v1/rebalance/calculate')
          .send({})
          .expect(400);

        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/unknown')
        .expect(404);
    });

    it('should handle CORS correctly', async () => {
      const response = await request(app)
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:4200')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:4200');
    });
  });
});