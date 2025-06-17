import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';

import { BacktestingService, BacktestConfig, BacktestResult } from '../../services/backtesting.service';
import { HistoricalDataService } from '../../services/historical-data.service';
import { BacktestingErrorHandler, BacktestingError } from '../../utils/error-handler.util';

@Component({
  selector: 'app-backtesting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <mat-card class="backtesting-container">
      <mat-card-header>
        <mat-card-title>Portfolio Backtesting</mat-card-title>
        <mat-card-subtitle>Test your rebalancing strategy with historical data</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Configuration Form -->
        <form [formGroup]="configForm" *ngIf="!isRunning && !result">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" readonly>
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-error *ngIf="configForm.get('startDate')?.errors?.['required']">
                Start date is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" readonly>
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
              <mat-error *ngIf="configForm.get('endDate')?.errors?.['required']">
                End date is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Initial Investment ($)</mat-label>
              <input matInput type="number" formControlName="initialValue" min="100" step="100">
              <mat-error *ngIf="configForm.get('initialValue')?.errors?.['required']">
                Initial investment is required
              </mat-error>
              <mat-error *ngIf="configForm.get('initialValue')?.errors?.['min']">
                Minimum investment is $100
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Rebalancing Frequency</mat-label>
              <mat-select formControlName="rebalanceFrequency">
                <mat-option value="monthly">Monthly</mat-option>
                <mat-option value="quarterly">Quarterly</mat-option>
                <mat-option value="yearly">Yearly</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Max Coins in Portfolio</mat-label>
              <input matInput type="number" formControlName="maxCoins" min="5" max="50">
              <mat-error *ngIf="configForm.get('maxCoins')?.errors?.['min']">
                Minimum 5 coins required
              </mat-error>
              <mat-error *ngIf="configForm.get('maxCoins')?.errors?.['max']">
                Maximum 50 coins allowed
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Transaction Fee (%)</mat-label>
              <input matInput type="number" formControlName="transactionFeePercent" min="0" max="5" step="0.1">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Slippage (%)</mat-label>
              <input matInput type="number" formControlName="slippagePercent" min="0" max="2" step="0.1">
            </mat-form-field>
          </div>

          <div class="excluded-coins-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Excluded Coins (comma-separated)</mat-label>
              <input matInput formControlName="excludedCoinsText" placeholder="e.g., DOGE, SHIB, SAFEMOON">
              <mat-hint>Enter coin symbols to exclude from the portfolio</mat-hint>
            </mat-form-field>
            
            <div class="excluded-chips" *ngIf="excludedCoins.length > 0">
              <mat-chip-listbox>
                <mat-chip-option *ngFor="let coin of excludedCoins" (removed)="removeCoin(coin)">
                  {{coin}}
                  <mat-icon matChipRemove>cancel</mat-icon>
                </mat-chip-option>
              </mat-chip-listbox>
            </div>
          </div>
        </form>

        <!-- Loading State -->
        <div *ngIf="isRunning" class="loading-container">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p class="loading-text">{{ loadingMessage }}</p>
          <button mat-stroked-button (click)="cancelBacktest()" class="cancel-button">
            Cancel
          </button>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <h3>{{ error.message }}</h3>
          <div class="error-actions">
            <button mat-button *ngFor="let action of error.actions" (click)="handleErrorAction(action)">
              {{ action }}
            </button>
          </div>
        </div>

        <!-- Results -->
        <div *ngIf="result" class="results-container">
          <div class="results-header">
            <h3>Backtest Results</h3>
            <button mat-stroked-button (click)="startNewBacktest()">
              <mat-icon>refresh</mat-icon>
              New Backtest
            </button>
          </div>

          <mat-tab-group>
            <!-- Summary Tab -->
            <mat-tab label="Summary">
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">{{ formatPercentage(result.metrics.totalReturn) }}</div>
                  <div class="metric-label">Total Return</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ formatPercentage(result.metrics.annualizedReturn) }}</div>
                  <div class="metric-label">Annualized Return</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ formatPercentage(result.metrics.volatility) }}</div>
                  <div class="metric-label">Volatility</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ result.metrics.sharpeRatio.toFixed(2) }}</div>
                  <div class="metric-label">Sharpe Ratio</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ formatPercentage(result.metrics.maxDrawdown) }}</div>
                  <div class="metric-label">Max Drawdown</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ formatCurrency(result.metrics.totalFees) }}</div>
                  <div class="metric-label">Total Fees</div>
                </div>
              </div>
            </mat-tab>

            <!-- Performance Chart Tab -->
            <mat-tab label="Performance">
              <div class="chart-container">
                <canvas #performanceChart></canvas>
              </div>
            </mat-tab>

            <!-- Portfolio History Tab -->
            <mat-tab label="Portfolio History">
              <mat-table [dataSource]="portfolioTableData" class="portfolio-table">
                <ng-container matColumnDef="date">
                  <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ formatDate(row.date) }}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="totalValue">
                  <mat-header-cell *matHeaderCellDef>Total Value</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ formatCurrency(row.totalValue) }}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="topHoldings">
                  <mat-header-cell *matHeaderCellDef>Top Holdings</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ getTopHoldings(row.holdings) }}</mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="portfolioColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: portfolioColumns;"></mat-row>
              </mat-table>
            </mat-tab>

            <!-- Rebalancing Events Tab -->
            <mat-tab label="Rebalancing Events">
              <mat-table [dataSource]="rebalanceTableData" class="rebalance-table">
                <ng-container matColumnDef="date">
                  <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ formatDate(row.date) }}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="beforeValue">
                  <mat-header-cell *matHeaderCellDef>Value Before</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ formatCurrency(row.beforeValue) }}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="afterValue">
                  <mat-header-cell *matHeaderCellDef>Value After</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ formatCurrency(row.afterValue) }}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="fees">
                  <mat-header-cell *matHeaderCellDef>Fees</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ formatCurrency(row.fees) }}</mat-cell>
                </ng-container>

                <ng-container matColumnDef="trades">
                  <mat-header-cell *matHeaderCellDef>Trades</mat-header-cell>
                  <mat-cell *matCellDef="let row">{{ row.trades.length }}</mat-cell>
                </ng-container>

                <mat-header-row *matHeaderRowDef="rebalanceColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: rebalanceColumns;"></mat-row>
              </mat-table>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-card-content>

      <mat-card-actions *ngIf="!isRunning && !result">
        <button mat-raised-button color="primary" (click)="runBacktest()" [disabled]="!configForm.valid">
          <mat-icon>analytics</mat-icon>
          Run Backtest
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .backtesting-container {
      max-width: 1200px;
      margin: 20px auto;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .excluded-coins-section {
      margin-bottom: 20px;
    }

    .excluded-chips {
      margin-top: 8px;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
    }

    .loading-text {
      margin: 16px 0;
      font-size: 16px;
    }

    .cancel-button {
      margin-top: 16px;
    }

    .error-container {
      text-align: center;
      padding: 40px;
      color: #f44336;
    }

    .error-container mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .error-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 16px;
    }

    .results-container {
      margin-top: 20px;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }

    .metric-card {
      text-align: center;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #fafafa;
    }

    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }

    .chart-container {
      height: 400px;
      margin: 20px 0;
    }

    .portfolio-table,
    .rebalance-table {
      width: 100%;
      margin-top: 20px;
    }

    mat-tab-group {
      margin-top: 20px;
    }
  `]
})
export class BacktestingComponent implements OnInit, OnDestroy {
  configForm: FormGroup;
  isRunning = false;
  result: BacktestResult | null = null;
  error: { message: string; actions: string[] } | null = null;
  loadingMessage = 'Initializing backtest...';
  excludedCoins: string[] = [];
  
  portfolioTableData: any[] = [];
  rebalanceTableData: any[] = [];
  portfolioColumns = ['date', 'totalValue', 'topHoldings'];
  rebalanceColumns = ['date', 'beforeValue', 'afterValue', 'fees', 'trades'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private backtestingService: BacktestingService,
    private historicalDataService: HistoricalDataService
  ) {
    try {
      this.configForm = this.createForm();
    } catch (error) {
      console.error('BacktestingComponent: Form creation failed:', error);
      throw error;
    }
  }

  ngOnInit(): void {
    try {
      // Set default dates first (most critical)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 2); // Default to 2 years
      
      this.configForm.patchValue({
        startDate,
        endDate
      });

      // Watch excluded coins text changes
      this.configForm.get('excludedCoinsText')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.updateExcludedCoins(value);
        });

      // Prefetch common coin data (make this completely optional)
      try {
        if (this.historicalDataService && typeof this.historicalDataService.prefetchCommonCoins === 'function') {
          this.historicalDataService.prefetchCommonCoins();
        } else {
          console.warn('BacktestingComponent: prefetchCommonCoins method not available');
        }
      } catch (error) {
        console.warn('BacktestingComponent: Failed to prefetch common coins (non-critical):', error);
      }
      
    } catch (error) {
      console.error('BacktestingComponent: Critical error in ngOnInit:', error);
      // Set a basic error state but don't crash the component
      this.error = {
        message: 'Failed to initialize backtesting component',
        actions: ['Refresh the page']
      };
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      initialValue: [10000, [Validators.required, Validators.min(100)]],
      rebalanceFrequency: ['monthly', Validators.required],
      maxCoins: [15, [Validators.required, Validators.min(5), Validators.max(50)]],
      transactionFeePercent: [0.5, [Validators.min(0), Validators.max(5)]],
      slippagePercent: [0.1, [Validators.min(0), Validators.max(2)]],
      excludedCoinsText: ['']
    });
  }

  private updateExcludedCoins(text: string): void {
    if (!text) {
      this.excludedCoins = [];
      return;
    }

    this.excludedCoins = text
      .split(',')
      .map(coin => coin.trim().toUpperCase())
      .filter(coin => coin.length > 0);
  }

  removeCoin(coin: string): void {
    this.excludedCoins = this.excludedCoins.filter(c => c !== coin);
    const newText = this.excludedCoins.join(', ');
    this.configForm.patchValue({ excludedCoinsText: newText });
  }

  runBacktest(): void {
    if (!this.configForm.valid) {
      return;
    }

    this.isRunning = true;
    this.error = null;
    this.result = null;
    this.loadingMessage = 'Fetching historical data...';

    const formValue = this.configForm.value;
    const config: BacktestConfig = {
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      initialValue: formValue.initialValue,
      rebalanceFrequency: formValue.rebalanceFrequency,
      transactionFeePercent: formValue.transactionFeePercent,
      slippagePercent: formValue.slippagePercent,
      maxCoins: formValue.maxCoins,
      excludedCoins: this.excludedCoins
    };

    this.backtestingService.runBacktest(config)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.result = result;
          this.prepareTableData();
          this.isRunning = false;
          this.loadingMessage = '';
        },
        error: (error) => {
          // Error: Backtest failed
          
          const backtestError = error instanceof BacktestingError ? 
            error : 
            BacktestingErrorHandler.handleCalculationError(error, config);
          
          this.error = BacktestingErrorHandler.getUserMessage(backtestError);
          BacktestingErrorHandler.logError(backtestError, 'BacktestingComponent');
          
          this.isRunning = false;
          this.loadingMessage = '';
        }
      });
  }

  cancelBacktest(): void {
    this.isRunning = false;
    this.loadingMessage = '';
    // Note: In a real implementation, you'd need to cancel the observable
  }

  startNewBacktest(): void {
    this.result = null;
    this.error = null;
  }

  handleErrorAction(action: string): void {
    switch (action) {
      case 'Try again':
        this.runBacktest();
        break;
      case 'Refresh the page':
        window.location.reload();
        break;
      default:
        // For other actions, just clear the error to let user modify parameters
        this.error = null;
        break;
    }
  }

  private prepareTableData(): void {
    if (!this.result) return;

    // Prepare portfolio history table data (sample every 10th entry for large datasets)
    const sampleRate = Math.max(1, Math.floor(this.result.portfolioHistory.length / 50));
    this.portfolioTableData = this.result.portfolioHistory
      .filter((_, index) => index % sampleRate === 0)
      .slice(-50); // Last 50 entries

    this.rebalanceTableData = this.result.rebalanceEvents;
  }

  // Formatting helper methods
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  getTopHoldings(holdings: any): string {
    const sorted = Object.entries(holdings)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b.percentage - a.percentage)
      .slice(0, 3)
      .map(([symbol, data]: [string, any]) => `${symbol} (${data.percentage.toFixed(1)}%)`);
    
    return sorted.join(', ');
  }
}