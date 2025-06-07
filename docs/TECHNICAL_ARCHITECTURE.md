# Technical Architecture & API Documentation

**Last Updated**: June 7, 2025  
**Status**: Architecture finalized - client-side optimized design

## System Architecture

### FINALIZED High-Level Architecture
```
┌─────────────────┐                    ┌─────────────────┐
│                 │ Direct HTTP calls  │                 │
│  Angular SPA    │───────────────────▶│ External APIs   │
│  (Static Host)  │                    │ (CoinGecko)     │
│                 │                    │                 │
└─────────────────┘                    └─────────────────┘
         │                                       │
         │ Fetch historical data                 │ Monthly updates
         ▼                                       ▼
┌─────────────────┐     ┌──────────────────┐    ┌──────────────────┐
│  Azure CDN      │     │ Azure Blob       │◀───│ Azure Functions  │
│  (Static Assets)│     │ Storage (Public) │    │ (Data Updates)   │
└─────────────────┘     └──────────────────┘    └──────────────────┘
```

### Architecture Changes (June 7, 2025)
- **✅ ELIMINATED**: Azure Redis Cache (99% cost reduction)
- **✅ ELIMINATED**: Azure Functions for computation (client-side instead)
- **✅ SIMPLIFIED**: Direct browser-to-CoinGecko API calls for Phase 1
- **✅ OPTIMIZED**: Azure Blob Storage with public read access
- **✅ MINIMIZED**: Single monthly Azure Function for data updates only

### Technology Stack Details

#### Frontend (Angular SPA)
- **Angular 17+** with standalone components
- **TypeScript 5.0+** with strict mode
- **RxJS** for reactive programming
- **Angular Material** for UI components
- **Chart.js** with ng2-charts wrapper
- **Tailwind CSS** for utility styling

#### Backend (Serverless)
- **Azure Functions v4** with Node.js 18+
- **TypeScript** for type safety
- **Express.js** compatibility layer
- **Joi** for request validation
- **Axios** for HTTP requests
- **Node-cache** for in-memory caching

#### Infrastructure
- **Terraform** for IaC
- **GitHub Actions** for CI/CD
- **Azure Key Vault** for secrets
- **Application Insights** for monitoring

## API Specification

### Base URL Structure
```
Production: https://api.cryptoportfolio.azure.com
Development: https://api-dev.cryptoportfolio.azure.com
```

### Authentication
No authentication required (anonymous usage)

### Rate Limiting
- 100 requests per minute per IP
- 429 status code when exceeded
- X-RateLimit headers included

### Common Headers
```http
Content-Type: application/json
X-API-Version: 1.0
X-Request-ID: <uuid>
```

## API Endpoints

### Market Data Endpoints

#### GET /api/v1/market/top-coins
Retrieve top cryptocurrencies by market cap.

**Query Parameters:**
- `limit` (optional): Number of coins (default: 15, max: 100)
- `exclude` (optional): Comma-separated symbols to exclude

**Response:**
```json
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
  "timestamp": "2024-01-15T10:00:00Z",
  "cached": true
}
```

#### GET /api/v1/market/prices
Get current prices for specific coins.

**Query Parameters:**
- `symbols` (required): Comma-separated coin symbols

**Response:**
```json
{
  "data": {
    "BTC": {
      "price": 45000.00,
      "timestamp": "2024-01-15T10:00:00Z"
    },
    "ETH": {
      "price": 2500.00,
      "timestamp": "2024-01-15T10:00:00Z"
    }
  }
}
```

### Rebalancing Endpoints

#### POST /api/v1/rebalance/calculate
Calculate portfolio rebalancing recommendations.

**Request Body:**
```json
{
  "portfolio": {
    "holdings": [
      {"symbol": "BTC", "amount": 0.5},
      {"symbol": "ETH", "amount": 10}
    ],
    "cashBalance": 5000
  },
  "excludedCoins": ["DOGE", "SHIB"],
  "options": {
    "topN": 15
  }
}
```

**Response:**
```json
{
  "currentValue": 27500,
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
  }
}
```

### Backtesting Endpoints

#### POST /api/v1/backtest/run
Execute a portfolio backtest.

**Request Body:**
```json
{
  "portfolio": {
    "holdings": [{"symbol": "BTC", "amount": 1}],
    "cashBalance": 0
  },
  "config": {
    "startDate": "2022-01-01",
    "endDate": "2023-12-31",
    "rebalanceFrequency": "monthly",
    "transactionFee": 0.5,
    "slippage": 0.1,
    "excludedCoins": []
  }
}
```

**Response:**
```json
{
  "summary": {
    "initialValue": 47000,
    "finalValue": 68500,
    "totalReturn": 45.74,
    "annualizedReturn": 20.87,
    "sharpeRatio": 1.23,
    "maxDrawdown": -22.5,
    "totalFees": 1250
  },
  "timeSeries": [
    {
      "date": "2022-01-01",
      "portfolioValue": 47000,
      "hodlValue": 47000
    }
  ],
  "rebalancingEvents": [
    {
      "date": "2022-02-01",
      "trades": [...],
      "fees": 125
    }
  ]
}
```

#### GET /api/v1/backtest/data-availability
Check historical data availability for coins.

**Response:**
```json
{
  "coins": {
    "BTC": {
      "earliestDate": "2013-04-28",
      "latestDate": "2024-01-15",
      "dataQuality": "excellent"
    }
  }
}
```

### Utility Endpoints

#### GET /api/v1/coins/search
Search for coins by name or symbol.

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Results limit (default: 10)

**Response:**
```json
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

#### GET /api/v1/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "dependencies": {
    "coinGecko": "operational",
    "redis": "operational"
  }
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
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `EXTERNAL_API_ERROR`: Third-party API failure
- `INTERNAL_ERROR`: Server error

## Caching Strategy

### Cache Layers
1. **Browser Cache**
   - Static assets: 1 year
   - API responses: Via Cache-Control headers

2. **Azure CDN**
   - Static content edge caching
   - Geographic distribution

3. **Redis Cache**
   - Market data: 5 minutes
   - Backtest results: 1 hour
   - API responses: Configurable TTL

### Cache Key Patterns
```
market:top-coins:15:exclude-DOGE,SHIB
market:prices:BTC,ETH
backtest:<hash-of-params>
```

## Security Considerations

### API Security
- HTTPS only
- CORS configuration for frontend domain
- Request validation and sanitization
- Rate limiting per IP
- API versioning for backward compatibility

### Secret Management
- API keys in Azure Key Vault
- Environment variables for configuration
- No sensitive data in code or logs

### Data Privacy
- No user data collection
- No cookies or tracking
- Portfolio data only in URL parameters
- No server-side storage of user data

## Performance Targets

### API Response Times
- Market data endpoints: < 200ms (cached)
- Rebalancing calculation: < 500ms
- Backtest execution: < 30s for 2-year period

### Frontend Performance
- Initial page load: < 2s
- Time to interactive: < 3s
- Lighthouse score: > 90

### Scalability
- Auto-scaling Azure Functions
- Redis cluster for high availability
- CDN for global distribution