# CODE_PATTERNS.md
*How we implement features in this codebase*

## 🏗️ Angular Component Structure

### Standalone Components Pattern
```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule
  ],
  template: `
    <mat-card>
      <!-- Content -->
    </mat-card>
  `
})
export class ExampleComponent {
  // Component logic
}
```

### Form Handling Pattern
```typescript
// Reactive forms with validation
private fb = inject(FormBuilder);
portfolioForm = this.fb.group({
  holdings: this.fb.array([]),
  cashBalance: [0, [Validators.required, Validators.min(0)]],
  maxCoins: [15, [Validators.required, Validators.min(1), Validators.max(50)]]
});
```

## 🌐 API Service Patterns

### Caching Pattern
```typescript
export class ApiService {
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

### Error Handling Pattern
```typescript
return this.http.get<ApiResponse>(url, { params })
  .pipe(
    map(response => this.transformData(response)),
    catchError(error => {
      console.error('API Error:', error);
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }
      throw new Error('Failed to fetch data. Please try again.');
    })
  );
```

### Direct CoinGecko API Pattern
```typescript
// Always use CoinGecko API directly from browser
private readonly coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';

getTopCoins(limit: number, exclude: string[]): Observable<Coin[]> {
  const params = new HttpParams()
    .set('vs_currency', 'usd')
    .set('order', 'market_cap_desc')
    .set('per_page', limit.toString());
    
  return this.http.get<any[]>(`${this.coinGeckoBaseUrl}/coins/markets`, { params });
}
```

## 📊 Chart Implementation Pattern

### Chart Data Preparation
```typescript
private prepareChartData(allocations: Allocation[]): ChartData {
  return {
    labels: allocations.map(a => a.symbol),
    datasets: [{
      data: allocations.map(a => a.percentage),
      backgroundColor: this.generateColors(allocations.length)
    }]
  };
}

private calculateBarHeights(allocations: Allocation[]): number[] {
  const maxPercentage = Math.max(...allocations.map(a => a.percentage));
  return allocations.map(a => (a.percentage / maxPercentage) * 200); // 200px max height
}
```

## 🎨 Material Design Integration

### Card Layout Pattern
```html
<mat-card>
  <mat-card-header>
    <mat-card-title>{{ title }}</mat-card-title>
    <mat-card-subtitle>{{ subtitle }}</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>
    <!-- Main content -->
  </mat-card-content>
  <mat-card-actions align="end">
    <button mat-raised-button color="primary">Action</button>
  </mat-card-actions>
</mat-card>
```

### Form Field Pattern
```html
<mat-form-field appearance="outline">
  <mat-label>Label</mat-label>
  <input matInput formControlName="fieldName" type="number" min="0">
  <mat-error *ngIf="form.get('fieldName')?.errors?.['required']">
    Field is required
  </mat-error>
</mat-form-field>
```

## 🔄 State Management Pattern

### URL-Based State Persistence
```typescript
// Save portfolio to URL
private updateUrl(portfolio: Portfolio): void {
  const params = new URLSearchParams();
  params.set('holdings', JSON.stringify(portfolio.holdings));
  params.set('cash', portfolio.cashBalance.toString());
  params.set('maxCoins', portfolio.maxCoins.toString());
  
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', url);
}

// Load portfolio from URL
private loadFromUrl(): Portfolio | null {
  const params = new URLSearchParams(window.location.search);
  const holdingsParam = params.get('holdings');
  
  if (holdingsParam) {
    return {
      holdings: JSON.parse(holdingsParam),
      cashBalance: Number(params.get('cash')) || 0,
      maxCoins: Number(params.get('maxCoins')) || 15
    };
  }
  return null;
}
```

## 🧪 Testing Patterns

### Component Testing
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['getTopCoins']);
    
    await TestBed.configureTestingModule({
      imports: [ComponentName],
      providers: [
        { provide: ApiService, useValue: spy }
      ]
    }).compileComponents();

    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });
});
```

### Service Testing with Mocks
```typescript
beforeEach(() => {
  httpMock = TestBed.inject(HttpTestingController);
  service = TestBed.inject(ApiService);
});

it('should cache API responses', () => {
  const mockData = [{ symbol: 'BTC', name: 'Bitcoin' }];
  
  service.getTopCoins(10).subscribe(result => {
    expect(result.cached).toBe(false);
  });
  
  const req = httpMock.expectOne(request => 
    request.url.includes('/coins/markets')
  );
  req.flush(mockData);
});
```

