import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PortfolioEntryComponent } from '../portfolio-entry/portfolio-entry.component';
import { ApiService } from '../../services/api.service';
import { Portfolio } from '../../models/portfolio.model';

describe('PortfolioEntryComponent', () => {
  let component: PortfolioEntryComponent;
  let fixture: ComponentFixture<PortfolioEntryComponent>;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = {
      searchCoins: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        PortfolioEntryComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioEntryComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one empty holding', () => {
    expect(component.holdingsArray.length).toBe(1);
    expect(component.holdingsArray.at(0).value).toEqual({
      symbol: '',
      amount: null
    });
  });

  it('should add new holding when addHolding is called', () => {
    component.addHolding();
    
    expect(component.holdingsArray.length).toBe(2);
  });

  it('should remove holding when removeHolding is called', () => {
    component.addHolding();
    component.removeHolding(1);
    
    expect(component.holdingsArray.length).toBe(1);
  });

  it('should not remove holding when only one remains', () => {
    component.removeHolding(0);
    
    expect(component.holdingsArray.length).toBe(1);
  });

  it('should add excluded coin', () => {
    component.addExcludedCoin('DOGE');
    
    expect(component.excludedCoins).toContain('DOGE');
  });

  it('should not add duplicate excluded coin', () => {
    component.addExcludedCoin('DOGE');
    component.addExcludedCoin('DOGE');
    
    expect(component.excludedCoins.filter(coin => coin === 'DOGE')).toHaveLength(1);
  });

  it('should remove excluded coin', () => {
    component.addExcludedCoin('DOGE');
    component.removeExcludedCoin('DOGE');
    
    expect(component.excludedCoins).not.toContain('DOGE');
  });

  it('should convert symbol to uppercase', () => {
    const symbolControl = component.holdingsArray.at(0).get('symbol');
    
    component.onSymbolChange(0, { target: { value: 'btc' } });
    
    expect(symbolControl?.value).toBe('BTC');
  });

  it('should load initial portfolio', () => {
    const initialPortfolio: Portfolio = {
      holdings: [
        { symbol: 'BTC', amount: 0.5 },
        { symbol: 'ETH', amount: 10 }
      ],
      cashBalance: 5000,
      excludedCoins: ['DOGE']
    };

    component.initialPortfolio = initialPortfolio;
    component.ngOnChanges();

    expect(component.holdingsArray.length).toBe(2);
    expect(component.holdingsArray.at(0).value).toEqual({
      symbol: 'BTC',
      amount: 0.5
    });
    expect(component.holdingsArray.at(1).value).toEqual({
      symbol: 'ETH',
      amount: 10
    });
    expect(component.portfolioForm.get('cashBalance')?.value).toBe(5000);
    expect(component.excludedCoins).toEqual(['DOGE']);
  });

  it('should emit portfolio on form submission', () => {
    const portfolioSubmittedSpy = jest.spyOn(component.portfolioSubmitted, 'emit');
    
    // Set valid form data
    component.holdingsArray.at(0).patchValue({
      symbol: 'BTC',
      amount: 1
    });
    component.portfolioForm.patchValue({
      cashBalance: 1000
    });

    component.onSubmit();

    expect(portfolioSubmittedSpy).toHaveBeenCalledWith({
      holdings: [{ symbol: 'BTC', amount: 1 }],
      cashBalance: 1000,
      excludedCoins: []
    });
  });

  it('should not submit invalid form', () => {
    const portfolioSubmittedSpy = jest.spyOn(component.portfolioSubmitted, 'emit');
    
    // Leave form invalid (no symbol)
    component.onSubmit();

    expect(portfolioSubmittedSpy).not.toHaveBeenCalled();
  });

  it('should emit portfolio changes when form changes', (done) => {
    const portfolioChangedSpy = jest.spyOn(component.portfolioChanged, 'emit');
    
    // Set valid form data
    component.holdingsArray.at(0).patchValue({
      symbol: 'BTC',
      amount: 1
    });
    component.portfolioForm.patchValue({
      cashBalance: 1000
    });

    // Wait for debounced emission
    setTimeout(() => {
      expect(portfolioChangedSpy).toHaveBeenCalled();
      done();
    }, 350);
  });

  it('should filter out invalid holdings when building portfolio', () => {
    // Add multiple holdings with some invalid
    component.addHolding();
    component.addHolding();
    
    component.holdingsArray.at(0).patchValue({
      symbol: 'BTC',
      amount: 1
    });
    component.holdingsArray.at(1).patchValue({
      symbol: '', // Invalid - no symbol
      amount: 1
    });
    component.holdingsArray.at(2).patchValue({
      symbol: 'ETH',
      amount: 0 // Invalid - zero amount
    });

    const portfolio = (component as any).buildPortfolio();

    expect(portfolio.holdings).toHaveLength(1);
    expect(portfolio.holdings[0]).toEqual({
      symbol: 'BTC',
      amount: 1
    });
  });
});