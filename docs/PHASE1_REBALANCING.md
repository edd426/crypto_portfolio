# Phase 1: Portfolio Rebalancing Feature

## Overview
The portfolio rebalancing feature allows users to input their current cryptocurrency holdings and receive recommendations to rebalance according to the market capitalization of the top 15 cryptocurrencies.

## User Journey

### 1. Portfolio Entry
- User lands on main page with portfolio entry form
- Fields for each holding:
  - Cryptocurrency symbol/name (autocomplete from top 100 coins)
  - Amount held
  - "Add another coin" button
- USD cash balance field
- "Exclude coins" section to blacklist specific top 15 coins

### 2. Rebalancing Calculation
- "Calculate Rebalancing" button triggers analysis
- System fetches current prices and market caps
- Calculates target allocations based on market cap weights
- Generates exact trade recommendations

### 3. Results Display
- Current portfolio composition (pie chart)
- Target portfolio composition (pie chart)
- Trade recommendations table:
  - Coin name
  - Current amount
  - Target amount
  - Action (Buy/Sell)
  - Trade amount
  - USD value
- Portfolio metrics:
  - Total portfolio value (USD)
  - Number of holdings
  - Largest position
  - Portfolio diversity score

### 4. Portfolio Saving
- "Generate Portfolio Link" creates shareable URL
- URL parameters encode:
  - Holdings (symbol:amount pairs)
  - Excluded coins
  - Timestamp of creation
- "Bookmark this page" instruction for users

## Technical Implementation

### Frontend Components

```
src/app/
├── components/
│   ├── portfolio-entry/
│   │   ├── portfolio-entry.component.ts
│   │   ├── portfolio-entry.component.html
│   │   └── portfolio-entry.component.scss
│   ├── rebalancing-results/
│   │   ├── rebalancing-results.component.ts
│   │   ├── rebalancing-results.component.html
│   │   └── rebalancing-results.component.scss
│   ├── portfolio-chart/
│   │   └── portfolio-chart.component.ts
│   └── trade-recommendations/
│       └── trade-recommendations.component.ts
├── services/
│   ├── market-data.service.ts
│   ├── rebalancing.service.ts
│   └── portfolio-url.service.ts
├── models/
│   ├── portfolio.model.ts
│   ├── coin.model.ts
│   └── trade.model.ts
└── utils/
    ├── market-cap-calculator.ts
    └── url-encoder.ts
```

### API Endpoints

#### GET /api/market-data/top-coins
- Returns top 15 coins by market cap
- Response includes: symbol, name, price, market_cap, 24h_change

#### GET /api/market-data/coin-prices
- Query params: symbols[] (array of coin symbols)
- Returns current prices for requested coins

#### POST /api/rebalancing/calculate
- Request body: current holdings, excluded coins
- Response: target allocations, required trades

### Data Models

#### Portfolio
```typescript
interface Portfolio {
  holdings: Holding[];
  cashBalance: number;
  excludedCoins: string[];
  totalValue?: number;
  lastUpdated?: Date;
}

interface Holding {
  symbol: string;
  amount: number;
  currentPrice?: number;
  currentValue?: number;
  targetAmount?: number;
  targetValue?: number;
}
```

#### Trade Recommendation
```typescript
interface TradeRecommendation {
  symbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  usdValue: number;
  currentHolding: number;
  targetHolding: number;
}
```

## Rebalancing Algorithm

1. **Fetch Market Data**
   - Get top 15 coins by market cap
   - Remove excluded coins from list
   - Get current prices for all coins

2. **Calculate Current Portfolio Value**
   - Sum all holdings × current prices
   - Add USD cash balance

3. **Determine Target Allocations**
   ```
   For each coin in top 15:
     marketCapWeight = coin.marketCap / sumOfTop15MarketCaps
     targetValue = portfolioTotalValue × marketCapWeight
     targetAmount = targetValue / coin.currentPrice
   ```

4. **Generate Trade Recommendations**
   - Compare current vs target amounts
   - Create buy/sell orders
   - Ensure cash balance reaches $0

## URL Parameter Schema

Example URL:
```
https://app.com/?p=BTC:0.5,ETH:10,ADA:1000&cash=5000&exclude=DOGE,SHIB&t=1704067200
```

Parameters:
- `p`: Portfolio holdings (symbol:amount,symbol:amount)
- `cash`: USD cash balance
- `exclude`: Excluded coins (comma-separated)
- `t`: Timestamp (Unix epoch)

## Error Handling

- Invalid coin symbols → Show autocomplete suggestions
- API rate limits → Implement caching and retry logic
- Network errors → Display user-friendly error messages
- Insufficient cash for rebalancing → Show warning with options

## Performance Considerations

- Cache market data for 5 minutes
- Debounce API calls during portfolio entry
- Lazy load chart libraries
- Compress URL parameters for shorter links