## 🎯 Rebalancing Logic Pattern

### Market Cap Calculation
```typescript
private calculateTargetAllocations(coins: Coin[], totalValue: number): Allocation[] {
  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.marketCap, 0);
  
  return coins.map(coin => ({
    symbol: coin.symbol,
    name: coin.name,
    percentage: (coin.marketCap / totalMarketCap) * 100,
    targetValue: (coin.marketCap / totalMarketCap) * totalValue,
    currentValue: 0 // Set from portfolio holdings
  }));
}
```

## 🚨 Error Display Pattern

### User-Friendly Error Messages
```typescript
private handleApiError(error: any): string {
  if (error.status === 429) {
    return 'Rate limit exceeded. Please wait a few minutes before trying again.';
  } else if (error.status === 0) {
    return 'Unable to connect to the internet. Please check your connection.';
  } else if (error.status >= 500) {
    return 'Server error. Please try again in a few minutes.';
  }
  return 'An unexpected error occurred. Please try again.';
}
```

## 🎨 Styling Conventions

### CSS Class Naming
```scss
// Use BEM methodology
.portfolio-entry {
  &__header { }
  &__form { }
  &__actions { }
  
  &--loading { }
  &--error { }
}

// Material theme integration
.mat-mdc-card {
  margin-bottom: 16px;
}
```

## 🔧 Utility Patterns

### Number Formatting
```typescript
formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
```

### Debug Output Pattern
```typescript
private debugLog(level: number, message: string, data?: any): void {
  const debugLevel = Number(localStorage.getItem('portfolioDebugLevel')) || 0;
  if (level <= debugLevel) {
    const prefix = ['[ERROR]', '[WARN]', '[INFO]', '[DEBUG]'][level - 1];
    console.log(`${prefix} ${message}`, data || '');
  }
}
```

## 🌐 API Response Patterns

### Standard Response Format
```typescript
interface ApiResponse<T> {
  data: T;
  timestamp: string;
  cached: boolean;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
  timestamp: string;
}

// Common error codes
enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND', 
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### API Integration Patterns
```typescript
// CoinGecko market data
interface CoinGeckoResponse {
  rank: number;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  change24h: number;
  volume24h: number;
}

// Portfolio calculation response
interface RebalanceResponse {
  currentValue: number;
  totalValue: number;
  targetAllocations: Allocation[];
  trades: Trade[];
  summary: {
    totalBuys: number;
    totalSells: number;
    estimatedFees: number;
  };
  metadata: {
    timestamp: string;
    excludedCoins: string[];
    maxCoins: number;
  };
}
```

## 📊 Performance Patterns

### Cache Headers Pattern
```typescript
// Set appropriate cache headers for API responses
const setCacheHeaders = (response: Response, ttl: number) => {
  response.headers.set('Cache-Control', `public, max-age=${ttl}`);
  response.headers.set('ETag', generateETag(response.body));
  response.headers.set('Last-Modified', new Date().toUTCString());
};
```

### Rate Limiting Pattern
```typescript
interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

const handleRateLimit = (error: HttpErrorResponse): string => {
  if (error.status === 429) {
    const retryAfter = error.headers.get('retry-after');
    if (retryAfter) {
      return `Rate limit exceeded. Please try again in ${retryAfter} seconds.`;
    }
    return 'Rate limit exceeded. Please try again in a few minutes.';
  }
  return 'An unexpected error occurred.';
};
```

## 🔐 Security Patterns

### CORS Configuration
```typescript
const corsOptions = {
  origin: [
    'https://blue-glacier-0ffdf2d1e.6.azurestaticapps.net',
    'http://localhost:4200'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
  credentials: false // No authentication required
};
```

### Input Validation Pattern
```typescript
import Joi from 'joi';

const portfolioSchema = Joi.object({
  holdings: Joi.array().items(
    Joi.object({
      symbol: Joi.string().uppercase().required(),
      amount: Joi.number().positive().required()
    })
  ).required(),
  cashBalance: Joi.number().min(0).required(),
  maxCoins: Joi.number().integer().min(1).max(50).default(15)
});

const validateRequest = (data: any, schema: Joi.Schema) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  return value;
};
```