import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PortfolioEntryComponent } from './components/portfolio-entry/portfolio-entry.component';
import { RebalancingResultsComponent } from './components/rebalancing-results/rebalancing-results.component';
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
    PortfolioEntryComponent,
    RebalancingResultsComponent
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
          <mat-card-title>Portfolio Rebalancing Tool</mat-card-title>
          <mat-card-subtitle>
            Rebalance your crypto portfolio according to market capitalization of the top 15 cryptocurrencies
          </mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <app-portfolio-entry 
        [initialPortfolio]="initialPortfolio"
        (portfolioSubmitted)="onPortfolioSubmitted($event)"
        (portfolioChanged)="onPortfolioChanged($event)">
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
  `]
})
export class AppComponent implements OnInit {
  initialPortfolio: Portfolio | null = null;
  currentPortfolio: Portfolio | null = null;
  rebalanceResult: RebalanceResult | null = null;
  isCalculating = false;

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
        console.log('API Status:', health.status);
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
    this.portfolioUrlService.savePortfolioToUrl(portfolio);
  }

  onPortfolioSubmitted(portfolio: Portfolio): void {
    this.currentPortfolio = portfolio;
    this.calculateRebalancing(portfolio);
  }

  private calculateRebalancing(portfolio: Portfolio): void {
    this.isCalculating = true;
    this.rebalanceResult = null;

    this.apiService.calculateRebalancing(portfolio, portfolio.excludedCoins).subscribe({
      next: (result) => {
        this.rebalanceResult = result;
        this.isCalculating = false;
        this.snackBar.open('Rebalancing calculation completed!', 'Dismiss', {
          duration: 3000
        });
      },
      error: (error) => {
        this.isCalculating = false;
        console.error('Rebalancing calculation failed:', error);
        this.snackBar.open('Failed to calculate rebalancing. Please try again.', 'Dismiss', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
}