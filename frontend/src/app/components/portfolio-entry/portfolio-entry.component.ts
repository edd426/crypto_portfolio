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
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Portfolio, Holding } from '../../models/portfolio.model';
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
    MatAutocompleteModule
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

          <!-- Excluded Coins Section -->
          <div class="section">
            <h3>Exclude Coins (Optional)</h3>
            <p class="hint">Coins to exclude from the top 15 rebalancing</p>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Add coin to exclude</mat-label>
              <input matInput 
                     #excludeInput
                     placeholder="DOGE, SHIB, etc."
                     (keyup.enter)="addExcludedCoin(excludeInput.value); excludeInput.value = ''">
            </mat-form-field>

            <div class="excluded-chips" *ngIf="excludedCoins.length > 0">
              <mat-chip-listbox>
                <mat-chip-option *ngFor="let coin of excludedCoins" 
                                 (removed)="removeExcludedCoin(coin)">
                  {{coin}}
                  <mat-icon matChipRemove>cancel</mat-icon>
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
      margin-top: 24px;
    }

    .calculate-button {
      min-width: 200px;
      height: 48px;
      font-size: 16px;
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
  `]
})
export class PortfolioEntryComponent implements OnInit, OnChanges {
  @Input() initialPortfolio: Portfolio | null = null;
  @Output() portfolioSubmitted = new EventEmitter<Portfolio>();
  @Output() portfolioChanged = new EventEmitter<Portfolio>();

  portfolioForm: FormGroup;
  excludedCoins: string[] = [];
  isSubmitting = false;

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
      cashBalance: [0, [Validators.min(0)]]
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

    // Set cash balance
    this.portfolioForm.patchValue({
      cashBalance: portfolio.cashBalance || 0
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

  addExcludedCoin(coinSymbol: string): void {
    const symbol = coinSymbol.trim().toUpperCase();
    if (symbol && !this.excludedCoins.includes(symbol)) {
      this.excludedCoins.push(symbol);
      this.emitPortfolioChange();
    }
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
      excludedCoins: [...this.excludedCoins]
    };
  }
}