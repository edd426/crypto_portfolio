import { MarketDataService } from './marketDataService';
import { Portfolio, TradeRecommendation, RebalanceResponse } from '../models/types';

export class RebalancingService {
  private marketDataService = new MarketDataService();

  async calculateRebalancing(
    portfolio: Portfolio,
    excludedCoins: string[] = [],
    topN: number = 15
  ): Promise<RebalanceResponse> {
    // Get top coins by market cap
    const topCoins = await this.marketDataService.getTopCoins(topN, excludedCoins);
    
    // Get current prices for portfolio holdings
    const allSymbols = [...new Set([
      ...portfolio.holdings.map(h => h.symbol),
      ...topCoins.map(c => c.symbol)
    ])];
    
    const prices = await this.marketDataService.getCoinPrices(allSymbols);

    // Calculate current portfolio value
    let currentPortfolioValue = portfolio.cashBalance;
    const updatedHoldings = portfolio.holdings.map(holding => {
      const price = prices[holding.symbol]?.price || 0;
      const value = holding.amount * price;
      currentPortfolioValue += value;
      
      return {
        ...holding,
        currentPrice: price,
        currentValue: value
      };
    });

    // Calculate target allocations based on market cap weights
    const totalMarketCap = topCoins.reduce((sum, coin) => sum + coin.marketCap, 0);
    const targetAllocations = topCoins.map(coin => {
      const targetPercentage = (coin.marketCap / totalMarketCap) * 100;
      const targetValue = (currentPortfolioValue * targetPercentage) / 100;
      const targetAmount = targetValue / coin.price;

      return {
        symbol: coin.symbol,
        targetPercentage,
        targetValue,
        targetAmount
      };
    });

    // Calculate required trades
    const trades: TradeRecommendation[] = [];
    let totalBuys = 0;
    let totalSells = 0;

    for (const target of targetAllocations) {
      const currentHolding = updatedHoldings.find(h => h.symbol === target.symbol);
      const currentAmount = currentHolding?.amount || 0;
      const difference = target.targetAmount - currentAmount;

      if (Math.abs(difference) > 0.0001) { // Minimum trade threshold
        const action = difference > 0 ? 'BUY' : 'SELL';
        const tradeAmount = Math.abs(difference);
        const tradeValue = tradeAmount * (prices[target.symbol]?.price || 0);

        trades.push({
          symbol: target.symbol,
          action,
          amount: tradeAmount,
          usdValue: tradeValue,
          currentHolding: currentAmount,
          targetHolding: target.targetAmount
        });

        if (action === 'BUY') {
          totalBuys += tradeValue;
        } else {
          totalSells += tradeValue;
        }
      }
    }

    // Handle coins not in top N (sell them)
    for (const holding of updatedHoldings) {
      const isInTopN = targetAllocations.some(t => t.symbol === holding.symbol);
      if (!isInTopN && holding.amount > 0) {
        const tradeValue = holding.currentValue || 0;
        trades.push({
          symbol: holding.symbol,
          action: 'SELL',
          amount: holding.amount,
          usdValue: tradeValue,
          currentHolding: holding.amount,
          targetHolding: 0
        });
        totalSells += tradeValue;
      }
    }

    // Calculate estimated fees (0.5% default)
    const estimatedFees = (totalBuys + totalSells) * 0.005;

    return {
      currentValue: currentPortfolioValue,
      targetAllocations,
      trades,
      summary: {
        totalBuys,
        totalSells,
        estimatedFees
      }
    };
  }
}