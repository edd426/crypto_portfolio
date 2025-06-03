import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PortfolioUrlService } from '../portfolio-url.service';
import { Portfolio } from '../../models/portfolio.model';

describe('PortfolioUrlService', () => {
  let service: PortfolioUrlService;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(() => {
    const routerSpy = {
      navigate: jest.fn()
    };

    const activatedRouteMock = {
      snapshot: {
        queryParams: {}
      }
    };

    TestBed.configureTestingModule({
      providers: [
        PortfolioUrlService,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    });

    service = TestBed.inject(PortfolioUrlService);
    mockRouter = TestBed.inject(Router) as jest.Mocked<Router>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute);
  });

  describe('savePortfolioToUrl', () => {
    it('should save portfolio with holdings to URL parameters', () => {
      const portfolio: Portfolio = {
        holdings: [
          { symbol: 'BTC', amount: 0.5 },
          { symbol: 'ETH', amount: 10 }
        ],
        cashBalance: 5000,
        excludedCoins: ['DOGE']
      };

      service.savePortfolioToUrl(portfolio);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: expect.objectContaining({
            p: 'BTC:0.5,ETH:10',
            cash: '5000',
            exclude: 'DOGE'
          }),
          queryParamsHandling: 'merge'
        })
      );
    });

    it('should handle empty portfolio', () => {
      const portfolio: Portfolio = {
        holdings: [],
        cashBalance: 0,
        excludedCoins: []
      };

      service.savePortfolioToUrl(portfolio);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({
          queryParams: {},
          queryParamsHandling: 'merge'
        })
      );
    });
  });

  describe('loadPortfolioFromUrl', () => {
    it('should load portfolio from URL parameters', () => {
      // Mock window.location.search
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?p=BTC:0.5,ETH:10&cash=5000&exclude=DOGE,SHIB'
        },
        writable: true
      });

      const result = service.loadPortfolioFromUrl();

      expect(result).toEqual({
        holdings: [
          { symbol: 'BTC', amount: 0.5 },
          { symbol: 'ETH', amount: 10 }
        ],
        cashBalance: 5000,
        excludedCoins: ['DOGE', 'SHIB'],
        maxCoins: 15
      });
    });

    it('should return null for empty URL parameters', () => {
      // Mock empty search
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: ''
        },
        writable: true
      });

      const result = service.loadPortfolioFromUrl();

      expect(result).toBeNull();
    });

    it('should handle malformed portfolio parameters', () => {
      // Mock search with invalid data
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?p=BTC:invalid,ETH:10&cash=invalid'
        },
        writable: true
      });

      const result = service.loadPortfolioFromUrl();

      expect(result?.holdings).toEqual([
        { symbol: 'ETH', amount: 10 }
      ]);
      expect(result?.cashBalance).toBe(0);
    });

    it('should filter out invalid holdings', () => {
      // Mock search with invalid holding data
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: '?p=BTC:0,ETH:10,:5'
        },
        writable: true
      });

      const result = service.loadPortfolioFromUrl();

      expect(result?.holdings).toEqual([
        { symbol: 'ETH', amount: 10 }
      ]);
    });
  });

  describe('generateShareableUrl', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
          pathname: '/portfolio'
        },
        writable: true
      });
    });

    it('should generate shareable URL with portfolio data', () => {
      const portfolio: Portfolio = {
        holdings: [
          { symbol: 'BTC', amount: 0.5 },
          { symbol: 'ETH', amount: 10 }
        ],
        cashBalance: 5000,
        excludedCoins: ['DOGE']
      };

      const result = service.generateShareableUrl(portfolio);

      expect(result).toMatch(/^https:\/\/example\.com\/portfolio\?/);
      expect(result).toContain('p=BTC%3A0.5%2CETH%3A10');
      expect(result).toContain('cash=5000');
      expect(result).toContain('exclude=DOGE');
    });

    it('should generate URL without optional parameters', () => {
      const portfolio: Portfolio = {
        holdings: [],
        cashBalance: 0,
        excludedCoins: []
      };

      const result = service.generateShareableUrl(portfolio);

      expect(result).toBe('https://example.com/portfolio?');
      expect(result).not.toContain('p=');
      expect(result).not.toContain('cash=');
      expect(result).not.toContain('exclude=');
    });

    describe('maxCoins functionality', () => {
      it('should include maxCoins in URL when different from default', () => {
        const portfolio: Portfolio = {
          holdings: [
            { symbol: 'BTC', amount: 0.5 }
          ],
          cashBalance: 1000,
          excludedCoins: [],
          maxCoins: 25
        };

        service.savePortfolioToUrl(portfolio);

        expect(mockRouter.navigate).toHaveBeenCalledWith([], {
          relativeTo: mockActivatedRoute,
          queryParams: expect.objectContaining({
            p: 'BTC:0.5',
            cash: '1000',
            maxCoins: '25'
          }),
          queryParamsHandling: 'merge'
        });
      });

      it('should not include maxCoins in URL when default value', () => {
        const portfolio: Portfolio = {
          holdings: [
            { symbol: 'BTC', amount: 0.5 }
          ],
          cashBalance: 1000,
          excludedCoins: [],
          maxCoins: 15
        };

        service.savePortfolioToUrl(portfolio);

        const params = (mockRouter.navigate as jest.Mock).mock.calls[0][1].queryParams;
        expect(params.maxCoins).toBeUndefined();
      });

      it('should load maxCoins from URL parameters', () => {
        // Mock window.location.search
        Object.defineProperty(window, 'location', {
          value: {
            ...window.location,
            search: '?p=BTC:0.5,ETH:10&cash=5000&exclude=DOGE,SHIB&maxCoins=20'
          },
          writable: true
        });

        const result = service.loadPortfolioFromUrl();

        expect(result).toEqual({
          holdings: [
            { symbol: 'BTC', amount: 0.5 },
            { symbol: 'ETH', amount: 10 }
          ],
          cashBalance: 5000,
          excludedCoins: ['DOGE', 'SHIB'],
          maxCoins: 20
        });
      });

      it('should default to 15 when maxCoins not in URL', () => {
        // Mock window.location.search without maxCoins
        Object.defineProperty(window, 'location', {
          value: {
            ...window.location,
            search: '?p=BTC:0.5&cash=1000'
          },
          writable: true
        });

        const result = service.loadPortfolioFromUrl();

        expect(result?.maxCoins).toBe(15);
      });

      it('should handle invalid maxCoins values in URL', () => {
        // Mock window.location.search with invalid maxCoins
        Object.defineProperty(window, 'location', {
          value: {
            ...window.location,
            search: '?p=BTC:0.5&cash=1000&maxCoins=invalid'
          },
          writable: true
        });

        const result = service.loadPortfolioFromUrl();

        expect(result?.maxCoins).toBe(15); // Should default to 15
      });

      it('should include maxCoins in shareable URL when different from default', () => {
        const portfolio: Portfolio = {
          holdings: [
            { symbol: 'BTC', amount: 0.5 }
          ],
          cashBalance: 1000,
          excludedCoins: ['USDT'],
          maxCoins: 30
        };

        const result = service.generateShareableUrl(portfolio);

        expect(result).toContain('maxCoins=30');
        expect(result).toContain('p=BTC%3A0.5');
        expect(result).toContain('cash=1000');
        expect(result).toContain('exclude=USDT');
      });

      it('should not include maxCoins in shareable URL when default value', () => {
        const portfolio: Portfolio = {
          holdings: [
            { symbol: 'BTC', amount: 0.5 }
          ],
          cashBalance: 1000,
          excludedCoins: [],
          maxCoins: 15
        };

        const result = service.generateShareableUrl(portfolio);

        expect(result).not.toContain('maxCoins');
      });
    });
  });
});