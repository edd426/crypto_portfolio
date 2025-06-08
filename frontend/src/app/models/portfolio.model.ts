export interface Coin {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  change24h?: number;
  volume24h?: number;
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
  maxCoins?: number; // Maximum number of coins in target portfolio (default: 15)
  totalValue?: number;
  lastUpdated?: Date;
}

export interface Trade {
  symbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  value: number;
  usdValue: number; // Alias for value for backward compatibility
  price: number;
}

export interface Allocation {
  symbol: string;
  percentage: number;
  targetPercentage: number; // Alias for backward compatibility
  price: number;
  targetValue: number;
  targetAmount: number;
}

export interface RebalanceResult {
  targetAllocations: Allocation[];
  trades: Trade[];
  totalValue: number;
  currentValue: number; // Alias for totalValue for backward compatibility
  summary: {
    totalBuys: number;
    totalSells: number;
    estimatedFees: number;
  };
  metadata: {
    timestamp: string;
    topN: number;
    excludedCoins: string[];
  };
}

// Legacy interface for backward compatibility
export interface TradeRecommendation {
  symbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  usdValue: number;
  currentHolding: number;
  targetHolding: number;
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