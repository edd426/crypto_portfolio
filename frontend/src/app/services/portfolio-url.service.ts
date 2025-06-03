import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Portfolio, Holding } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioUrlService {

  constructor(private router: Router, private route: ActivatedRoute) {}

  savePortfolioToUrl(portfolio: Portfolio): void {
    const params: any = {};
    
    // Encode holdings as symbol:amount pairs
    if (portfolio.holdings.length > 0) {
      params.p = portfolio.holdings
        .map(h => `${h.symbol}:${h.amount}`)
        .join(',');
    }
    
    // Add cash balance
    if (portfolio.cashBalance > 0) {
      params.cash = portfolio.cashBalance.toString();
    }
    
    // Add excluded coins
    if (portfolio.excludedCoins.length > 0) {
      params.exclude = portfolio.excludedCoins.join(',');
    }
    
    // Add maxCoins if different from default
    if (portfolio.maxCoins && portfolio.maxCoins !== 15) {
      params.maxCoins = portfolio.maxCoins.toString();
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });
  }

  loadPortfolioFromUrl(): Portfolio | null {
    // Use current URL params instead of snapshot for better reliability
    const urlParams = new URLSearchParams(window.location.search);
    const queryParams: any = {};
    urlParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    if (!queryParams['p'] && !queryParams['cash']) {
      return null;
    }
    
    const holdings: Holding[] = [];
    
    // Parse holdings from URL
    if (queryParams['p']) {
      const holdingPairs = queryParams['p'].split(',');
      for (const pair of holdingPairs) {
        const [symbol, amountStr] = pair.split(':');
        const amount = parseFloat(amountStr);
        if (symbol && !isNaN(amount) && amount > 0) {
          holdings.push({ symbol: symbol.toUpperCase(), amount });
        }
      }
    }
    
    // Parse cash balance
    const cashBalance = queryParams['cash'] ? parseFloat(queryParams['cash']) : 0;
    
    // Parse excluded coins
    const excludedCoins = queryParams['exclude'] ? 
      queryParams['exclude'].split(',').map((s: string) => s.trim().toUpperCase()) : 
      [];
    
    // Parse maxCoins
    const maxCoins = queryParams['maxCoins'] ? parseInt(queryParams['maxCoins']) : 15;
    
    return {
      holdings,
      cashBalance: isNaN(cashBalance) ? 0 : cashBalance,
      excludedCoins,
      maxCoins: isNaN(maxCoins) ? 15 : maxCoins
    };
  }

  generateShareableUrl(portfolio: Portfolio): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    if (portfolio.holdings.length > 0) {
      params.set('p', portfolio.holdings
        .map(h => `${h.symbol}:${h.amount}`)
        .join(','));
    }
    
    if (portfolio.cashBalance > 0) {
      params.set('cash', portfolio.cashBalance.toString());
    }
    
    if (portfolio.excludedCoins.length > 0) {
      params.set('exclude', portfolio.excludedCoins.join(','));
    }
    
    if (portfolio.maxCoins && portfolio.maxCoins !== 15) {
      params.set('maxCoins', portfolio.maxCoins.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }
}