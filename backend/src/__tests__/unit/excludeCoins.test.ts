import { RebalancingService } from '../../services/rebalancingService';
import { MarketDataService } from '../../services/marketDataService';

// Mock the MarketDataService
jest.mock('../../services/marketDataService');
const MockedMarketDataService = MarketDataService as jest.MockedClass<typeof MarketDataService>;

describe('Exclude Coins Functionality', () => {
  let rebalancingService: RebalancingService;
  let mockMarketDataService: jest.Mocked<MarketDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    rebalancingService = new RebalancingService();
    mockMarketDataService = new MockedMarketDataService() as jest.Mocked<MarketDataService>;
    
    // Replace the private instance with our mock
    (rebalancingService as any).marketDataService = mockMarketDataService;
  });

  it('should exclude USDT from top coins when specified', async () => {
    // Mock top coins including USDT
    const mockTopCoinsWithUSDT = [
      { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 1.5, volume24h: 50000000000 },
      { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3000, marketCap: 350000000000, change24h: 2.1, volume24h: 20000000000 },
      { rank: 3, symbol: 'USDT', name: 'Tether', price: 1, marketCap: 100000000000, change24h: 0.01, volume24h: 80000000000 },
      { rank: 4, symbol: 'BNB', name: 'Binance Coin', price: 400, marketCap: 60000000000, change24h: 1.8, volume24h: 2000000000 },
      { rank: 5, symbol: 'XRP', name: 'XRP', price: 0.6, marketCap: 30000000000, change24h: 3.2, volume24h: 1500000000 }
    ];

    // Mock top coins without USDT (should be returned when excluding USDT)
    const mockTopCoinsWithoutUSDT = [
      { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 1.5, volume24h: 50000000000 },
      { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3000, marketCap: 350000000000, change24h: 2.1, volume24h: 20000000000 },
      { rank: 3, symbol: 'BNB', name: 'Binance Coin', price: 400, marketCap: 60000000000, change24h: 1.8, volume24h: 2000000000 },
      { rank: 4, symbol: 'XRP', name: 'XRP', price: 0.6, marketCap: 30000000000, change24h: 3.2, volume24h: 1500000000 }
    ];

    // Mock coin prices
    const mockPrices = {
      'BTC': { price: 50000, timestamp: '2024-01-01T00:00:00.000Z' },
      'ETH': { price: 3000, timestamp: '2024-01-01T00:00:00.000Z' },
      'BNB': { price: 400, timestamp: '2024-01-01T00:00:00.000Z' },
      'XRP': { price: 0.6, timestamp: '2024-01-01T00:00:00.000Z' }
    };

    mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoinsWithoutUSDT);
    mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

    const portfolio = {
      holdings: [
        { symbol: 'BTC', amount: 0.1 },
        { symbol: 'ETH', amount: 2 }
      ],
      cashBalance: 1000,
      excludedCoins: []
    };

    // Test excluding USDT
    const result = await rebalancingService.calculateRebalancing(
      portfolio,
      ['USDT'], // Exclude USDT
      5 // Top 5 coins
    );

    // Verify that getTopCoins was called with USDT in the exclude list
    expect(mockMarketDataService.getTopCoins).toHaveBeenCalledWith(5, ['USDT']);

    // Verify that USDT is not in the target allocations
    const symbols = result.targetAllocations.map(t => t.symbol);
    expect(symbols).not.toContain('USDT');
    expect(symbols).toContain('BTC');
    expect(symbols).toContain('ETH');
    expect(symbols).toContain('BNB');
    expect(symbols).toContain('XRP');
  });

  it('should handle multiple excluded coins', async () => {
    const mockTopCoins = [
      { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 1.5, volume24h: 50000000000 },
      { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3000, marketCap: 350000000000, change24h: 2.1, volume24h: 20000000000 }
    ];

    const mockPrices = {
      'BTC': { price: 50000, timestamp: '2024-01-01T00:00:00.000Z' },
      'ETH': { price: 3000, timestamp: '2024-01-01T00:00:00.000Z' }
    };

    mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
    mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

    const portfolio = {
      holdings: [{ symbol: 'BTC', amount: 0.1 }],
      cashBalance: 1000,
      excludedCoins: []
    };

    // Test excluding multiple coins
    const excludedCoins = ['USDT', 'USDC', 'BUSD'];
    const result = await rebalancingService.calculateRebalancing(
      portfolio,
      excludedCoins,
      5
    );

    // Verify that getTopCoins was called with all excluded coins
    expect(mockMarketDataService.getTopCoins).toHaveBeenCalledWith(5, excludedCoins);

    // Verify that none of the excluded coins are in target allocations
    const symbols = result.targetAllocations.map(t => t.symbol);
    excludedCoins.forEach(coin => {
      expect(symbols).not.toContain(coin);
    });
  });

  it('should work with empty exclude list', async () => {
    const mockTopCoins = [
      { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 1.5, volume24h: 50000000000 },
      { rank: 2, symbol: 'USDT', name: 'Tether', price: 1, marketCap: 100000000000, change24h: 0.01, volume24h: 80000000000 }
    ];

    const mockPrices = {
      'BTC': { price: 50000, timestamp: '2024-01-01T00:00:00.000Z' },
      'USDT': { price: 1, timestamp: '2024-01-01T00:00:00.000Z' }
    };

    mockMarketDataService.getTopCoins.mockResolvedValue(mockTopCoins);
    mockMarketDataService.getCoinPrices.mockResolvedValue(mockPrices);

    const portfolio = {
      holdings: [{ symbol: 'BTC', amount: 0.1 }],
      cashBalance: 1000,
      excludedCoins: []
    };

    // Test with no excluded coins
    const result = await rebalancingService.calculateRebalancing(
      portfolio,
      [], // No excluded coins
      5
    );

    // Verify that getTopCoins was called with empty exclude list
    expect(mockMarketDataService.getTopCoins).toHaveBeenCalledWith(5, []);

    // Verify that USDT is included when not excluded
    const symbols = result.targetAllocations.map(t => t.symbol);
    expect(symbols).toContain('USDT');
  });
});