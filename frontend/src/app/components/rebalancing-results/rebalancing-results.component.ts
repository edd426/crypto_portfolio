import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Portfolio, RebalanceResult, TradeRecommendation, PortfolioMetrics } from '../../models/portfolio.model';

interface ChartDataItem {
  symbol: string;
  value: number;
  percentage: number;
  heightPercent: number; // Height in pixels for chart bar
}

interface AllocationDataItem {
  symbol: string;
  currentPercentage: number;
  currentValue: number;
  currentAmount: number;
  targetPercentage: number;
  targetValue: number;
  targetAmount: number;
}

@Component({
  selector: 'app-rebalancing-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
  ],
  template: `
    <div class="results-container">
      
      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Portfolio Value</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{result.currentValue | currency:'USD':'symbol':'1.2-2'}}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Number of Holdings</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{metrics.numberOfHoldings}}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Estimated Fees</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{result.summary.estimatedFees | currency:'USD':'symbol':'1.2-2'}}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-header>
            <mat-card-title>Largest Position</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="metric-value">{{metrics.largestPosition.symbol}}</div>
            <div class="metric-subtitle">{{metrics.largestPosition.percentage | number:'1.1-1'}}%</div>
          </mat-card-content>
        </mat-card>
      </div>


      <!-- Charts and Tables -->
      <mat-tab-group>
        
        <!-- Portfolio Composition Tab -->
        <mat-tab label="Portfolio Composition">
          <div class="tab-content">
            <div class="charts-row">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Current Portfolio</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-container" (mouseleave)="hideTooltip()">
                    <!-- Y-axis labels -->
                    <div class="y-axis">
                      <div class="y-label" *ngFor="let label of getYAxisLabels('current')">{{label}}</div>
                    </div>
                    <div class="chart-with-axis">
                      <div class="simple-chart" (mouseleave)="hideTooltip()">
                        <div *ngFor="let item of getCurrentPortfolioChartData(); let i = index" 
                             class="chart-item"
                             (mouseenter)="showTooltip($event, item, 'current')"
                             (mouseleave)="hideTooltip()"
                             (mousemove)="updateTooltipPosition($event)">
                          <div class="chart-bar" 
                               [style.height]="item.heightPercent + 'px'"
                               [style.background-color]="getColorBySymbol(item.symbol)"
                               [title]="item.symbol + ': ' + item.percentage.toFixed(1) + '%'">
                          </div>
                          <div class="chart-label">{{item.symbol}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Target Portfolio</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="chart-container" (mouseleave)="hideTooltip()">
                    <!-- Y-axis labels -->
                    <div class="y-axis">
                      <div class="y-label" *ngFor="let label of getYAxisLabels('target')">{{label}}</div>
                    </div>
                    <div class="chart-with-axis">
                      <div class="simple-chart" (mouseleave)="hideTooltip()">
                        <div *ngFor="let item of getTargetPortfolioChartData(); let i = index" 
                             class="chart-item"
                             (mouseenter)="showTooltip($event, item, 'target')"
                             (mouseleave)="hideTooltip()"
                             (mousemove)="updateTooltipPosition($event)">
                          <div class="chart-bar" 
                               [style.height]="item.heightPercent + 'px'"
                               [style.background-color]="getColorBySymbol(item.symbol)"
                               [title]="item.symbol + ': ' + item.percentage.toFixed(1) + '%'">
                          </div>
                          <div class="chart-label">{{item.symbol}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <!-- Trade Recommendations Tab -->
        <mat-tab label="Trade Recommendations">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Required Trades</mat-card-title>
                <mat-card-subtitle>
                  Total Buys: {{result.summary.totalBuys | currency:'USD':'symbol':'1.2-2'}} | 
                  Total Sells: {{result.summary.totalSells | currency:'USD':'symbol':'1.2-2'}}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="result.trades" class="trades-table">
                  
                  <ng-container matColumnDef="symbol">
                    <th mat-header-cell *matHeaderCellDef>Coin</th>
                    <td mat-cell *matCellDef="let trade">{{trade.symbol}}</td>
                  </ng-container>

                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef>Action</th>
                    <td mat-cell *matCellDef="let trade">
                      <span [class]="'action-' + trade.action.toLowerCase()">
                        {{trade.action}}
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef>Amount</th>
                    <td mat-cell *matCellDef="let trade">
                      {{trade.amount | number:'1.2-6'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="usdValue">
                    <th mat-header-cell *matHeaderCellDef>USD Value</th>
                    <td mat-cell *matCellDef="let trade">
                      {{trade.usdValue | currency:'USD':'symbol':'1.2-2'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="currentHolding">
                    <th mat-header-cell *matHeaderCellDef>Current</th>
                    <td mat-cell *matCellDef="let trade">
                      {{trade.currentHolding | number:'1.2-6'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="targetHolding">
                    <th mat-header-cell *matHeaderCellDef>Target</th>
                    <td mat-cell *matCellDef="let trade">
                      {{trade.targetHolding | number:'1.2-6'}}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="tradesDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: tradesDisplayedColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Allocations Tab -->
        <mat-tab label="Allocations">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Portfolio Allocations</mat-card-title>
                <mat-card-subtitle>Current vs Target allocations including cash holdings</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="getAllocationData()" class="allocations-table">
                  
                  <ng-container matColumnDef="symbol">
                    <th mat-header-cell *matHeaderCellDef>Coin</th>
                    <td mat-cell *matCellDef="let allocation">{{allocation.symbol}}</td>
                  </ng-container>

                  <ng-container matColumnDef="currentPercentage">
                    <th mat-header-cell *matHeaderCellDef>Current %</th>
                    <td mat-cell *matCellDef="let allocation">
                      {{allocation.currentPercentage | number:'1.2-2'}}%
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="currentValue">
                    <th mat-header-cell *matHeaderCellDef>Current Value</th>
                    <td mat-cell *matCellDef="let allocation">
                      {{allocation.currentValue | currency:'USD':'symbol':'1.2-2'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="currentAmount">
                    <th mat-header-cell *matHeaderCellDef>Current Amount</th>
                    <td mat-cell *matCellDef="let allocation">
                      {{allocation.currentAmount | number:'1.2-6'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="targetPercentage">
                    <th mat-header-cell *matHeaderCellDef>Target %</th>
                    <td mat-cell *matCellDef="let allocation">
                      {{allocation.targetPercentage | number:'1.2-2'}}%
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="targetValue">
                    <th mat-header-cell *matHeaderCellDef>Target Value</th>
                    <td mat-cell *matCellDef="let allocation">
                      {{allocation.targetValue | currency:'USD':'symbol':'1.2-2'}}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="targetAmount">
                    <th mat-header-cell *matHeaderCellDef>Target Amount</th>
                    <td mat-cell *matCellDef="let allocation">
                      {{allocation.targetAmount | number:'1.2-6'}}
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="allocationsDisplayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: allocationsDisplayedColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>


      <!-- Tooltip -->
      <div class="chart-tooltip" 
           [style.display]="tooltipVisible ? 'block' : 'none'"
           [style.left.px]="tooltipX"
           [style.top.px]="tooltipY">
        <div class="tooltip-content">
          <strong>{{tooltipData.symbol}}</strong><br>
          <span>Value: {{tooltipData.value | currency:'USD':'symbol':'1.2-2'}}</span><br>
          <span>Percentage: {{tooltipData.percentage | number:'1.2-2'}}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-container {
      margin-top: 24px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }


    .summary-card {
      text-align: center;
    }

    .metric-value {
      font-size: 2em;
      font-weight: 500;
      color: #1976d2;
    }

    .metric-subtitle {
      font-size: 0.9em;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .chart-card {
      min-height: 400px;
    }

    .chart-container {
      height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .y-axis {
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-between;
      height: 250px;
      width: 60px;
      padding: 20px 10px 30px 0;
      font-size: 11px;
      color: #666;
    }

    .y-label {
      text-align: right;
      line-height: 1;
    }

    .chart-with-axis {
      flex: 1;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .simple-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      height: 250px;
      width: 100%;
      padding: 20px 20px 30px 0;
      border-left: 2px solid #e0e0e0;
      border-bottom: 2px solid #e0e0e0;
    }

    .chart-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 3px;
      cursor: pointer;
    }

    .chart-item:hover .chart-bar {
      opacity: 0.8;
      transform: scaleX(1.1);
    }

    .chart-bar {
      width: 28px;
      min-height: 10px;
      margin-bottom: 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.1);
    }

    .chart-label {
      font-size: 11px;
      font-weight: 500;
      text-align: center;
      max-width: 40px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chart-tooltip {
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.2s ease;
    }

    .tooltip-content {
      line-height: 1.4;
    }

    .trades-table, .allocations-table {
      width: 100%;
    }

    .allocations-table {
      font-size: 14px;
    }

    .allocations-table .mat-column-symbol {
      font-weight: 500;
    }

    .allocations-table .mat-column-currentPercentage,
    .allocations-table .mat-column-targetPercentage {
      text-align: right;
    }

    .allocations-table .mat-column-currentValue,
    .allocations-table .mat-column-targetValue {
      text-align: right;
    }

    .allocations-table .mat-column-currentAmount,
    .allocations-table .mat-column-targetAmount {
      text-align: right;
    }

    .action-buy {
      color: #4caf50;
      font-weight: 500;
    }

    .action-sell {
      color: #f44336;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .charts-row {
        grid-template-columns: 1fr;
      }
      
      .summary-cards {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }
  `]
})
export class RebalancingResultsComponent implements OnInit, OnDestroy {
  @Input() result!: RebalanceResult;
  @Input() portfolio!: Portfolio;

