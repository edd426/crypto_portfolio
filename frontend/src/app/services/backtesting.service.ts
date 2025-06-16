import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HistoricalDataService, HistoricalDataPoint, CoinHistoricalData } from './historical-data.service';

export interface BacktestConfig {
  startDate: Date;
  endDate: Date;
  initialValue: number;
  rebalanceFrequency: 'monthly' | 'quarterly' | 'yearly';
  transactionFeePercent: number;
  slippagePercent: number;
  maxCoins: number;
  excludedCoins: string[];
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  holdings: { [symbol: string]: { amount: number; value: number; percentage: number } };
  cash: number;
}

export interface RebalanceEvent {
  date: string;
  beforeValue: number;
  afterValue: number;
  trades: Trade[];
  fees: number;
  portfolioBefore: { [symbol: string]: number };
  portfolioAfter: { [symbol: string]: number };
}

export interface Trade {
  symbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
  value: number;
  fee: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalFees: number;
  numberOfRebalances: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  portfolioHistory: PortfolioSnapshot[];
  rebalanceEvents: RebalanceEvent[];
  metrics: BacktestMetrics;
  benchmarkComparison?: {
    hodlReturn: number;
    outperformance: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BacktestingService {
  constructor(private historicalDataService: HistoricalDataService) {}

  /**
   * Run a complete backtest simulation
   */
  runBacktest(config: BacktestConfig): Observable<BacktestResult> {
    // Debug: Starting backtest

    return this.validateAndPrepareData(config).pipe(
      switchMap(({ coinData, rebalanceDates }) => {
        const portfolioHistory: PortfolioSnapshot[] = [];
        const rebalanceEvents: RebalanceEvent[] = [];
        
        // Initialize portfolio
        let currentPortfolio = this.initializePortfolio(config, coinData, rebalanceDates[0]);
        portfolioHistory.push(this.createPortfolioSnapshot(rebalanceDates[0], currentPortfolio, coinData));

        // Simulate each rebalancing period
        for (let i = 0; i < rebalanceDates.length - 1; i++) {
          const rebalanceDate = rebalanceDates[i];
          const nextDate = rebalanceDates[i + 1];

          // Update portfolio value to rebalance date
          currentPortfolio = this.updatePortfolioValue(currentPortfolio, rebalanceDate, coinData);
          
          // Perform rebalancing
          const rebalanceEvent = this.performRebalancing(
            currentPortfolio, 
            rebalanceDate, 
            config, 
            coinData
          );
          
          if (rebalanceEvent) {
            rebalanceEvents.push(rebalanceEvent);
            currentPortfolio = this.applyRebalancing(currentPortfolio, rebalanceEvent);
          }

          // Update portfolio value to next period
          currentPortfolio = this.updatePortfolioValue(currentPortfolio, nextDate, coinData);
          portfolioHistory.push(this.createPortfolioSnapshot(nextDate, currentPortfolio, coinData));
        }

        // Calculate final metrics
        const metrics = this.calculateMetrics(portfolioHistory, rebalanceEvents, config);
        
        const result: BacktestResult = {
          config,
          portfolioHistory,
          rebalanceEvents,
          metrics
        };

        // Debug: Backtest completed
        return of(result);
      })
    );
  }

  /**
   * Validate config and prepare historical data
   */
  private validateAndPrepareData(config: BacktestConfig): Observable<{
    coinData: { [symbol: string]: CoinHistoricalData };
    rebalanceDates: string[];
  }> {
    // Use all available coins from historical data (97 top cryptocurrencies)
    // TODO: Could be optimized to only fetch coins needed for the portfolio
    const allSymbols = this.historicalDataService.getAvailableCoins();

    return this.historicalDataService.getMultipleCoinData(allSymbols).pipe(
      map(coinData => {
        // Filter out excluded coins
        const filteredData: { [symbol: string]: CoinHistoricalData } = {};
        Object.entries(coinData).forEach(([symbol, data]) => {
          if (!config.excludedCoins.includes(symbol)) {
            filteredData[symbol] = data;
          }
        });

        // Generate rebalancing dates
        const rebalanceDates = this.generateRebalanceDates(config);

        return { coinData: filteredData, rebalanceDates };
      })
    );
  }

  /**
   * Generate rebalancing dates based on frequency
   */
  private generateRebalanceDates(config: BacktestConfig): string[] {
    const dates: string[] = [];
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      
      // Increment based on frequency
      switch (config.rebalanceFrequency) {
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarterly':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    
    // Ensure end date is included
    const endDateStr = end.toISOString().split('T')[0];
    if (!dates.includes(endDateStr)) {
      dates.push(endDateStr);
    }
    
    return dates;
  }

  /**
   * Initialize portfolio with equal weights in top coins
   */
  private initializePortfolio(
    config: BacktestConfig, 
    coinData: { [symbol: string]: CoinHistoricalData },
    startDate: string
  ): { [symbol: string]: number } {
    const topCoins = this.getTopCoinsByMarketCap(coinData, startDate, config.maxCoins);
    const valuePerCoin = config.initialValue / topCoins.length;
    
    const portfolio: { [symbol: string]: number } = {};
    
    topCoins.forEach(symbol => {
      const price = this.getCoinPriceOnDate(coinData[symbol], startDate);
      if (price > 0) {
        portfolio[symbol] = valuePerCoin / price;
      }
    });
    
    return portfolio;
  }

  /**
   * Get top coins by market cap on a specific date
   */
  private getTopCoinsByMarketCap(
    coinData: { [symbol: string]: CoinHistoricalData },
    date: string,
    limit: number
  ): string[] {
    const coinMarketCaps: { symbol: string; marketCap: number }[] = [];
    
    Object.entries(coinData).forEach(([symbol, data]) => {
      const marketCap = this.getCoinMarketCapOnDate(data, date);
      if (marketCap > 0) {
        coinMarketCaps.push({ symbol, marketCap });
      }
    });
    
    return coinMarketCaps
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, limit)
      .map(coin => coin.symbol);
  }

  /**
   * Get coin price on a specific date (with interpolation)
   */
  private getCoinPriceOnDate(coinData: CoinHistoricalData, date: string): number {
    const dataPoint = this.findNearestDataPoint(coinData.data, date);
    return dataPoint ? dataPoint.price : 0;
  }

  /**
   * Get coin market cap on a specific date
   */
  private getCoinMarketCapOnDate(coinData: CoinHistoricalData, date: string): number {
    const dataPoint = this.findNearestDataPoint(coinData.data, date);
    return dataPoint ? dataPoint.marketCap : 0;
  }

  /**
   * Find nearest data point to a given date
   */
  private findNearestDataPoint(data: HistoricalDataPoint[], targetDate: string): HistoricalDataPoint | null {
    if (data.length === 0) return null;
    
    const target = new Date(targetDate);
    let closest = data[0];
    let minDiff = Math.abs(new Date(closest.date).getTime() - target.getTime());
    
    for (const point of data) {
      const diff = Math.abs(new Date(point.date).getTime() - target.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = point;
      }
    }
    
    return closest;
  }

  /**
   * Update portfolio value based on price changes
   */
  private updatePortfolioValue(
    portfolio: { [symbol: string]: number },
    date: string,
    coinData: { [symbol: string]: CoinHistoricalData }
  ): { [symbol: string]: number } {
    // Portfolio amounts don't change, only values change with prices
    return { ...portfolio };
  }

  /**
   * Perform rebalancing to market cap weights
   */
  private performRebalancing(
    portfolio: { [symbol: string]: number },
    date: string,
    config: BacktestConfig,
    coinData: { [symbol: string]: CoinHistoricalData }
  ): RebalanceEvent | null {
    // Calculate current portfolio value
    const currentValue = this.calculatePortfolioValue(portfolio, date, coinData);
    
    // Get target allocations based on market cap
    const topCoins = this.getTopCoinsByMarketCap(coinData, date, config.maxCoins);
    const totalMarketCap = topCoins.reduce((sum, symbol) => 
      sum + this.getCoinMarketCapOnDate(coinData[symbol], date), 0
    );
    
    // Calculate target portfolio
    const targetPortfolio: { [symbol: string]: number } = {};
    const trades: Trade[] = [];
    let totalFees = 0;
    
    topCoins.forEach(symbol => {
      const marketCap = this.getCoinMarketCapOnDate(coinData[symbol], date);
      const targetPercent = marketCap / totalMarketCap;
      const targetValue = currentValue * targetPercent;
      const price = this.getCoinPriceOnDate(coinData[symbol], date);
      
      if (price > 0) {
        const targetAmount = targetValue / price;
        const currentAmount = portfolio[symbol] || 0;
        const diff = targetAmount - currentAmount;
        
        if (Math.abs(diff * price) > 1) { // Only trade if difference > $1
          const trade: Trade = {
            symbol,
            action: diff > 0 ? 'BUY' : 'SELL',
            amount: Math.abs(diff),
            price,
            value: Math.abs(diff * price),
            fee: Math.abs(diff * price) * (config.transactionFeePercent + config.slippagePercent) / 100
          };
          
          trades.push(trade);
          totalFees += trade.fee;
        }
        
        targetPortfolio[symbol] = targetAmount;
      }
    });
    
    // Remove coins not in top list
    Object.keys(portfolio).forEach(symbol => {
      if (!topCoins.includes(symbol) && portfolio[symbol] > 0) {
        const price = this.getCoinPriceOnDate(coinData[symbol], date);
        if (price > 0) {
          const value = portfolio[symbol] * price;
          const trade: Trade = {
            symbol,
            action: 'SELL',
            amount: portfolio[symbol],
            price,
            value,
            fee: value * (config.transactionFeePercent + config.slippagePercent) / 100
          };
          
          trades.push(trade);
          totalFees += trade.fee;
        }
      }
    });
    
    if (trades.length === 0) {
      return null; // No rebalancing needed
    }
    
    return {
      date,
      beforeValue: currentValue,
      afterValue: currentValue - totalFees,
      trades,
      fees: totalFees,
      portfolioBefore: { ...portfolio },
      portfolioAfter: targetPortfolio
    };
  }

  /**
   * Apply rebalancing changes to portfolio
   */
  private applyRebalancing(
    portfolio: { [symbol: string]: number },
    rebalanceEvent: RebalanceEvent
  ): { [symbol: string]: number } {
    return { ...rebalanceEvent.portfolioAfter };
  }

  /**
   * Calculate total portfolio value on a specific date
   */
  private calculatePortfolioValue(
    portfolio: { [symbol: string]: number },
    date: string,
    coinData: { [symbol: string]: CoinHistoricalData }
  ): number {
    return Object.entries(portfolio).reduce((total, [symbol, amount]) => {
      const price = this.getCoinPriceOnDate(coinData[symbol], date);
      return total + (amount * price);
    }, 0);
  }

  /**
   * Create portfolio snapshot for a specific date
   */
  private createPortfolioSnapshot(
    date: string,
    portfolio: { [symbol: string]: number },
    coinData: { [symbol: string]: CoinHistoricalData }
  ): PortfolioSnapshot {
    const holdings: { [symbol: string]: { amount: number; value: number; percentage: number } } = {};
    let totalValue = 0;
    
    Object.entries(portfolio).forEach(([symbol, amount]) => {
      if (amount > 0) {
        const price = this.getCoinPriceOnDate(coinData[symbol], date);
        const value = amount * price;
        totalValue += value;
        
        holdings[symbol] = {
          amount,
          value,
          percentage: 0 // Will be calculated after we know total value
        };
      }
    });
    
    // Calculate percentages
    Object.values(holdings).forEach(holding => {
      holding.percentage = totalValue > 0 ? (holding.value / totalValue) * 100 : 0;
    });
    
    return {
      date,
      totalValue,
      holdings,
      cash: 0 // No cash holding in this implementation
    };
  }

  /**
   * Calculate comprehensive backtest metrics
   */
  private calculateMetrics(
    portfolioHistory: PortfolioSnapshot[],
    rebalanceEvents: RebalanceEvent[],
    config: BacktestConfig
  ): BacktestMetrics {
    if (portfolioHistory.length < 2) {
      throw new Error('Insufficient data for metrics calculation');
    }
    
    const initialValue = portfolioHistory[0].totalValue;
    const finalValue = portfolioHistory[portfolioHistory.length - 1].totalValue;
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100;
    
    // Calculate time period in years
    const startDate = new Date(portfolioHistory[0].date);
    const endDate = new Date(portfolioHistory[portfolioHistory.length - 1].date);
    const yearsElapsed = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    const annualizedReturn = yearsElapsed > 0 ? (Math.pow(finalValue / initialValue, 1 / yearsElapsed) - 1) * 100 : 0;
    
    // Calculate volatility (standard deviation of returns)
    const returns: number[] = [];
    for (let i = 1; i < portfolioHistory.length; i++) {
      const prevValue = portfolioHistory[i - 1].totalValue;
      const currValue = portfolioHistory[i].totalValue;
      const periodReturn = (currValue - prevValue) / prevValue;
      returns.push(periodReturn);
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(12) * 100; // Annualized volatility in %
    
    // Calculate Sharpe ratio (assuming 3% risk-free rate)
    const riskFreeRate = 3;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
    
    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = portfolioHistory[0].totalValue;
    
    for (const snapshot of portfolioHistory) {
      if (snapshot.totalValue > peak) {
        peak = snapshot.totalValue;
      }
      const drawdown = ((peak - snapshot.totalValue) / peak) * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    // Calculate win rate
    const positiveReturns = returns.filter(r => r > 0).length;
    const winRate = returns.length > 0 ? (positiveReturns / returns.length) * 100 : 0;
    
    // Calculate total fees
    const totalFees = rebalanceEvents.reduce((sum, event) => sum + event.fees, 0);
    
    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      winRate,
      totalFees,
      numberOfRebalances: rebalanceEvents.length
    };
  }
}