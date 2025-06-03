import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, startWith } from 'rxjs/operators';

import { Portfolio, Holding, Coin } from '../../models/portfolio.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-portfolio-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTooltipModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Enter Your Portfolio</mat-card-title>
        <mat-card-subtitle>Add your current cryptocurrency holdings and USD cash balance</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="portfolioForm" (ngSubmit)="onSubmit()">
          
          <!-- Holdings Section -->
          <div class="section">
            <h3>Current Holdings</h3>
            <div formArrayName="holdings">
              <div *ngFor="let holding of holdingsArray.controls; let i = index" 
                   [formGroupName]="i" 
                   class="holding-row">
                
                <mat-form-field appearance="outline" class="symbol-field">
                  <mat-label>Coin Symbol</mat-label>
                  <input matInput 
                         placeholder="BTC, ETH, etc."
                         formControlName="symbol"
                         (input)="onSymbolChange(i, $event)">
                  <mat-error *ngIf="holding.get('symbol')?.hasError('required')">
                    Symbol is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="amount-field">
                  <mat-label>Amount</mat-label>
                  <input matInput 
                         type="number" 
                         step="any"
                         placeholder="0.5"
                         formControlName="amount">
                  <mat-error *ngIf="holding.get('amount')?.hasError('required')">
                    Amount is required
                  </mat-error>
                  <mat-error *ngIf="holding.get('amount')?.hasError('min')">
                    Amount must be greater than 0
                  </mat-error>
                </mat-form-field>

                <button mat-icon-button 
                        type="button"
                        color="warn" 
                        (click)="removeHolding(i)"
                        [disabled]="holdingsArray.length <= 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <button mat-stroked-button 
                    type="button" 
                    (click)="addHolding()"
                    class="add-button">
              <mat-icon>add</mat-icon>
              Add Another Coin
            </button>
          </div>

          <!-- Cash Balance Section -->
          <div class="section">
            <h3>USD Cash Balance</h3>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cash Balance (USD)</mat-label>
              <input matInput 
                     type="number" 
                     step="0.01"
                     placeholder="1000.00"
                     formControlName="cashBalance">
              <mat-error *ngIf="portfolioForm.get('cashBalance')?.hasError('min')">
                Cash balance cannot be negative
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Max Coins Section -->
          <div class="section">
            <h3>Portfolio Size</h3>
            <mat-form-field appearance="outline" class="max-coins-field">
              <mat-label>Maximum coins in target portfolio</mat-label>
              <input matInput 
                     type="number" 
                     min="1"
                     max="50"
                     placeholder="15"
                     formControlName="maxCoins">
              <mat-hint>Default: 15 coins. Excluded coins count against this limit.</mat-hint>
              <mat-error *ngIf="portfolioForm.get('maxCoins')?.hasError('min')">
                Must be at least 1
              </mat-error>
              <mat-error *ngIf="portfolioForm.get('maxCoins')?.hasError('max')">
                Cannot exceed 50
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Excluded Coins Section -->
          <div class="section">
            <h3>Exclude Coins (Optional)</h3>
            <p class="hint">Enter coin symbols to exclude from the target portfolio (e.g., BTC, ETH, USDT)</p>
            
            <div class="exclusion-input-container">
              <mat-form-field appearance="outline" class="exclusion-input">
                <mat-label>Add coin symbol to exclude</mat-label>
                <input matInput 
                       #coinInput
                       placeholder="e.g., BTC, ETH, USDT"
                       (keydown.enter)="addExcludedCoinFromInput(coinInput)"
                       (keydown.comma)="addExcludedCoinFromInput(coinInput)"
                       (blur)="addExcludedCoinFromInput(coinInput)">
                <mat-hint>Press Enter, comma, or click away to add</mat-hint>
              </mat-form-field>
              
              <button mat-icon-button 
                      type="button"
                      color="primary"
                      (click)="addExcludedCoinFromInput(coinInput)"
                      class="add-exclusion-btn">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <div class="excluded-chips" *ngIf="excludedCoins.length > 0">
              <p class="chips-hint">
                Excluded coins will be highlighted after calculation to show their effectiveness
              </p>
              <mat-chip-listbox>
                <mat-chip-option *ngFor="let coin of excludedCoins" 
                                 [class.ineffective]="isExclusionIneffective(coin)"
                                 [class.effective]="isExclusionEffective(coin)"
                                 (removed)="removeExcludedCoin(coin)">
                  {{coin}}
                  <mat-icon matChipRemove>cancel</mat-icon>
                  <mat-icon *ngIf="isExclusionIneffective(coin)" 
                           class="status-icon"
                           matTooltip="This coin is not in the top portfolio by market cap">
                    info
                  </mat-icon>
                </mat-chip-option>
              </mat-chip-listbox>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="actions">
            <button mat-raised-button 
                    color="primary" 
                    type="submit"
                    [disabled]="portfolioForm.invalid || isSubmitting"
                    class="calculate-button">
              {{isSubmitting ? 'Calculating...' : 'Calculate Rebalancing'}}
            </button>
            
            <button mat-stroked-button 
                    color="accent" 
                    type="button"
                    [disabled]="portfolioForm.invalid"
                    (click)="onGenerateUrl()"
                    class="url-button">
              <mat-icon>share</mat-icon>
              Generate Portfolio URL
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .section {
      margin-bottom: 24px;
    }

    .holding-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 16px;
    }

    .symbol-field {
      flex: 1;
      max-width: 150px;
    }

    .amount-field {
      flex: 1;
      max-width: 200px;
    }

    .add-button {
      margin-top: 8px;
    }

    .excluded-chips {
      margin-top: 16px;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 24px;
      flex-wrap: wrap;
    }

    .calculate-button {
      min-width: 200px;
      height: 48px;
      font-size: 16px;
    }

    .url-button {
      min-width: 200px;
      height: 48px;
      font-size: 16px;
    }

    .max-coins-field {
      width: 100%;
      max-width: 300px;
    }

    .hint {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    h3 {
      margin-bottom: 16px;
      color: #1976d2;
    }

    .exclusion-input-container {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 16px;
    }

    .exclusion-input {
      flex: 1;
    }

    .add-exclusion-btn {
      margin-top: 8px;
    }

    .chips-hint {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.54);
      margin-bottom: 8px;
      font-style: italic;
    }

    .effective {
      background-color: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .ineffective {
      background-color: #ffecb3 !important;
      color: #f57c00 !important;
    }

    .status-icon {
      font-size: 16px;
      margin-left: 4px;
    }
  `]
})
export class PortfolioEntryComponent implements OnInit, OnChanges {
  @Input() initialPortfolio: Portfolio | null = null;
  @Output() portfolioSubmitted = new EventEmitter<Portfolio>();
  @Output() portfolioChanged = new EventEmitter<Portfolio>();
  @Output() generateUrl = new EventEmitter<Portfolio>();

  portfolioForm: FormGroup;
  excludedCoins: string[] = [];
  isSubmitting = false;
  topPortfolioCoins: string[] = []; // Coins that are actually in the top X by market cap
  availableCoinsForExclusion: Coin[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.portfolioForm = this.createForm();
  }

  ngOnInit(): void {
    this.portfolioForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitPortfolioChange();
    });
    
    // Load top coins for exclusion dropdown
    this.loadTopCoins();
  }

  private loadTopCoins(): void {
    this.apiService.getTopCoins(20).subscribe({
      next: (response) => {
        this.availableCoinsForExclusion = response.data;
      },
      error: (error) => {
        console.error('Error loading top coins for exclusion:', error);
        // Fallback with common coins
        this.availableCoinsForExclusion = [
          { rank: 1, symbol: 'BTC', name: 'Bitcoin', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 2, symbol: 'ETH', name: 'Ethereum', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 3, symbol: 'USDT', name: 'Tether', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 4, symbol: 'BNB', name: 'BNB', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 5, symbol: 'XRP', name: 'XRP', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 6, symbol: 'USDC', name: 'USD Coin', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 7, symbol: 'SOL', name: 'Solana', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 8, symbol: 'DOGE', name: 'Dogecoin', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 9, symbol: 'ADA', name: 'Cardano', price: 0, marketCap: 0, change24h: 0, volume24h: 0 },
          { rank: 10, symbol: 'TRX', name: 'TRON', price: 0, marketCap: 0, change24h: 0, volume24h: 0 }
        ];
      }
    });
  }

  ngOnChanges(): void {
    if (this.initialPortfolio) {
      this.loadPortfolio(this.initialPortfolio);
    }
  }

  get holdingsArray(): FormArray {
    return this.portfolioForm.get('holdings') as FormArray;
  }

  private createForm(): FormGroup {
    return this.fb.group({
      holdings: this.fb.array([this.createHoldingFormGroup()]),
      cashBalance: [0, [Validators.min(0)]],
      maxCoins: [15, [Validators.min(1), Validators.max(50)]]
    });
  }

  private createHoldingFormGroup(): FormGroup {
    return this.fb.group({
      symbol: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.0001)]]
    });
  }

  private loadPortfolio(portfolio: Portfolio): void {
    // Clear existing holdings
    while (this.holdingsArray.length > 0) {
      this.holdingsArray.removeAt(0);
    }

    // Add holdings or create empty one
    if (portfolio.holdings.length > 0) {
      portfolio.holdings.forEach(holding => {
        this.holdingsArray.push(this.fb.group({
          symbol: [holding.symbol, [Validators.required]],
          amount: [holding.amount, [Validators.required, Validators.min(0.0001)]]
        }));
      });
    } else {
      this.holdingsArray.push(this.createHoldingFormGroup());
    }

    // Set cash balance and maxCoins
    this.portfolioForm.patchValue({
      cashBalance: portfolio.cashBalance || 0,
      maxCoins: portfolio.maxCoins || 15
    });

    // Set excluded coins
    this.excludedCoins = [...portfolio.excludedCoins];
  }

  addHolding(): void {
    this.holdingsArray.push(this.createHoldingFormGroup());
  }

  removeHolding(index: number): void {
    if (this.holdingsArray.length > 1) {
      this.holdingsArray.removeAt(index);
    }
  }

  getAvailableCoins(): Coin[] {
    return this.availableCoinsForExclusion.filter(coin => 
      !this.excludedCoins.includes(coin.symbol)
    );
  }

  onCoinSelected(symbol: string): void {
    if (symbol && !this.excludedCoins.includes(symbol)) {
      this.excludedCoins.push(symbol);
      this.emitPortfolioChange();
    }
  }

  addExcludedCoin(coinSymbol: string): void {
    const symbol = coinSymbol.trim().toUpperCase();
    if (symbol && !this.excludedCoins.includes(symbol)) {
      this.excludedCoins.push(symbol);
      this.emitPortfolioChange();
    }
  }

  addExcludedCoinFromInput(inputElement: HTMLInputElement): void {
    const value = inputElement.value.trim();
    if (!value) return;
    
    // Handle comma-separated values
    const symbols = value.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    
    symbols.forEach(symbol => {
      if (symbol && !this.excludedCoins.includes(symbol)) {
        this.excludedCoins.push(symbol);
      }
    });
    
    // Clear the input
    inputElement.value = '';
    this.emitPortfolioChange();
  }

  isExclusionEffective(coinSymbol: string): boolean {
    // A coin exclusion is effective if it's in the top portfolio coins
    // (meaning it would have been included without the exclusion)
    return this.topPortfolioCoins.includes(coinSymbol);
  }

  isExclusionIneffective(coinSymbol: string): boolean {
    // A coin exclusion is ineffective if we have calculated results
    // and the coin is NOT in the top portfolio coins
    return this.topPortfolioCoins.length > 0 && !this.topPortfolioCoins.includes(coinSymbol);
  }

  updateTopPortfolioCoins(coins: string[]): void {
    // This method will be called from the parent component after rebalancing calculation
    // to update which coins are actually in the top portfolio by market cap
    this.topPortfolioCoins = [...coins];
  }

  removeExcludedCoin(coinSymbol: string): void {
    const index = this.excludedCoins.indexOf(coinSymbol);
    if (index >= 0) {
      this.excludedCoins.splice(index, 1);
      this.emitPortfolioChange();
    }
  }

  onSymbolChange(index: number, event: any): void {
    const value = event.target.value.toUpperCase();
    this.holdingsArray.at(index).patchValue({ symbol: value });
  }

  private emitPortfolioChange(): void {
    if (this.portfolioForm.valid) {
      const portfolio = this.buildPortfolio();
      this.portfolioChanged.emit(portfolio);
    }
  }

  onSubmit(): void {
    if (this.portfolioForm.valid) {
      this.isSubmitting = true;
      const portfolio = this.buildPortfolio();
      
      // Simulate brief delay for UX
      setTimeout(() => {
        this.portfolioSubmitted.emit(portfolio);
        this.isSubmitting = false;
      }, 300);
    }
  }

  onGenerateUrl(): void {
    if (this.portfolioForm.valid) {
      const portfolio = this.buildPortfolio();
      this.generateUrl.emit(portfolio);
    }
  }


  private buildPortfolio(): Portfolio {
    const formValue = this.portfolioForm.value;
    
    const holdings: Holding[] = formValue.holdings
      .filter((h: any) => h.symbol && h.amount > 0)
      .map((h: any) => ({
        symbol: h.symbol.toUpperCase(),
        amount: parseFloat(h.amount)
      }));

    return {
      holdings,
      cashBalance: parseFloat(formValue.cashBalance) || 0,
      excludedCoins: [...this.excludedCoins],
      maxCoins: parseInt(formValue.maxCoins) || 15
    };
  }
}