  metrics!: PortfolioMetrics;

  // Debug verbosity levels: 0=none, 1=errors, 2=warnings, 3=info, 4=verbose
  private debugLevel = 0;

  // Table columns
  tradesDisplayedColumns: string[] = ['symbol', 'action', 'amount', 'usdValue', 'currentHolding', 'targetHolding'];
  allocationsDisplayedColumns: string[] = ['symbol', 'currentPercentage', 'currentValue', 'currentAmount', 'targetPercentage', 'targetValue', 'targetAmount'];

  // Tooltip properties
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipData: any = {};

  constructor() {}

  ngOnInit(): void {
    // Check for debug level in localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug') || localStorage.getItem('portfolioDebugLevel');
    if (debugParam) {
      this.debugLevel = parseInt(debugParam, 10) || 0;
      this.debugLog(1, 'Debug level set to:', this.debugLevel);
    }

    this.calculateMetrics();
    // Add global click listener to hide tooltip
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    // Clean up global event listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  onDocumentClick(): void {
    // Hide tooltip when clicking anywhere
    this.hideTooltip();
  }

  private debugLog(level: number, ...args: any[]): void {
    if (this.debugLevel >= level && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const prefix = level === 1 ? '[ERROR]' : level === 2 ? '[WARN]' : level === 3 ? '[INFO]' : '[DEBUG]';
      console.log(prefix, ...args);
    }
  }

