import request from 'supertest';
import express from 'express';
import nock from 'nock';
import { rebalanceRoutes } from '../../controllers/rebalanceController';

const app = express();
app.use(express.json());
app.use('/api/v1/rebalance', rebalanceRoutes);

describe('Exclude Coins Integration Tests', () => {
  beforeEach(() => {
    // Mock CoinGecko API calls
    nock('https://api.coingecko.com')
      .get('/api/v3/coins/markets')
      .query(true)
      .reply(200, [
        { symbol: 'btc', name: 'Bitcoin', current_price: 50000, market_cap: 1000000000000, price_change_percentage_24h: 1.5, total_volume: 50000000000 },
        { symbol: 'eth', name: 'Ethereum', current_price: 3000, market_cap: 350000000000, price_change_percentage_24h: 2.1, total_volume: 20000000000 },
        { symbol: 'usdt', name: 'Tether', current_price: 1, market_cap: 100000000000, price_change_percentage_24h: 0.01, total_volume: 80000000000 },
        { symbol: 'xrp', name: 'XRP', current_price: 0.6, market_cap: 30000000000, price_change_percentage_24h: 3.2, total_volume: 1500000000 },
        { symbol: 'bnb', name: 'Binance Coin', current_price: 400, market_cap: 60000000000, price_change_percentage_24h: 1.8, total_volume: 2000000000 },
        { symbol: 'sol', name: 'Solana', current_price: 150, market_cap: 50000000000, price_change_percentage_24h: 4.5, total_volume: 1000000000 },
        { symbol: 'usdc', name: 'USD Coin', current_price: 1, market_cap: 45000000000, price_change_percentage_24h: 0.02, total_volume: 40000000000 },
        { symbol: 'doge', name: 'Dogecoin', current_price: 0.08, market_cap: 12000000000, price_change_percentage_24h: 5.1, total_volume: 800000000 },
        { symbol: 'trx', name: 'TRON', current_price: 0.1, market_cap: 9000000000, price_change_percentage_24h: 2.8, total_volume: 600000000 },
        { symbol: 'ada', name: 'Cardano', current_price: 0.5, market_cap: 17000000000, price_change_percentage_24h: 3.7, total_volume: 700000000 },
        { symbol: 'steth', name: 'Lido Staked Ether', current_price: 3000, market_cap: 30000000000, price_change_percentage_24h: 2.1, total_volume: 100000000 },
        { symbol: 'wbtc', name: 'Wrapped Bitcoin', current_price: 50000, market_cap: 8000000000, price_change_percentage_24h: 1.5, total_volume: 200000000 },
        { symbol: 'hype', name: 'Hyperliquid', current_price: 25, market_cap: 7500000000, price_change_percentage_24h: 8.2, total_volume: 150000000 },
        { symbol: 'sui', name: 'Sui', current_price: 3.5, market_cap: 9800000000, price_change_percentage_24h: 6.1, total_volume: 300000000 },
        { symbol: 'wsteth', name: 'Wrapped stETH', current_price: 3500, market_cap: 8200000000, price_change_percentage_24h: 2.3, total_volume: 120000000 },
        { symbol: 'link', name: 'Chainlink', current_price: 15, market_cap: 9100000000, price_change_percentage_24h: 4.1, total_volume: 400000000 },
        { symbol: 'avax', name: 'Avalanche', current_price: 25, market_cap: 10500000000, price_change_percentage_24h: 3.9, total_volume: 350000000 },
        { symbol: 'busd', name: 'Binance USD', current_price: 1, market_cap: 5000000000, price_change_percentage_24h: 0.01, total_volume: 200000000 }
      ]);

    nock('https://api.coingecko.com')
      .get('/api/v3/simple/price')
      .query(true)
      .reply(200, {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 },
        tether: { usd: 1 },
        ripple: { usd: 0.6 },
        binancecoin: { usd: 400 },
        solana: { usd: 150 },
        'usd-coin': { usd: 1 },
        dogecoin: { usd: 0.08 },
        tron: { usd: 0.1 },
        cardano: { usd: 0.5 },
        'lido-staked-ether': { usd: 3000 },
        'wrapped-bitcoin': { usd: 50000 },
        hyperliquid: { usd: 25 },
        sui: { usd: 3.5 },
        'wrapped-steth': { usd: 3500 },
        chainlink: { usd: 15 },
        'avalanche-2': { usd: 25 }
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });
  it('should exclude USDT when specified in portfolio.excludedCoins', async () => {
    const portfolio = {
      holdings: [
        { symbol: 'BTC', amount: 0.1 },
        { symbol: 'ETH', amount: 1 }
      ],
      cashBalance: 1000,
      excludedCoins: ['USDT']
    };

    const response = await request(app)
      .post('/api/v1/rebalance/calculate')
      .send({ portfolio })
      .expect(200);

    const symbols = response.body.targetAllocations.map((allocation: any) => allocation.symbol);
    
    // USDT should not be in the target allocations
    expect(symbols).not.toContain('USDT');
    
    // Should contain other major coins
    expect(symbols).toContain('BTC');
    expect(symbols).toContain('ETH');
    
    // Should have 15 allocations (since USDT is excluded)
    expect(response.body.targetAllocations).toHaveLength(15);
  });

  it('should exclude multiple coins when specified', async () => {
    const portfolio = {
      holdings: [
        { symbol: 'BTC', amount: 0.1 }
      ],
      cashBalance: 1000,
      excludedCoins: ['USDT', 'USDC', 'BUSD']
    };

    const response = await request(app)
      .post('/api/v1/rebalance/calculate')
      .send({ portfolio })
      .expect(200);

    const symbols = response.body.targetAllocations.map((allocation: any) => allocation.symbol);
    
    // None of the excluded coins should be in target allocations
    expect(symbols).not.toContain('USDT');
    expect(symbols).not.toContain('USDC');
    expect(symbols).not.toContain('BUSD');
    
    // Should still have 15 allocations
    expect(response.body.targetAllocations).toHaveLength(15);
  });

  it('should include USDT when excludedCoins is empty', async () => {
    const portfolio = {
      holdings: [
        { symbol: 'BTC', amount: 0.1 }
      ],
      cashBalance: 1000,
      excludedCoins: []
    };

    const response = await request(app)
      .post('/api/v1/rebalance/calculate')
      .send({ portfolio })
      .expect(200);

    const symbols = response.body.targetAllocations.map((allocation: any) => allocation.symbol);
    
    // USDT should be included when not excluded
    expect(symbols).toContain('USDT');
    
    // Should have 15 allocations
    expect(response.body.targetAllocations).toHaveLength(15);
  });

  it('should work when excludedCoins is not provided (backward compatibility)', async () => {
    const portfolio = {
      holdings: [
        { symbol: 'BTC', amount: 0.1 }
      ],
      cashBalance: 1000
      // excludedCoins not provided
    };

    const response = await request(app)
      .post('/api/v1/rebalance/calculate')
      .send({ portfolio })
      .expect(200);

    // Should work without errors
    expect(response.body.targetAllocations).toBeDefined();
    expect(response.body.targetAllocations).toHaveLength(15);
  });

  it('should prioritize portfolio.excludedCoins over top-level excludedCoins', async () => {
    const portfolio = {
      holdings: [{ symbol: 'BTC', amount: 0.1 }],
      cashBalance: 1000,
      excludedCoins: ['USDT'] // Portfolio level exclusion
    };

    const response = await request(app)
      .post('/api/v1/rebalance/calculate')
      .send({ 
        portfolio,
        excludedCoins: ['DOGE'] // Top-level exclusion (should be ignored)
      })
      .expect(200);

    const symbols = response.body.targetAllocations.map((allocation: any) => allocation.symbol);
    
    // Should exclude USDT (from portfolio.excludedCoins)
    expect(symbols).not.toContain('USDT');
    
    // Should include DOGE (top-level excludedCoins should be ignored when portfolio.excludedCoins exists)
    expect(symbols).toContain('DOGE');
  });

  it('should use top-level excludedCoins when portfolio.excludedCoins is empty', async () => {
    const portfolio = {
      holdings: [{ symbol: 'BTC', amount: 0.1 }],
      cashBalance: 1000,
      excludedCoins: [] // Empty portfolio exclusion
    };

    const response = await request(app)
      .post('/api/v1/rebalance/calculate')
      .send({ 
        portfolio,
        excludedCoins: ['USDT'] // Top-level exclusion (should be used)
      })
      .expect(200);

    const symbols = response.body.targetAllocations.map((allocation: any) => allocation.symbol);
    
    // Should exclude USDT (from top-level excludedCoins)
    expect(symbols).not.toContain('USDT');
  });
});