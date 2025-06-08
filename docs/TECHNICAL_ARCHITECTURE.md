# API Reference & Technical Specifications

**Last Updated**: June 8, 2025  
**Status**: Client-side architecture with direct CoinGecko integration

> **Note**: For code patterns and implementation details, see `AI_CONTEXT/CODE_PATTERNS.md`

## Current Architecture Overview

```
┌─────────────────┐                    ┌─────────────────┐
│  Angular SPA    │───────────────────▶│ CoinGecko API   │
│  (Static Host)  │  Direct HTTP       │ (Free Tier)     │
└─────────────────┘                    └─────────────────┘
         │                                      
         │ Phase 2: Fetch historical data       
         ▼                                      
┌─────────────────┐     ┌──────────────────┐    
│  Azure Blob     │◀────│ Azure Functions  │
│  Storage        │     │ (Monthly Update) │
│  (Public Read)  │     └──────────────────┘
└─────────────────┘     
```

### Current Implementation (Phase 1)
- **Frontend**: Angular 17+ SPA with direct CoinGecko API calls
- **Backend**: Local development only (not deployed)
- **Infrastructure**: Azure Static Web App + Blob Storage (ready for Phase 2)
- **Cost**: $0/month operational

### Technology Stack
- **Frontend**: Angular 17+, TypeScript, Angular Material, RxJS
- **API**: Direct CoinGecko free tier integration
- **Hosting**: Azure Static Web App (free tier)
- **Testing**: Jest with 70%+ coverage
- **CI/CD**: GitHub Actions

## CoinGecko API Integration

### Base URLs
- **CoinGecko API**: `https://api.coingecko.com/api/v3`
- **Rate Limits**: 50 calls/minute (free tier)
- **Authentication**: None required

### Client-Side Endpoints

#### Market Data
**GET** `/coins/markets`
```
Query Parameters:
- vs_currency: usd
- order: market_cap_desc
- per_page: 1-250 (adjustable for exclusions)
- page: 1
- sparkline: false

Response: Array of coin objects with price, market_cap, etc.
```

#### Price Data
**GET** `/simple/price`
```
Query Parameters:
- ids: comma-separated coin IDs
- vs_currencies: usd

Response: Object with coin prices
```

#### Search
**GET** `/search`
```
Query Parameters:
- query: search term

Response: Search results with coins, exchanges, etc.
```

## Local Development API (Backend)

> **Note**: These endpoints exist for local development only and are NOT deployed to production.

### Base URL
```
Local Development: http://localhost:3001/api/v1
```

### Health Check
**GET** `/health`
```json
Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-06-08T10:00:00Z"
}
```

### Market Data Endpoints

#### Get Top Coins
**GET** `/market/top-coins`
```
Query Parameters:
- limit (optional): Number of coins (default: 15, max: 50)
- exclude (optional): Comma-separated symbols to exclude

Response:
{
  "data": [
    {
      "rank": 1,
      "symbol": "BTC", 
      "name": "Bitcoin",
      "price": 45000.00,
      "marketCap": 880000000000,
      "change24h": 2.5,
      "volume24h": 28000000000
    }
  ],
  "timestamp": "2025-06-08T10:00:00Z",
  "cached": true
}
```

#### Get Coin Prices
**GET** `/market/prices`
```
Query Parameters:
- symbols (required): Comma-separated coin symbols

Response:
{
  "data": {
    "BTC": {
      "price": 45000.00,
      "timestamp": "2025-06-08T10:00:00Z"
    }
  }
}
```

### Rebalancing Endpoints

#### Calculate Rebalancing
**POST** `/rebalance/calculate`
```json
Request Body:
{
  "portfolio": {
    "holdings": [
      {"symbol": "BTC", "amount": 0.5},
      {"symbol": "ETH", "amount": 10}
    ],
    "cashBalance": 5000,
    "excludedCoins": ["DOGE", "SHIB"],
    "maxCoins": 15
  }
}

Response:
{
  "currentValue": 27500,
  "totalValue": 32500,
  "targetAllocations": [
    {
      "symbol": "BTC",
      "targetPercentage": 65.5,
      "targetValue": 18012.50,
      "targetAmount": 0.4003
    }
  ],
  "trades": [
    {
      "symbol": "BTC", 
      "action": "SELL",
      "amount": 0.0997,
      "usdValue": 4486.50
    }
  ],
  "summary": {
    "totalBuys": 5000,
    "totalSells": 5000,
    "estimatedFees": 50
  },
  "metadata": {
    "timestamp": "2025-06-08T10:00:00Z",
    "excludedCoins": ["DOGE", "SHIB"],
    "maxCoins": 15
  }
}
```

### Search Endpoints

#### Search Coins
**GET** `/coins/search`
```
Query Parameters:
- q (required): Search query
- limit (optional): Results limit (default: 10)

Response:
{
  "results": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "logo": "https://..."
    }
  ]
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "symbols", 
      "issue": "Required parameter missing"
    }
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-06-08T10:00:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `EXTERNAL_API_ERROR`: Third-party API failure
- `INTERNAL_ERROR`: Server error

## Caching Strategy

### Client-Side Caching
- **Market Data**: 5-minute cache in memory
- **Static Assets**: Browser cache (1 year)
- **API Responses**: Configurable TTL

### Phase 2 Caching (Historical Data)
- **Blob Storage**: Public CDN distribution
- **File Format**: Single JSON per coin (7.2KB each)
- **Update Frequency**: Monthly via Azure Function

## Performance Targets

### Current Performance (Phase 1)
- **API Response Time**: < 3 seconds (with CoinGecko)
- **Rebalancing Calculation**: < 1 second (client-side)
- **Page Load**: < 3 seconds
- **Chart Rendering**: < 500ms

### Phase 2 Targets
- **Backtesting**: 300-700ms (5-year analysis)
- **Data Fetch**: 100-200ms (parallel downloads)
- **Historical Data**: Sub-second loading

## Security Considerations

### API Security
- **HTTPS Only**: All API communications encrypted
- **CORS**: Configured for frontend domain only
- **Rate Limiting**: Respect CoinGecko limits
- **No Secrets**: Free tier APIs, no authentication

### Data Privacy
- **No User Data**: Anonymous usage only
- **No Cookies**: Stateless application
- **URL Params Only**: Portfolio data in shareable links
- **No Server Storage**: Client-side state management

## Development vs Production

### Development Environment
- **Backend**: Express server at localhost:3001
- **Frontend**: Angular dev server at localhost:4200
- **API**: Local backend with CoinGecko integration

### Production Environment  
- **Backend**: None (client-side only)
- **Frontend**: Azure Static Web App
- **API**: Direct CoinGecko from browser
- **Cost**: $0/month operational