  private calculateMetrics(): void {
    const totalValue = this.result.currentValue;
    const numberOfHoldings = this.portfolio.holdings.length;
    
    // Find largest position
    let largestPosition = { symbol: 'N/A', percentage: 0 };
    if (this.result.targetAllocations.length > 0) {
      const largest = this.result.targetAllocations.reduce((prev, current) => 
        (prev.targetPercentage > current.targetPercentage) ? prev : current
      );
      largestPosition = {
        symbol: largest.symbol,
        percentage: largest.targetPercentage
      };
    }

    // Calculate diversity score (simplified Herfindahl-Hirschman Index)
    const diversityScore = this.result.targetAllocations.length > 0 ? 
      100 - this.result.targetAllocations.reduce((sum, allocation) => 
        sum + Math.pow(allocation.targetPercentage, 2), 0) / 100 : 0;

    this.metrics = {
      totalValue,
      numberOfHoldings,
      largestPosition,
      diversityScore
    };
  }

  getColor(index: number): string {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];
    
    return colors[index % colors.length];
  }

  getColorBySymbol(symbol: string): string {
    // Create consistent colors based on symbol instead of array index
    const symbols = [...new Set([
      ...this.portfolio.holdings.map(h => h.symbol),
      ...this.result.targetAllocations.map(a => a.symbol)
    ])].sort();
    
    const index = symbols.indexOf(symbol);
    return this.getColor(index);
  }

  getCurrentPortfolioChartData(): ChartDataItem[] {
    if (!this.portfolio.holdings || !this.result) return [];
    
    // Calculate current values and percentages
    const items: ChartDataItem[] = this.portfolio.holdings.map(holding => {
      let currentPrice = 0;
      let currentValue = 0;
      
      // First try to get price from target allocations
      const allocation = this.result.targetAllocations.find(a => a.symbol === holding.symbol);
      
      if (allocation && allocation.targetAmount > 0) {
        currentPrice = allocation.targetValue / allocation.targetAmount;
        currentValue = holding.amount * currentPrice;
        this.debugLog(4, `${holding.symbol}: found allocation, price=${currentPrice}`);
      } else {
        // For excluded coins, get current value from trade data
        const trade = this.result.trades.find(t => t.symbol === holding.symbol);
        if (trade) {
          // For excluded coins, the trade will be a SELL of the entire holding
          // So trade.usdValue represents the total current value of the holding
          if (trade.action === 'SELL' && trade.amount === holding.amount) {
            currentValue = trade.usdValue;
            currentPrice = trade.usdValue / holding.amount;
            this.debugLog(3, `${holding.symbol}: excluded coin, current value=${currentValue} from trade data`);
          } else {
            // Fallback calculation if trade structure is different
            currentPrice = trade.usdValue / trade.amount;
            currentValue = currentPrice * holding.amount;
            this.debugLog(3, `${holding.symbol}: excluded coin, calculated value=${currentValue} from trade price`);
          }
        } else {
          this.debugLog(1, `${holding.symbol}: No price data available in allocations or trades`);
          currentValue = 0;
        }
      }
      
      const percentage = this.result.currentValue > 0 ? (currentValue / this.result.currentValue) * 100 : 0;
      this.debugLog(4, `${holding.symbol}: currentValue=${currentValue}, percentage=${percentage}%`);
      
      return {
        symbol: holding.symbol,
        value: currentValue,
        percentage: percentage,
        heightPercent: percentage
      };
    });

    // Add cash as a separate item if there's cash balance
    if (this.portfolio.cashBalance > 0) {
      const cashPercentage = (this.portfolio.cashBalance / this.result.currentValue) * 100;
      items.push({
        symbol: 'CASH',
        value: this.portfolio.cashBalance,
        percentage: cashPercentage,
        heightPercent: cashPercentage
      });
    }

    const sortedItems = items.sort((a, b) => b.percentage - a.percentage);

    // Normalize bar heights to use full chart space while maintaining proportions
    const maxPercentage = Math.max(...sortedItems.map(item => item.percentage));
    this.debugLog(4, 'Current Portfolio - maxPercentage:', maxPercentage);
    this.debugLog(4, 'Current Portfolio - sortedItems before normalization:', sortedItems.map(item => ({symbol: item.symbol, percentage: item.percentage})));
    
    if (maxPercentage > 0) {
      sortedItems.forEach(item => {
        // Scale to use 200px max height (80% of 250px chart), with minimum 10px for visibility
        const maxHeightPx = 200;
        const scaledHeight = Math.max((item.percentage / maxPercentage) * maxHeightPx, 10);
        item.heightPercent = scaledHeight;
        this.debugLog(4, `${item.symbol}: percentage=${item.percentage}%, heightPercent=${scaledHeight}px`);
      });
    } else {
      // If all percentages are 0, set small default heights
      sortedItems.forEach(item => {
        item.heightPercent = 20;
        this.debugLog(3, `${item.symbol}: zero percentage, setting heightPercent=20px`);
      });
    }
    
    this.debugLog(4, 'Current Portfolio - final chart data:', sortedItems);

    return sortedItems;
  }

  getTargetPortfolioChartData(): ChartDataItem[] {
    if (!this.result.targetAllocations) return [];
    
    const data = this.result.targetAllocations
      .map(allocation => ({
        symbol: allocation.symbol,
        value: allocation.targetValue,
        percentage: allocation.targetPercentage,
        heightPercent: allocation.targetPercentage
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Normalize bar heights to use full chart space while maintaining proportions
    const maxPercentage = Math.max(...data.map(item => item.percentage));
    this.debugLog(4, 'Target Portfolio - maxPercentage:', maxPercentage);
    this.debugLog(4, 'Target Portfolio - data before normalization:', data.map(item => ({symbol: item.symbol, percentage: item.percentage})));
    
    if (maxPercentage > 0) {
      data.forEach(item => {
        // Scale to use 200px max height (80% of 250px chart), with minimum 10px for visibility
        const maxHeightPx = 200;
        const scaledHeight = Math.max((item.percentage / maxPercentage) * maxHeightPx, 10);
        item.heightPercent = scaledHeight;
        this.debugLog(4, `Target ${item.symbol}: percentage=${item.percentage}%, heightPercent=${scaledHeight}px`);
      });
    } else {
      // Fallback if no data
      data.forEach(item => {
        item.heightPercent = 20;
        this.debugLog(3, `Target ${item.symbol}: zero percentage, setting heightPercent=20px`);
      });
    }
    
    this.debugLog(4, 'Target Portfolio - final chart data:', data);

    return data;
  }

  getYAxisLabels(chartType: 'current' | 'target'): string[] {
    const data = chartType === 'current' ? this.getCurrentPortfolioChartData() : this.getTargetPortfolioChartData();
    if (!data.length) return ['0%'];
    
    // Use the actual percentage values, not the normalized heights
    const maxPercentage = Math.max(...data.map(item => item.percentage));
    this.debugLog(4, `Y-Axis ${chartType} - maxPercentage:`, maxPercentage);
    if (maxPercentage === 0) return ['0%'];
    
    const steps = 5;
    const stepSize = Math.max(Math.ceil(maxPercentage / steps), 1);
    this.debugLog(4, `Y-Axis ${chartType} - stepSize:`, stepSize);
    
    // Generate labels from 0 to max, so when CSS reverses them with column-reverse, max appears at top
    const labels: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const value = Math.round(i * stepSize);
      if (value <= maxPercentage + stepSize) {
        labels.push(`${value}%`);
      }
    }
    
    this.debugLog(4, `Y-Axis ${chartType} - labels:`, labels);
    return labels; // CSS flex-direction: column-reverse will put first item (0%) at bottom
  }

  showTooltip(event: MouseEvent, item: ChartDataItem, chartType: 'current' | 'target'): void {
    this.tooltipVisible = true;
    this.updateTooltipPosition(event);
    this.tooltipData = {
      symbol: item.symbol,
      value: item.value,
      percentage: item.percentage
    };
  }

  updateTooltipPosition(event: MouseEvent): void {
    this.tooltipX = event.clientX + 10;
    this.tooltipY = event.clientY - 10;
  }

  hideTooltip(): void {
    this.debugLog(4, 'hideTooltip called');
    this.tooltipVisible = false;
    this.tooltipData = {};
  }

  getAllocationData(): AllocationDataItem[] {
    if (!this.result || !this.portfolio) return [];

    // Create a map to store combined data
    const allocationMap = new Map<string, AllocationDataItem>();

    // First, add all target allocations
    this.result.targetAllocations.forEach(target => {
      allocationMap.set(target.symbol, {
        symbol: target.symbol,
        currentPercentage: 0,
        currentValue: 0,
        currentAmount: 0,
        targetPercentage: target.targetPercentage,
        targetValue: target.targetValue,
        targetAmount: target.targetAmount
      });
    });

    // Then, add current holdings data
    this.portfolio.holdings.forEach(holding => {
      let currentPrice = 0;
      let currentValue = 0;

      // Try to get price from target allocations first
      const targetAllocation = this.result.targetAllocations.find(a => a.symbol === holding.symbol);
      if (targetAllocation && targetAllocation.targetAmount > 0) {
        currentPrice = targetAllocation.targetValue / targetAllocation.targetAmount;
        currentValue = holding.amount * currentPrice;
      } else {
        // For excluded coins, get current value from trade data
        const trade = this.result.trades.find(t => t.symbol === holding.symbol);
        if (trade) {
          if (trade.action === 'SELL' && trade.amount === holding.amount) {
            currentValue = trade.usdValue;
          } else {
            currentPrice = trade.usdValue / trade.amount;
            currentValue = currentPrice * holding.amount;
          }
        }
      }

      const currentPercentage = this.result.currentValue > 0 ? (currentValue / this.result.currentValue) * 100 : 0;

      // Update existing entry or create new one
      const existing = allocationMap.get(holding.symbol);
      if (existing) {
        existing.currentPercentage = currentPercentage;
        existing.currentValue = currentValue;
        existing.currentAmount = holding.amount;
      } else {
        // This is a holding not in target allocations (excluded coin)
        allocationMap.set(holding.symbol, {
          symbol: holding.symbol,
          currentPercentage: currentPercentage,
          currentValue: currentValue,
          currentAmount: holding.amount,
          targetPercentage: 0,
          targetValue: 0,
          targetAmount: 0
        });
      }
    });

    // Add cash as a row
    if (this.portfolio.cashBalance > 0) {
      const cashPercentage = (this.portfolio.cashBalance / this.result.currentValue) * 100;
      allocationMap.set('CASH', {
        symbol: 'CASH',
        currentPercentage: cashPercentage,
        currentValue: this.portfolio.cashBalance,
        currentAmount: this.portfolio.cashBalance, // For cash, amount = value
        targetPercentage: 0,
        targetValue: 0,
        targetAmount: 0
      });
    }

    // Convert to array and sort by current value descending
    return Array.from(allocationMap.values())
      .sort((a, b) => b.currentValue - a.currentValue);
  }

}