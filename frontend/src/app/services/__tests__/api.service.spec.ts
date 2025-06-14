import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from '../api.service';
import { Portfolio } from '../../models/portfolio.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTopCoins', () => {
    it('should fetch top coins successfully', () => {
      const mockCoinGeckoResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          market_cap_rank: 1,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        }
      ];

      service.getTopCoins(15).subscribe(response => {
        expect(response.data).toHaveLength(1);
        expect(response.data[0].symbol).toBe('BTC');
        expect(response.data[0].name).toBe('Bitcoin');
        expect(response.data[0].price).toBe(50000);
        expect(response.cached).toBe(false);
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets') &&
        request.params.get('vs_currency') === 'usd' &&
        request.params.get('order') === 'market_cap_desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCoinGeckoResponse);
    });

    it('should handle exclude parameter', () => {
      const mockCoinGeckoResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc', 
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          market_cap_rank: 1,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        },
        {
          id: 'dogecoin',
          symbol: 'doge',
          name: 'Dogecoin', 
          current_price: 0.10,
          market_cap: 14000000000,
          market_cap_rank: 8,
          price_change_percentage_24h: -1.2,
          total_volume: 500000000
        }
      ];

      service.getTopCoins(15, ['DOGE', 'SHIB']).subscribe(response => {
        expect(response.data).toHaveLength(1);
        expect(response.data[0].symbol).toBe('BTC');
        expect(response.data.find(coin => coin.symbol === 'DOGE')).toBeUndefined();
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCoinGeckoResponse);
    });

    it('should return cached data when available', () => {
      const mockCoinGeckoResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          market_cap_rank: 1,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        }
      ];

      // First call to populate cache
      service.getTopCoins(15).subscribe();
      const req1 = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets')
      );
      req1.flush(mockCoinGeckoResponse);

      // Second call should return cached data
      service.getTopCoins(15).subscribe(response => {
        expect(response.cached).toBe(true);
        expect(response.data[0].symbol).toBe('BTC');
      });

      // No additional HTTP request should be made
      httpMock.expectNone(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets')
      );
    });

    it('should handle API errors and log them', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      service.getTopCoins(15).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('API Error');
        }
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets')
      );
      req.error(new ErrorEvent('API Error', { message: 'API Error' }));

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching top coins:', expect.any(Object));
    });
  });

  describe('getCoinPrices', () => {
    it('should fetch coin prices successfully', () => {
      const mockCoinGeckoResponse = {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 }
      };

      service.getCoinPrices(['BTC', 'ETH']).subscribe(response => {
        expect(response.data['BTC'].price).toBe(50000);
        expect(response.data['ETH'].price).toBe(3000);
        expect(response.data['BTC'].timestamp).toBeDefined();
        expect(response.data['ETH'].timestamp).toBeDefined();
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/simple/price') &&
        request.params.get('ids') === 'bitcoin,ethereum' &&
        request.params.get('vs_currencies') === 'usd'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCoinGeckoResponse);
    });

    it('should handle cached prices', () => {
      const mockCoinGeckoResponse = {
        bitcoin: { usd: 50000 }
      };

      // First call to populate cache
      service.getCoinPrices(['BTC']).subscribe();
      const req1 = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/simple/price')
      );
      req1.flush(mockCoinGeckoResponse);

      // Second call should return cached data
      service.getCoinPrices(['BTC']).subscribe(response => {
        expect(response.data['BTC'].price).toBe(50000);
      });

      // No additional HTTP request should be made
      httpMock.expectNone(request => 
        request.url.includes('https://api.coingecko.com/api/v3/simple/price')
      );
    });

    it('should handle API errors and log them', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      service.getCoinPrices(['BTC']).subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Price API Error');
        }
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/simple/price')
      );
      req.error(new ErrorEvent('Price API Error', { message: 'Price API Error' }));

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching coin prices:', expect.any(Object));
    });
  });

  describe('searchCoins', () => {
    it('should search coins successfully', () => {
      const mockCoinGeckoResponse = {
        coins: [
          { 
            id: 'bitcoin',
            symbol: 'btc', 
            name: 'Bitcoin', 
            thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png'
          },
          {
            id: 'bitcoin-cash',
            symbol: 'bch',
            name: 'Bitcoin Cash',
            thumb: 'https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash.png'
          }
        ]
      };

      service.searchCoins('bitcoin', 10).subscribe(response => {
        expect(response.results).toHaveLength(2);
        expect(response.results[0].symbol).toBe('BTC');
        expect(response.results[0].name).toBe('Bitcoin');
        expect(response.results[0].logo).toBeDefined();
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/search') &&
        request.params.get('query') === 'bitcoin'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCoinGeckoResponse);
    });

    it('should limit search results', () => {
      const mockCoinGeckoResponse = {
        coins: Array.from({ length: 20 }, (_, i) => ({
          id: `coin-${i}`,
          symbol: `coin${i}`,
          name: `Coin ${i}`,
          thumb: `https://example.com/coin${i}.png`
        }))
      };

      service.searchCoins('coin', 5).subscribe(response => {
        expect(response.results).toHaveLength(5);
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/search')
      );
      req.flush(mockCoinGeckoResponse);
    });

    it('should handle search API errors and log them', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      service.searchCoins('bitcoin').subscribe({
        next: () => fail('Should have thrown an error'),
        error: (error) => {
          expect(error.message).toBe('Search API Error');
        }
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/search')
      );
      req.error(new ErrorEvent('Search API Error', { message: 'Search API Error' }));

      expect(consoleSpy).toHaveBeenCalledWith('Error searching coins:', expect.any(Object));
    });
  });

  describe('calculateRebalancing', () => {
    it('should calculate rebalancing client-side', () => {
      const portfolio: Portfolio = {
        holdings: [{ symbol: 'BTC', amount: 1 }],
        cashBalance: 5000,
        excludedCoins: []
      };

      const mockCoinGeckoResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000,
          market_cap_rank: 1,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3000,
          market_cap: 400000000000,
          market_cap_rank: 2,
          price_change_percentage_24h: 1.8,
          total_volume: 20000000000
        }
      ];

      service.calculateRebalancing(portfolio, ['DOGE'], 15).subscribe(response => {
        expect(response.currentValue).toBe(55000); // 50000 BTC + 5000 cash
        expect(response.totalValue).toBe(55000);
        expect(response.targetAllocations).toBeDefined();
        expect(response.trades).toBeDefined();
        expect(response.summary).toBeDefined();
        expect(response.metadata).toBeDefined();
        expect(response.metadata.excludedCoins).toEqual(['DOGE']);
        expect(response.metadata.topN).toBe(15);
      });

      // Should call getTopCoins which makes CoinGecko API call
      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCoinGeckoResponse);
    });

    it('should calculate trades correctly', () => {
      const portfolio: Portfolio = {
        holdings: [{ symbol: 'BTC', amount: 0.5 }], // $25k in BTC
        cashBalance: 25000, // $25k cash
        excludedCoins: []
      };

      const mockCoinGeckoResponse = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 50000,
          market_cap: 1000000000000, // 71.4% of total market cap
          market_cap_rank: 1,
          price_change_percentage_24h: 2.5,
          total_volume: 50000000000
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3000,
          market_cap: 400000000000, // 28.6% of total market cap
          market_cap_rank: 2,
          price_change_percentage_24h: 1.8,
          total_volume: 20000000000
        }
      ];

      service.calculateRebalancing(portfolio, [], 2).subscribe(response => {
        expect(response.totalValue).toBe(50000);
        expect(response.targetAllocations).toHaveLength(2);
        expect(response.trades.length).toBeGreaterThan(0);
        
        // Check that BTC allocation is around 71.4% of total value
        const btcAllocation = response.targetAllocations.find(a => a.symbol === 'BTC');
        expect(btcAllocation).toBeDefined();
        expect(btcAllocation!.percentage).toBeCloseTo(71.4, 1);
        
        // Check that ETH allocation is around 28.6% of total value
        const ethAllocation = response.targetAllocations.find(a => a.symbol === 'ETH');
        expect(ethAllocation).toBeDefined();
        expect(ethAllocation!.percentage).toBeCloseTo(28.6, 1);
      });

      const req = httpMock.expectOne(request => 
        request.url.includes('https://api.coingecko.com/api/v3/coins/markets')
      );
      req.flush(mockCoinGeckoResponse);
    });
  });

  describe('checkHealth', () => {
    it('should return client-side health status', () => {
      service.checkHealth().subscribe(response => {
        expect(response.status).toBe('healthy');
        expect(response.version).toBe('2.0.0-client-side');
        expect(response.timestamp).toBeDefined();
      });

      // No HTTP request should be made since this is client-side only
      httpMock.expectNone(() => true);
    });
  });
});