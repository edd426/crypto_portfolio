import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Observable } from 'rxjs';

import { PortfolioEntryComponent } from '../portfolio-entry/portfolio-entry.component';
import { ApiService } from '../../services/api.service';

describe('PortfolioEntryComponent - Dropdown Exclusion', () => {
  let component: PortfolioEntryComponent;
  let fixture: ComponentFixture<PortfolioEntryComponent>;
  let mockApiService: any;

  const mockTopCoins = {
    data: [
      { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 50000, marketCap: 1000000000000, change24h: 1.5, volume24h: 50000000000 },
      { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 3000, marketCap: 350000000000, change24h: 2.1, volume24h: 20000000000 },
      { rank: 3, symbol: 'USDT', name: 'Tether', price: 1, marketCap: 100000000000, change24h: 0.01, volume24h: 80000000000 },
      { rank: 4, symbol: 'BNB', name: 'BNB', price: 400, marketCap: 60000000000, change24h: 1.8, volume24h: 2000000000 },
      { rank: 5, symbol: 'XRP', name: 'XRP', price: 0.6, marketCap: 30000000000, change24h: 3.2, volume24h: 1500000000 }
    ],
    timestamp: '2024-01-01T00:00:00.000Z',
    cached: false
  };

  beforeEach(async () => {
    const apiServiceSpy = {
      getTopCoins: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        PortfolioEntryComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioEntryComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as any;
  });

  it('should load top coins for exclusion dropdown on init', fakeAsync(() => {
    mockApiService.getTopCoins.mockReturnValue(of(mockTopCoins));

    component.ngOnInit();
    tick();

    expect(mockApiService.getTopCoins).toHaveBeenCalledWith(20);
    expect(component.availableCoinsForExclusion).toEqual(mockTopCoins.data);
  }));

  it('should filter out already excluded coins from dropdown options', () => {
    component.availableCoinsForExclusion = mockTopCoins.data;
    component.excludedCoins = ['USDT', 'BNB'];

    const availableCoins = component.getAvailableCoins();

    expect(availableCoins.length).toBe(3);
    expect(availableCoins.map(c => c.symbol)).toEqual(['BTC', 'ETH', 'XRP']);
    expect(availableCoins.map(c => c.symbol)).not.toContain('USDT');
    expect(availableCoins.map(c => c.symbol)).not.toContain('BNB');
  });

  it('should add coin to excluded list when selected from dropdown', () => {
    jest.spyOn(component.portfolioChanged, 'emit');
    
    // Need to set form to valid state for portfolioChanged to emit
    component.holdingsArray.at(0).patchValue({
      symbol: 'BTC',
      amount: 1
    });
    component.portfolioForm.patchValue({ cashBalance: 1000 });
    
    component.onCoinSelected('USDT');

    expect(component.excludedCoins).toContain('USDT');
    expect(component.portfolioChanged.emit).toHaveBeenCalled();
  });

  it('should not add duplicate coins to excluded list', () => {
    component.excludedCoins = ['USDT'];
    
    component.onCoinSelected('USDT');

    expect(component.excludedCoins.length).toBe(1);
    expect(component.excludedCoins).toEqual(['USDT']);
  });

  it('should remove coin from excluded list when chip is removed', () => {
    component.excludedCoins = ['USDT', 'BNB'];
    jest.spyOn(component.portfolioChanged, 'emit');
    
    // Need to set form to valid state for portfolioChanged to emit
    component.holdingsArray.at(0).patchValue({
      symbol: 'BTC',
      amount: 1
    });
    component.portfolioForm.patchValue({
      cashBalance: 1000
    });
    
    component.removeExcludedCoin('USDT');

    expect(component.excludedCoins).toEqual(['BNB']);
    expect(component.portfolioChanged.emit).toHaveBeenCalled();
  });

  it('should include excluded coins in portfolio when building', () => {
    component.portfolioForm.patchValue({
      holdings: [{ symbol: 'BTC', amount: 0.1 }],
      cashBalance: 1000
    });
    component.excludedCoins = ['USDT', 'DOGE'];

    const portfolio = component['buildPortfolio']();

    expect(portfolio.excludedCoins).toEqual(['USDT', 'DOGE']);
  });

  it('should handle API error gracefully with fallback coins', fakeAsync(() => {
    const errorObservable = new Observable((subscriber) => {
      subscriber.error(new Error('API Error'));
    });
    mockApiService.getTopCoins.mockReturnValue(errorObservable);

    jest.spyOn(console, 'error').mockImplementation(() => {});
    component['loadTopCoins']();
    tick();

    // Console error was removed for production builds
    expect(component.availableCoinsForExclusion.length).toBeGreaterThan(0);
    expect(component.availableCoinsForExclusion[0].symbol).toBe('BTC');
  }));
});