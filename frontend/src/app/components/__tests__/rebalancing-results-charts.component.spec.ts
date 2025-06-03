import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { RebalancingResultsComponent } from '../rebalancing-results/rebalancing-results.component';
import { PortfolioUrlService } from '../../services/portfolio-url.service';

describe('RebalancingResultsComponent - Charts', () => {
  let component: RebalancingResultsComponent;
  let fixture: ComponentFixture<RebalancingResultsComponent>;
  let mockPortfolioUrlService: any;

  const mockPortfolio = {
    holdings: [
      { symbol: 'BTC', amount: 0.1, currentValue: 5000 },
      { symbol: 'ETH', amount: 2, currentValue: 6000 }
    ],
    cashBalance: 1000,
    excludedCoins: []
  };

  const mockResult = {
    currentValue: 12000,
    targetAllocations: [
      { symbol: 'BTC', targetPercentage: 60, targetValue: 7200, targetAmount: 0.144 },
      { symbol: 'ETH', targetPercentage: 25, targetValue: 3000, targetAmount: 1.0 },
      { symbol: 'XRP', targetPercentage: 15, targetValue: 1800, targetAmount: 3000 }
    ],
    trades: [],
    summary: { totalBuys: 0, totalSells: 0, estimatedFees: 0 }
  };

  beforeEach(async () => {
    mockPortfolioUrlService = {
      generateShareableUrl: jest.fn().mockReturnValue('http://test.com')
    };

    await TestBed.configureTestingModule({
      imports: [
        RebalancingResultsComponent,
        NoopAnimationsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: PortfolioUrlService, useValue: mockPortfolioUrlService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RebalancingResultsComponent);
    component = fixture.componentInstance;
    component.portfolio = mockPortfolio;
    component.result = mockResult;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Chart Data Processing', () => {
    it('should calculate current portfolio chart data correctly', () => {
      const chartData = component.getCurrentPortfolioChartData();
      
      expect(chartData).toHaveLength(3); // BTC, ETH, CASH
      
      // Check BTC data
      const btcData = chartData.find(item => item.symbol === 'BTC');
      expect(btcData).toBeDefined();
      expect(btcData!.value).toBeCloseTo(5000, 1);
      expect(btcData!.percentage).toBeCloseTo(41.67, 1); // 5000/12000 * 100
      
      // Check ETH data
      const ethData = chartData.find(item => item.symbol === 'ETH');
      expect(ethData).toBeDefined();
      expect(ethData!.value).toBe(6000);
      expect(ethData!.percentage).toBe(50); // 6000/12000 * 100
      
      // Check CASH data
      const cashData = chartData.find(item => item.symbol === 'CASH');
      expect(cashData).toBeDefined();
      expect(cashData!.value).toBe(1000);
      expect(cashData!.percentage).toBeCloseTo(8.33, 1); // 1000/12000 * 100
    });

    it('should calculate target portfolio chart data correctly', () => {
      const chartData = component.getTargetPortfolioChartData();
      
      expect(chartData).toHaveLength(3); // BTC, ETH, XRP
      
      // Should be sorted by percentage descending
      expect(chartData[0].symbol).toBe('BTC');
      expect(chartData[0].percentage).toBe(60);
      
      expect(chartData[1].symbol).toBe('ETH');
      expect(chartData[1].percentage).toBe(25);
      
      expect(chartData[2].symbol).toBe('XRP');
      expect(chartData[2].percentage).toBe(15);
    });

    it('should generate Y-axis labels correctly', () => {
      const currentLabels = component.getYAxisLabels('current');
      const targetLabels = component.getYAxisLabels('target');
      
      expect(currentLabels.length).toBeGreaterThan(0);
      expect(targetLabels.length).toBeGreaterThan(0);
      
      // Labels should include percentage signs
      expect(currentLabels[0]).toContain('%');
      expect(targetLabels[0]).toContain('%');
    });

    it('should provide consistent colors by symbol', () => {
      const btcColor1 = component.getColorBySymbol('BTC');
      const btcColor2 = component.getColorBySymbol('BTC');
      const ethColor = component.getColorBySymbol('ETH');
      
      // Same symbol should have same color
      expect(btcColor1).toBe(btcColor2);
      
      // Different symbols should have different colors
      expect(btcColor1).not.toBe(ethColor);
    });
  });

  describe('Tooltip Functionality', () => {
    it('should show tooltip with correct data', () => {
      const mockEvent = {
        clientX: 100,
        clientY: 200
      } as MouseEvent;
      
      const testItem = {
        symbol: 'BTC',
        value: 5000,
        percentage: 50,
        heightPercent: 50
      };
      
      component.showTooltip(mockEvent, testItem, 'current');
      
      expect(component.tooltipVisible).toBe(true);
      expect(component.tooltipX).toBe(110); // clientX + 10
      expect(component.tooltipY).toBe(190); // clientY - 10
      expect(component.tooltipData.symbol).toBe('BTC');
      expect(component.tooltipData.value).toBe(5000);
      expect(component.tooltipData.percentage).toBe(50);
    });

    it('should hide tooltip', () => {
      component.tooltipVisible = true;
      component.hideTooltip();
      expect(component.tooltipVisible).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty portfolio holdings', () => {
      component.portfolio = { holdings: [], cashBalance: 1000, excludedCoins: [] };
      component.result = { ...mockResult, currentValue: 1000 };
      
      const chartData = component.getCurrentPortfolioChartData();
      
      expect(chartData).toHaveLength(1); // Only CASH
      expect(chartData[0].symbol).toBe('CASH');
      expect(chartData[0].percentage).toBe(100);
    });

    it('should handle portfolio with no cash', () => {
      component.portfolio = { ...mockPortfolio, cashBalance: 0 };
      
      const chartData = component.getCurrentPortfolioChartData();
      
      // Should not include CASH item
      expect(chartData.find(item => item.symbol === 'CASH')).toBeUndefined();
    });

    it('should handle empty target allocations', () => {
      component.result = { ...mockResult, targetAllocations: [] };
      
      const chartData = component.getTargetPortfolioChartData();
      const yAxisLabels = component.getYAxisLabels('target');
      
      expect(chartData).toHaveLength(0);
      expect(yAxisLabels).toEqual(['0%']);
    });
  });
});