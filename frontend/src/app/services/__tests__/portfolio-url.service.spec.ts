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
            exclude: 'DOGE',
            t: expect.any(String)
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
          queryParams: expect.objectContaining({
            t: expect.any(String)
          })
        })
      );
    });
  });

  describe('loadPortfolioFromUrl', () => {
    it('should load portfolio from URL parameters', () => {
      mockActivatedRoute.snapshot!.queryParams = {
        p: 'BTC:0.5,ETH:10',
        cash: '5000',
        exclude: 'DOGE,SHIB'
      };

      const result = service.loadPortfolioFromUrl();

      expect(result).toEqual({
        holdings: [
          { symbol: 'BTC', amount: 0.5 },
          { symbol: 'ETH', amount: 10 }
        ],
        cashBalance: 5000,
        excludedCoins: ['DOGE', 'SHIB']
      });
    });

    it('should return null for empty URL parameters', () => {
      mockActivatedRoute.snapshot!.queryParams = {};

      const result = service.loadPortfolioFromUrl();

      expect(result).toBeNull();
    });

    it('should handle malformed portfolio parameters', () => {
      mockActivatedRoute.snapshot!.queryParams = {
        p: 'BTC:invalid,ETH:10',
        cash: 'invalid'
      };

      const result = service.loadPortfolioFromUrl();

      expect(result?.holdings).toEqual([
        { symbol: 'ETH', amount: 10 }
      ]);
      expect(result?.cashBalance).toBe(0);
    });

    it('should filter out invalid holdings', () => {
      mockActivatedRoute.snapshot!.queryParams = {
        p: 'BTC:0,ETH:10,:5'
      };

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
      expect(result).toContain('t=');
    });

    it('should generate URL without optional parameters', () => {
      const portfolio: Portfolio = {
        holdings: [],
        cashBalance: 0,
        excludedCoins: []
      };

      const result = service.generateShareableUrl(portfolio);

      expect(result).toMatch(/^https:\/\/example\.com\/portfolio\?t=/);
      expect(result).not.toContain('p=');
      expect(result).not.toContain('cash=');
      expect(result).not.toContain('exclude=');
    });
  });
});