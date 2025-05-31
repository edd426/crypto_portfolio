import { RebalancingService } from '../../services/rebalancingService';
import { MarketDataService } from '../../services/marketDataService';
import { Portfolio } from '../../models/types';

jest.mock('../../services/marketDataService');

describe('RebalancingService', () => {
  let rebalancingService: RebalancingService;
  let mockMarketDataService: jest.Mocked<MarketDataService>;

  beforeEach(() => {
    rebalancingService = new RebalancingService();
    mockMarketDataService = new MarketDataService() as jest.Mocked<MarketDataService>;
    (rebalancingService as any).marketDataService = mockMarketDataService;
  });

  describe('calculateRebalancing', () => {
    it('should calculate rebalancing correctly', async () => {
      const portfolio: Portfolio = {
        holdings: [
          { symbol: 'BTC', amount: 0.5 },
          { symbol: 'ETH', amount: 10 }
        ],
        cashBalance: 5000,
        excludedCoins: []
      };

      const mockTopCoins = [
        {
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        },
        {
          rank: 2,
          symbol: 'ETH',
          name: 'Ethereum',
          price: 3000,
          marketCap: 400000000000,
          change24h: -1.2,
          volume24h: 20000000000
        },
        {
          rank: 3,
          symbol: 'USDT',
          name: 'Tether',
          price: 1,
          marketCap: 100000000000,
          change24h: 0.1,
          volume24h: 30000000000
        }
      ];

      const mockPrices = {
        BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' },
        ETH: { price: 3000, timestamp: '2024-01-01T00:00:00Z' },
        USDT: { price: 1, timestamp: '2024-01-01T00:00:00Z' }
      };

      mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
      mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

      const result = await rebalancingService.calculateRebalancing(portfolio, [], 3);

      expect(result.currentValue).toBe(60000); // 0.5 * 50000 + 10 * 3000 + 5000
      expect(result.targetAllocations).toHaveLength(3);
      expect(result.trades).toBeInstanceOf(Array);
      expect(result.summary.estimatedFees).toBeGreaterThan(0);

      // Check that BTC gets the largest allocation (highest market cap)
      const btcAllocation = result.targetAllocations.find(a => a.symbol === 'BTC');
      expect(btcAllocation?.targetPercentage).toBeGreaterThan(50);
    });

    it('should handle portfolio with no existing holdings', async () => {
      const portfolio: Portfolio = {
        holdings: [],
        cashBalance: 10000,
        excludedCoins: []
      };

      const mockTopCoins = [
        {
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        }
      ];

      const mockPrices = {
        BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' }
      };

      mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
      mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

      const result = await rebalancingService.calculateRebalancing(portfolio, [], 1);

      expect(result.currentValue).toBe(10000);
      expect(result.trades).toHaveLength(1);
      expect(result.trades[0].action).toBe('BUY');
      expect(result.trades[0].symbol).toBe('BTC');
    });

    it('should exclude specified coins from rebalancing', async () => {
      const portfolio: Portfolio = {
        holdings: [{ symbol: 'BTC', amount: 1 }],
        cashBalance: 0,
        excludedCoins: ['ETH']
      };

      const mockTopCoins = [
        {
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        },
        {
          rank: 2,
          symbol: 'USDT',
          name: 'Tether',
          price: 1,
          marketCap: 100000000000,
          change24h: 0.1,
          volume24h: 30000000000
        }
      ];

      const mockPrices = {
        BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' },
        USDT: { price: 1, timestamp: '2024-01-01T00:00:00Z' }
      };

      mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
      mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

      const result = await rebalancingService.calculateRebalancing(portfolio, ['ETH'], 2);

      // Should not include ETH in target allocations
      const symbols = result.targetAllocations.map(a => a.symbol);
      expect(symbols).not.toContain('ETH');
      expect(symbols).toContain('BTC');
      expect(symbols).toContain('USDT');
    });

    it('should recommend selling coins not in top N', async () => {
      const portfolio: Portfolio = {
        holdings: [
          { symbol: 'BTC', amount: 1 },
          { symbol: 'OBSCURE_COIN', amount: 1000 }
        ],
        cashBalance: 0,
        excludedCoins: []
      };

      const mockTopCoins = [
        {
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        }
      ];

      const mockPrices = {
        BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' },
        OBSCURE_COIN: { price: 0.01, timestamp: '2024-01-01T00:00:00Z' }
      };

      mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
      mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

      const result = await rebalancingService.calculateRebalancing(portfolio, [], 1);

      // Should recommend selling OBSCURE_COIN
      const sellTrades = result.trades.filter(t => t.action === 'SELL');
      expect(sellTrades.some(t => t.symbol === 'OBSCURE_COIN')).toBe(true);
    });

    it('should calculate transaction fees correctly', async () => {
      const portfolio: Portfolio = {
        holdings: [{ symbol: 'BTC', amount: 1 }],
        cashBalance: 1000,
        excludedCoins: []
      };

      const mockTopCoins = [
        {
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        }
      ];

      const mockPrices = {
        BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' }
      };

      mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
      mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

      const result = await rebalancingService.calculateRebalancing(portfolio, [], 1);

      // Fees should be 0.5% of total trade value
      const expectedFees = (result.summary.totalBuys + result.summary.totalSells) * 0.005;
      expect(result.summary.estimatedFees).toBeCloseTo(expectedFees, 2);
    });

    it('should handle minimum trade threshold', async () => {
      const portfolio: Portfolio = {
        holdings: [{ symbol: 'BTC', amount: 0.99999 }], // Very close to target
        cashBalance: 0,
        excludedCoins: []
      };

      const mockTopCoins = [
        {
          rank: 1,
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 50000,
          marketCap: 1000000000000,
          change24h: 2.5,
          volume24h: 50000000000
        }
      ];

      const mockPrices = {
        BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' }
      };

      mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
      mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

      const result = await rebalancingService.calculateRebalancing(portfolio, [], 1);

      // Should not generate trades for very small differences
      expect(result.trades).toHaveLength(0);
    });
  });
});