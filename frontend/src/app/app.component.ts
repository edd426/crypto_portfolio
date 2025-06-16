import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { PortfolioEntryComponent } from './components/portfolio-entry/portfolio-entry.component';
import { RebalancingResultsComponent } from './components/rebalancing-results/rebalancing-results.component';
import { BacktestingComponent } from './components/backtesting/backtesting.component';
import { Portfolio, RebalanceResult } from './models/portfolio.model';
import { ApiService } from './services/api.service';
import { PortfolioUrlService } from './services/portfolio-url.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    PortfolioEntryComponent,
    RebalancingResultsComponent,
    BacktestingComponent
  ],
  template: `
    <mat-toolbar color="primary">
      <span>Crypto Portfolio Analyzer</span>
      <span class="spacer"></span>
      <span class="version">v1.0.0</span>
    </mat-toolbar>

    <div class="container">
      <mat-card class="intro-card">
        <mat-card-header>
          <mat-card-title>Crypto Portfolio Analyzer</mat-card-title>
          <mat-card-subtitle>
            Advanced portfolio rebalancing and backtesting tools for cryptocurrency investments
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <mat-tab-group>
        <mat-tab label="Portfolio Analysis">
          <div class="tab-content">
            <app-portfolio-entry 
              [initialPortfolio]="initialPortfolio"
              (portfolioSubmitted)="onPortfolioSubmitted($event)"
              (portfolioChanged)="onPortfolioChanged($event)"
              (generateUrl)="onGenerateUrlFromEntry($event)">
            </app-portfolio-entry>

            <div *ngIf="isCalculating" class="text-center mt-2">
              <mat-spinner></mat-spinner>
              <p>Calculating rebalancing recommendations...</p>
            </div>

            <app-rebalancing-results 
              *ngIf="rebalanceResult && !isCalculating && currentPortfolio"
              [result]="rebalanceResult"
              [portfolio]="currentPortfolio">
            </app-rebalancing-results>
          </div>
        </mat-tab>

        <mat-tab label="Historical Backtesting">
          <div class="tab-content">
            <app-backtesting></app-backtesting>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .version {
      font-size: 0.8em;
      opacity: 0.7;
    }
    
    .intro-card {
      margin-bottom: 24px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .tab-content {
      padding: 20px 0;
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild(PortfolioEntryComponent) portfolioEntryComponent!: PortfolioEntryComponent;
  
  initialPortfolio: Portfolio | null = null;
  currentPortfolio: Portfolio | null = null;
  rebalanceResult: RebalanceResult | null = null;
  isCalculating = false;
  private debugLevel = Number(localStorage.getItem('portfolioDebugLevel')) || 0;

  constructor(
    private apiService: ApiService,
    private portfolioUrlService: PortfolioUrlService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkApiHealth();
    this.loadPortfolioFromUrl();
  }

  private checkApiHealth(): void {
    this.apiService.checkHealth().subscribe({
      next: (health) => {
        this.debugLog(3, 'API Status:', health.status);
      },
      error: (error) => {
        this.snackBar.open('Backend API is not available. Please ensure the server is running.', 'Dismiss', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  private loadPortfolioFromUrl(): void {
    const portfolio = this.portfolioUrlService.loadPortfolioFromUrl();
    if (portfolio) {
      this.initialPortfolio = portfolio;
      this.currentPortfolio = portfolio;
    }
  }

  onPortfolioChanged(portfolio: Portfolio): void {
    this.currentPortfolio = portfolio;
    // Remove automatic URL updates - only update when user explicitly generates URL
  }

  onPortfolioSubmitted(portfolio: Portfolio): void {
    this.currentPortfolio = portfolio;
    this.calculateRebalancing(portfolio);
  }

  private calculateRebalancing(portfolio: Portfolio): void {
    this.isCalculating = true;
    this.rebalanceResult = null;

    // First get the top coins to determine which exclusions are effective
    const maxCoins = portfolio.maxCoins || 15;
    
    this.apiService.calculateRebalancing(
      portfolio, 
      portfolio.excludedCoins, 
      maxCoins
    ).subscribe({
      next: (result) => {
        this.rebalanceResult = result;
        this.isCalculating = false;
        
        // Get top coins without exclusions to determine effective vs ineffective exclusions
        this.apiService.getTopCoins(maxCoins, []).subscribe({
          next: (topCoinsResponse) => {
            const allTopCoins = topCoinsResponse.data.map(coin => coin.symbol);
            if (this.portfolioEntryComponent) {
              this.portfolioEntryComponent.updateTopPortfolioCoins(allTopCoins);
            }
          },
          error: (error) => {
            console.error('Failed to get top coins for exclusion feedback:', error);
            // Fallback to using target allocations 
            const topPortfolioCoins = result.targetAllocations.map(allocation => allocation.symbol);
            if (this.portfolioEntryComponent) {
              this.portfolioEntryComponent.updateTopPortfolioCoins(topPortfolioCoins);
            }
          }
        });
        
        this.snackBar.open('Rebalancing calculation completed!', 'Dismiss', {
          duration: 3000
        });
      },
      error: (error) => {
        this.isCalculating = false;
        this.debugLog(1, 'Rebalancing calculation failed:', error);
        
        // Extract specific error message from the backend
        let errorMessage = 'Failed to calculate rebalancing. Please try again.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Determine snackbar duration based on error type
        const duration = errorMessage.includes('rate limit') ? 10000 : 5000;
        
        this.snackBar.open(errorMessage, 'Dismiss', {
          duration,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  onGenerateUrlFromEntry(portfolio: Portfolio): void {
    this.generatePortfolioUrl(portfolio);
  }


  private generatePortfolioUrl(portfolio: Portfolio): void {
    const shareableUrl = this.portfolioUrlService.generateShareableUrl(portfolio);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      this.snackBar.open('Portfolio URL copied to clipboard!', 'Dismiss', {
        duration: 3000
      });
    }).catch(() => {
      // Fallback for older browsers
      this.snackBar.open(`Portfolio URL: ${shareableUrl}`, 'Dismiss', {
        duration: 10000
      });
    });

    // Also update the current URL
    this.portfolioUrlService.savePortfolioToUrl(portfolio);
  }

  private debugLog(level: number, ...args: any[]): void {
    if (this.debugLevel >= level) {
      const prefix = level === 1 ? '[ERROR]' : level === 2 ? '[WARN]' : level === 3 ? '[INFO]' : '[DEBUG]';
      console.log(prefix, ...args);
    }
  }
}