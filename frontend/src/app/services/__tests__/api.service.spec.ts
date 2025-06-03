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
      const mockResponse = {
        data: [
          {
            rank: 1,
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 50000,
            marketCap: 1000000000000,
            change24h: 2.5,
            volume24h: 50000000000
          }
        ],
        timestamp: '2024-01-01T00:00:00Z',
        cached: true
      };

      service.getTopCoins(15).subscribe(response => {
        expect(response.data).toHaveLength(1);
        expect(response.data[0].symbol).toBe('BTC');
        expect(response.cached).toBe(true);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/v1/market/top-coins?limit=15');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle exclude parameter', () => {
      const mockResponse = {
        data: [],
        timestamp: '2024-01-01T00:00:00Z',
        cached: false
      };

      service.getTopCoins(15, ['DOGE', 'SHIB']).subscribe();

      const req = httpMock.expectOne('http://localhost:3001/api/v1/market/top-coins?limit=15&exclude=DOGE,SHIB');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getCoinPrices', () => {
    it('should fetch coin prices successfully', () => {
      const mockResponse = {
        data: {
          BTC: { price: 50000, timestamp: '2024-01-01T00:00:00Z' },
          ETH: { price: 3000, timestamp: '2024-01-01T00:00:00Z' }
        }
      };

      service.getCoinPrices(['BTC', 'ETH']).subscribe(response => {
        expect(response.data['BTC'].price).toBe(50000);
        expect(response.data['ETH'].price).toBe(3000);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/v1/market/prices?symbols=BTC,ETH');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchCoins', () => {
    it('should search coins successfully', () => {
      const mockResponse = {
        results: [
          { symbol: 'BTC', name: 'Bitcoin', logo: 'https://example.com/btc.png' }
        ]
      };

      service.searchCoins('bitcoin', 10).subscribe(response => {
        expect(response.results).toHaveLength(1);
        expect(response.results[0].symbol).toBe('BTC');
      });

      const req = httpMock.expectOne('http://localhost:3001/api/v1/market/search?q=bitcoin&limit=10');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('calculateRebalancing', () => {
    it('should send rebalancing request successfully', () => {
      const portfolio: Portfolio = {
        holdings: [{ symbol: 'BTC', amount: 1 }],
        cashBalance: 5000,
        excludedCoins: []
      };

      const mockResponse = {
        currentValue: 55000,
        targetAllocations: [],
        trades: [],
        summary: { totalBuys: 0, totalSells: 0, estimatedFees: 0 }
      };

      service.calculateRebalancing(portfolio, ['DOGE'], 15).subscribe(response => {
        expect(response.currentValue).toBe(55000);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/v1/rebalance/calculate');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        portfolio,
        excludedCoins: ['DOGE'],
        options: { topN: 15 }
      });
      req.flush(mockResponse);
    });
  });

  describe('checkHealth', () => {
    it('should check API health', () => {
      const mockResponse = {
        status: 'healthy',
        version: '1.0.0',
        timestamp: '2024-01-01T00:00:00Z'
      };

      service.checkHealth().subscribe(response => {
        expect(response.status).toBe('healthy');
        expect(response.version).toBe('1.0.0');
      });

      const req = httpMock.expectOne('http://localhost:3001/api/v1/health');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});