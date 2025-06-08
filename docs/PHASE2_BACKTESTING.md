# Phase 2: Backtesting Feature

**Last Updated**: June 7, 2025  
**Status**: Architecture finalized - simplified client-side approach

## Overview
The backtesting feature allows users to simulate how their market-cap weighted rebalancing strategy would have performed historically, with **simplified monthly/quarterly/yearly rebalancing frequencies** and transaction costs.

## ✅ FINALIZED ARCHITECTURE DECISIONS (June 8, 2025)

### **Simplified Rebalancing Frequencies**
- **✅ Supported**: Monthly, Quarterly, Yearly only
- **❌ Eliminated**: Daily and weekly rebalancing (future features)
- **Rationale**: 97% complexity reduction while covering practical use cases

### **Client-Side Computation**
- **✅ Decision**: Browser-based backtesting calculations
- **Performance**: 300-700ms total execution time
- **Benefits**: No cold starts, no server costs, instant results
- **Complexity**: ~2,700 simple operations for complete historical backtest

### **Data Storage Strategy**
- **✅ Format**: Single JSON file per coin (btc.json, eth.json)
- **✅ Size**: 7-15KB per coin (complete historical data from inception)
- **✅ Access**: Direct browser fetch from Azure Blob Storage (public read)
- **✅ Updates**: Monthly Azure Function (1st of month, 100 API calls)
- **✅ Cost**: ~$0.01/month total

## 🎯 PHASE 2 FEATURE REQUIREMENTS (June 8, 2025)

### **MUST-HAVE Features** (Core MVP)

#### **Data Collection & Storage**
1. **Monthly Historical Data Fetching** - Azure Function to collect monthly price/market cap data from CoinGecko
2. **Complete Historical Backfill** - One-time population of complete historical data for top 100 coins (from coin inception to present)
3. **Single JSON File Per Coin** - Store complete history in optimized format (estimated: 7-15KB each depending on coin age)
4. **Basic Data Validation** - Ensure price/market cap data integrity before storage
5. **Azure Blob Storage Setup** - Public read access with CORS for browser fetching

#### **Client-Side Backtesting Engine**
6. **Portfolio Value Calculation** - Track total value over time with rebalancing
7. **Monthly/Quarterly/Yearly Rebalancing** - Core rebalancing frequency options
8. **Basic Performance Metrics** - Total return, annualized return, volatility
9. **Transaction Cost Modeling** - Configurable fee structure (default 0.5%)
10. **Historical Data Fetching** - Parallel download of required coin data files

#### **Infrastructure & Reliability**
11. **Error Handling** - Graceful failures for missing data or API issues
12. **Rate Limiting Compliance** - Stay within CoinGecko free tier limits
13. **Cost Monitoring** - Ensure $0.01/month target compliance

### **NICE-TO-HAVE Features** (Enhancements)

#### **Advanced Analytics**
14. **Sharpe Ratio Calculation** - Risk-adjusted return metrics
15. **Maximum Drawdown** - Peak-to-trough decline measurement
16. **Correlation Analysis** - Asset correlation over time
17. **Benchmark Comparison** - Compare against BTC, ETH, or market indices

#### **User Experience**
18. **Performance Visualization** - Charts showing portfolio growth over time
19. **Custom Date Range Selection** - User-defined backtesting periods
20. **Results Caching** - Cache backtesting results for faster re-runs
21. **Progress Indicators** - Show data loading and calculation progress
22. **Export Results** - Download backtesting data as CSV/JSON

#### **Data Quality & Monitoring**
23. **Data Completeness Checks** - Identify and flag missing historical periods
24. **Azure Function Monitoring** - Application Insights integration
25. **Data Versioning** - Track data updates and changes
26. **Automated Alerts** - Email notifications for data collection failures

### **Implementation Priority Order**
1. **Sprint 1** (Week 1): Features #1-5, #11-13 - Core data pipeline
2. **Sprint 2** (Week 2): Features #6-10, #18 - Backtesting engine
3. **Sprint 3** (Week 3): Features #14-17, #19-22 - Enhanced analytics

## User Journey

### 1. Backtesting Configuration
- Start from existing portfolio or define new one
- Set backtesting parameters:
  - Start date (earliest available based on coin data)
  - End date (default: today)
  - Rebalancing frequency: Monthly, Quarterly, Yearly (simplified)
  - Initial investment amount (if starting fresh)
  - Transaction fee percentage (default: 0.5%)
  - Slippage percentage (default: 0.1%)
  - Include/exclude specific coins

### 2. Backtest Execution
- "Run Backtest" button starts simulation
- Progress indicator shows simulation progress
- Real-time updates of key metrics during calculation

### 3. Results Visualization
- Performance chart showing:
  - Portfolio value over time
  - Benchmark (HODL initial portfolio)
  - Rebalancing events marked
- Key metrics dashboard:
  - Total return (% and $)
  - Annualized return
  - Sharpe ratio
  - Maximum drawdown
  - Win rate (% of positive periods)
  - Total fees paid
