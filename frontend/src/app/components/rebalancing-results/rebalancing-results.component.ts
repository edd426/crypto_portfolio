import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Portfolio, RebalanceResult, TradeRecommendation, PortfolioMetrics } from '../../models/portfolio.model';
import { PortfolioUrlService } from '../../services/portfolio-url.service';

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
                  <div class="chart-container">
                    <div class="simple-chart">
                      <div *ngFor="let holding of portfolio.holdings; let i = index" class="chart-item">
                        <div class="chart-bar" 
                             [style.height.%]="(holding.currentValue || 0) / result.currentValue * 100"
                             [style.background-color]="getColor(i)">
                        </div>
                        <div class="chart-label">{{holding.symbol}}</div>
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
                  <div class="chart-container">
                    <div class="simple-chart">
                      <div *ngFor="let allocation of result.targetAllocations; let i = index" class="chart-item">
                        <div class="chart-bar" 
                             [style.height.%]="allocation.targetPercentage"
                             [style.background-color]="getColor(i)">
                        </div>
                        <div class="chart-label">{{allocation.symbol}}</div>
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

        <!-- Target Allocations Tab -->
        <mat-tab label="Target Allocations">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Market Cap Weighted Allocations</mat-card-title>
                <mat-card-subtitle>Based on top 15 cryptocurrencies by market capitalization</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="result.targetAllocations" class="allocations-table">
                  
                  <ng-container matColumnDef="symbol">
                    <th mat-header-cell *matHeaderCellDef>Coin</th>
                    <td mat-cell *matCellDef="let allocation">{{allocation.symbol}}</td>
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

      <!-- Actions -->
      <div class="actions">
        <button mat-raised-button color="primary" (click)="generateShareableLink()">
          <mat-icon>share</mat-icon>
          Generate Shareable Link
        </button>
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
      padding: 20px;
    }

    .chart-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 5px;
    }

    .chart-bar {
      width: 30px;
      min-height: 10px;
      margin-bottom: 8px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .chart-label {
      font-size: 12px;
      font-weight: 500;
      text-align: center;
    }

    .trades-table, .allocations-table {
      width: 100%;
    }

    .action-buy {
      color: #4caf50;
      font-weight: 500;
    }

    .action-sell {
      color: #f44336;
      font-weight: 500;
    }

    .actions {
      display: flex;
      justify-content: center;
      margin-top: 24px;
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
export class RebalancingResultsComponent implements OnInit {
  @Input() result!: RebalanceResult;
  @Input() portfolio!: Portfolio;

  metrics!: PortfolioMetrics;

  // Table columns
  tradesDisplayedColumns: string[] = ['symbol', 'action', 'amount', 'usdValue', 'currentHolding', 'targetHolding'];
  allocationsDisplayedColumns: string[] = ['symbol', 'targetPercentage', 'targetValue', 'targetAmount'];

  constructor(
    private portfolioUrlService: PortfolioUrlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.calculateMetrics();
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

  generateShareableLink(): void {
    const shareableUrl = this.portfolioUrlService.generateShareableUrl(this.portfolio);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      this.snackBar.open('Shareable link copied to clipboard!', 'Dismiss', {
        duration: 3000
      });
    }).catch(() => {
      // Fallback for older browsers
      this.snackBar.open(`Shareable link: ${shareableUrl}`, 'Dismiss', {
        duration: 10000
      });
    });
  }
}