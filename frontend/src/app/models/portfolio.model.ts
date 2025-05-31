export interface Coin {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  change24h: number;
  volume24h: number;
}

export interface Holding {
  symbol: string;
  amount: number;
  currentPrice?: number;
  currentValue?: number;
  targetAmount?: number;
  targetValue?: number;
}

export interface Portfolio {
  holdings: Holding[];
  cashBalance: number;
  excludedCoins: string[];
  totalValue?: number;
  lastUpdated?: Date;
}

export interface TradeRecommendation {
  symbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  usdValue: number;
  currentHolding: number;
  targetHolding: number;
}

export interface RebalanceResult {
  currentValue: number;
  targetAllocations: Array<{
    symbol: string;
    targetPercentage: number;
    targetValue: number;
    targetAmount: number;
  }>;
  trades: TradeRecommendation[];
  summary: {
    totalBuys: number;
    totalSells: number;
    estimatedFees: number;
  };
}

export interface PortfolioMetrics {
  totalValue: number;
  numberOfHoldings: number;
  largestPosition: {
    symbol: string;
    percentage: number;
  };
  diversityScore: number;
}