- Detailed statistics table:
  - Best/worst performing periods
  - Volatility metrics
  - Risk-adjusted returns

### 4. Trade History
- Expandable timeline of all rebalancing events
- For each rebalance:
  - Date and portfolio value
  - Trades executed
  - Fees incurred
  - Portfolio composition changes

## Technical Implementation

### Data Architecture

#### Historical Data Requirements
```typescript
interface HistoricalDataPoint {
  date: Date;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

interface BacktestDataset {
  startDate: Date;
  endDate: Date;
  frequency: 'daily' | 'hourly';
  coins: Map<string, HistoricalDataPoint[]>;
}
```

### Backtesting Engine

#### Core Algorithm
```typescript
class BacktestEngine {
  // Main backtesting loop
  async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    1. Validate date range and coin availability
    2. Fetch historical data for all relevant coins
    3. Initialize portfolio with starting positions
    
    4. For each rebalancing period:
       a. Get market caps for current date
       b. Calculate top 15 coins (excluding blacklist)
       c. Determine target allocations
       d. Calculate required trades
       e. Apply transaction fees and slippage
       f. Update portfolio positions
       g. Record metrics and trades
    
    5. Calculate final metrics
    6. Compare with HODL strategy
    7. Return comprehensive results
  }
}
```

#### Rebalancing Frequency Logic
```typescript
function getRebalancingDates(start: Date, end: Date, frequency: string): Date[] {
  switch(frequency) {
    case 'daily': // Every day at market close
    case 'weekly': // Every Monday
    case 'monthly': // First trading day of month
    case 'quarterly': // First trading day of quarter
    case 'yearly': // First trading day of year
  }
}
```

### Performance Metrics Calculations

#### Sharpe Ratio
```
sharpeRatio = (avgReturn - riskFreeRate) / standardDeviation
// Use 3% annual risk-free rate as default
```

#### Maximum Drawdown
```
maxDrawdown = (peakValue - troughValue) / peakValue × 100
```

#### Transaction Cost Modeling
```typescript
interface TransactionCost {
  percentageFee: number;  // e.g., 0.5%
  slippage: number;       // e.g., 0.1%
  
  calculateTotalCost(tradeValue: number): number {
    return tradeValue * (this.percentageFee + this.slippage) / 100;
  }
}
```

### API Endpoints

#### POST /api/backtest/run
```typescript
// Request
{
  portfolio: Portfolio;
  config: {
    startDate: string;
    endDate: string;
    rebalanceFrequency: string;
    transactionFee: number;
    slippage: number;
    excludedCoins: string[];
  }
}

// Response
{
  summary: BacktestSummary;
  timeSeries: TimeSeriesData[];
  trades: RebalancingEvent[];
  metrics: PerformanceMetrics;
}
```

#### GET /api/backtest/data-availability
```typescript
// Response
{
  coins: {
    [symbol: string]: {
      earliestDate: string;
      latestDate: string;
      dataPoints: number;
    }
  }
}
```

### Caching Strategy

1. **Historical Data Cache**
   - Cache daily price/market cap data in Azure Redis
   - TTL: 24 hours for recent data, permanent for data > 7 days old
   - Key format: `hist:${symbol}:${date}`

2. **Backtest Results Cache**
   - Cache full backtest results for common configurations
   - TTL: 1 hour
   - Key includes all parameters hash

### Frontend Components

```
src/app/
├── components/
│   ├── backtest-config/
│   │   └── backtest-config.component.ts
│   ├── backtest-results/
│   │   ├── performance-chart/
│   │   ├── metrics-dashboard/
│   │   └── trade-history/
│   └── backtest-comparison/
│       └── backtest-comparison.component.ts
├── services/
│   ├── backtest.service.ts
│   ├── historical-data.service.ts
│   └── metrics-calculator.service.ts
└── models/
    ├── backtest-config.model.ts
    ├── backtest-result.model.ts
    └── performance-metrics.model.ts
```

## Data Provider Integration

### CoinGecko Historical Data
- Endpoint: `/coins/{id}/market_chart/range`
- Rate limits: 10-50 calls/minute (free tier)
- Data granularity:
  - 1-90 days: 5-minute intervals
  - 91+ days: Daily intervals

### Fallback Data Sources
1. CoinMarketCap (requires API key)
2. CryptoCompare (better historical coverage)
3. Manual CSV uploads for missing data

## Performance Optimization

1. **Parallel Processing**
   - Split date ranges for parallel calculation
   - Use Web Workers for heavy computations

2. **Data Chunking**
   - Load historical data in chunks
   - Stream results to frontend as calculated

3. **Result Caching**
   - Cache common backtest scenarios
   - Pre-calculate popular date ranges

## Error Handling

- **Missing Historical Data**
  - Skip coins without sufficient history
  - Provide clear warnings about data gaps
  
- **API Rate Limits**
  - Implement exponential backoff
  - Queue requests with priority system
  
- **Long Computation Times**
  - Show progress indicators
  - Allow cancellation of running backtests
  - Implement request timeouts (5 minutes max)