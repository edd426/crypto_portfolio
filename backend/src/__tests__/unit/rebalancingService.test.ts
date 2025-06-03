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

    describe('maxCoins functionality', () => {
      it('should respect maxCoins parameter when no exclusions', async () => {
        const portfolio: Portfolio = {
          holdings: [],
          cashBalance: 10000,
          excludedCoins: [],
          maxCoins: 5
        };

        const mockTopCoins = [
          { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 2.5, volume24h: 50000000000 },
          { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3000, marketCap: 400000000000, change24h: -1.2, volume24h: 20000000000 },
          { rank: 3, symbol: 'BNB', name: 'BNB', price: 400, marketCap: 60000000000, change24h: 1.8, volume24h: 2000000000 },
          { rank: 4, symbol: 'XRP', name: 'XRP', price: 0.6, marketCap: 30000000000, change24h: 3.2, volume24h: 1500000000 },
          { rank: 5, symbol: 'ADA', name: 'Cardano', price: 0.5, marketCap: 15000000000, change24h: 2.1, volume24h: 800000000 }
        ];

        const mockPrices = {
          BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' },
          ETH: { price: 3000, timestamp: '2024-01-01T00:00:00Z' },
          BNB: { price: 400, timestamp: '2024-01-01T00:00:00Z' },
          XRP: { price: 0.6, timestamp: '2024-01-01T00:00:00Z' },
          ADA: { price: 0.5, timestamp: '2024-01-01T00:00:00Z' }
        };

        mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
        mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

        const result = await rebalancingService.calculateRebalancing(portfolio, [], 5);

        expect(result.targetAllocations).toHaveLength(5);
        expect(mockMarketDataService.getTopCoins).toHaveBeenCalledWith(5, []);
      });

      it('should handle exclusions that count against maxCoins', async () => {
        const portfolio: Portfolio = {
          holdings: [],
          cashBalance: 10000,
          excludedCoins: ['USDT', 'USDC'],
          maxCoins: 5
        };

        // Mock returns 3 coins (5 minus 2 excluded from top 5)
        const mockTopCoins = [
          { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 2.5, volume24h: 50000000000 },
          { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3000, marketCap: 400000000000, change24h: -1.2, volume24h: 20000000000 },
          { rank: 6, symbol: 'XRP', name: 'XRP', price: 0.6, marketCap: 30000000000, change24h: 3.2, volume24h: 1500000000 }
        ];

        const mockPrices = {
          BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' },
          ETH: { price: 3000, timestamp: '2024-01-01T00:00:00Z' },
          XRP: { price: 0.6, timestamp: '2024-01-01T00:00:00Z' }
        };

        mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
        mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

        const result = await rebalancingService.calculateRebalancing(portfolio, ['USDT', 'USDC'], 5);

        // Should only have 3 coins in target allocations (5 - 2 excluded)
        expect(result.targetAllocations).toHaveLength(3);
        expect(mockMarketDataService.getTopCoins).toHaveBeenCalledWith(5, ['USDT', 'USDC']);
        
        // Verify only the expected coins are included
        const symbols = result.targetAllocations.map(a => a.symbol);
        expect(symbols).toContain('BTC');
        expect(symbols).toContain('ETH');
        expect(symbols).toContain('XRP');
        expect(symbols).not.toContain('USDT');
        expect(symbols).not.toContain('USDC');
      });

      it('should handle case where all maxCoins are excluded', async () => {
        const portfolio: Portfolio = {
          holdings: [],
          cashBalance: 10000,
          excludedCoins: ['BTC', 'ETH'],
          maxCoins: 2
        };

        // Mock returns empty array since top 2 coins are excluded
        const mockTopCoins: any[] = [];
        const mockPrices = {};

        mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
        mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

        const result = await rebalancingService.calculateRebalancing(portfolio, ['BTC', 'ETH'], 2);

        expect(result.targetAllocations).toHaveLength(0);
        expect(result.trades).toHaveLength(0);
      });

      it('should handle maxCoins larger than available coins', async () => {
        const portfolio: Portfolio = {
          holdings: [],
          cashBalance: 10000,
          excludedCoins: [],
          maxCoins: 100
        };

        const mockTopCoins = [
          { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 2.5, volume24h: 50000000000 }
        ];

        const mockPrices = {
          BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' }
        };

        mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
        mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

        const result = await rebalancingService.calculateRebalancing(portfolio, [], 100);

        // Should only return available coins, not fail
        expect(result.targetAllocations).toHaveLength(1);
        expect(result.targetAllocations[0].symbol).toBe('BTC');
      });

      it('should validate maxCoins parameter bounds', async () => {
        const portfolio: Portfolio = {
          holdings: [],
          cashBalance: 10000,
          excludedCoins: [],
          maxCoins: 10
        };

        const mockTopCoins = Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          symbol: `COIN${i + 1}`,
          name: `Coin ${i + 1}`,
          price: 100 - i,
          marketCap: 1000000000 * (10 - i),
          change24h: Math.random() * 10 - 5,
          volume24h: 1000000 * (10 - i)
        }));

        const mockPrices = Object.fromEntries(
          mockTopCoins.map(coin => [coin.symbol, { price: coin.price, timestamp: '2024-01-01T00:00:00Z' }])
        );

        mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
        mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

        const result = await rebalancingService.calculateRebalancing(portfolio, [], 10);

        expect(result.targetAllocations).toHaveLength(10);
        expect(mockMarketDataService.getTopCoins).toHaveBeenCalledWith(10, []);
      });
    });
  });
});