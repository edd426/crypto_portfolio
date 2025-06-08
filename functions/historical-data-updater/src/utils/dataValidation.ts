/**
 * Data validation utilities for historical cryptocurrency data
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  marketCap: number;
  volume24h: number;
}

/**
 * Validate a single historical data point
 */
export function validateDataPoint(point: HistoricalDataPoint): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Date validation
  if (!point.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(point.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    } else {
      // Check if date is reasonable (not in future, not before 2009)
      const now = new Date();
      const bitcoinStart = new Date('2009-01-01');
      
      if (date > now) {
        errors.push('Date cannot be in the future');
      }
      if (date < bitcoinStart) {
        warnings.push('Date is before Bitcoin creation (2009)');
      }
    }
  }

  // Price validation
  if (typeof point.price !== 'number') {
    errors.push('Price must be a number');
  } else {
    if (point.price < 0) {
      errors.push('Price cannot be negative');
    }
    if (point.price === 0) {
      warnings.push('Price is zero');
    }
    if (point.price > 10000000) {
      warnings.push('Price seems unusually high (>$10M)');
    }
  }

  // Market cap validation
  if (typeof point.marketCap !== 'number') {
    errors.push('Market cap must be a number');
  } else {
    if (point.marketCap < 0) {
      errors.push('Market cap cannot be negative');
    }
    if (point.marketCap === 0) {
      warnings.push('Market cap is zero');
    }
  }

  // Volume validation
  if (typeof point.volume24h !== 'number') {
    errors.push('Volume must be a number');
  } else {
    if (point.volume24h < 0) {
      errors.push('Volume cannot be negative');
    }
  }

  // Cross-validation
  if (point.price > 0 && point.marketCap === 0) {
    warnings.push('Price exists but market cap is zero');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate an array of historical data points
 */
export function validateHistoricalData(data: HistoricalDataPoint[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Data must be an array'],
      warnings: []
    };
  }

  if (data.length === 0) {
    return {
      isValid: false,
      errors: ['Data array cannot be empty'],
      warnings: []
    };
  }

  // Validate each data point
  data.forEach((point, index) => {
    const result = validateDataPoint(point);
    
    result.errors.forEach(error => {
      allErrors.push(`Point ${index}: ${error}`);
    });
    
    result.warnings.forEach(warning => {
      allWarnings.push(`Point ${index}: ${warning}`);
    });
  });

  // Check for chronological order
  for (let i = 1; i < data.length; i++) {
    const prevDate = new Date(data[i - 1].date);
    const currDate = new Date(data[i].date);
    
    if (currDate <= prevDate) {
      allErrors.push(`Point ${i}: Date ${data[i].date} is not after previous date ${data[i - 1].date}`);
    }
  }

  // Check for duplicates
  const dates = new Set<string>();
  data.forEach((point, index) => {
    if (dates.has(point.date)) {
      allErrors.push(`Point ${index}: Duplicate date ${point.date}`);
    }
    dates.add(point.date);
  });

  // Check for significant gaps (more than 35 days between consecutive points)
  for (let i = 1; i < data.length; i++) {
    const prevDate = new Date(data[i - 1].date);
    const currDate = new Date(data[i].date);
    const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 35) {
      allWarnings.push(`Large gap between ${data[i - 1].date} and ${data[i].date} (${Math.round(daysDiff)} days)`);
    }
  }

  // Check for extreme price movements (>90% change between consecutive points)
  for (let i = 1; i < data.length; i++) {
    const prevPrice = data[i - 1].price;
    const currPrice = data[i].price;
    
    if (prevPrice > 0 && currPrice > 0) {
      const changePercent = Math.abs((currPrice - prevPrice) / prevPrice) * 100;
      
      if (changePercent > 90) {
        allWarnings.push(`Large price movement between ${data[i - 1].date} and ${data[i].date} (${changePercent.toFixed(1)}%)`);
      }
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Clean and normalize historical data
 */
export function cleanHistoricalData(data: HistoricalDataPoint[]): HistoricalDataPoint[] {
  return data
    .filter(point => {
      // Remove points with invalid basic data
      return point.date && 
             typeof point.price === 'number' && 
             typeof point.marketCap === 'number' && 
             typeof point.volume24h === 'number' &&
             point.price >= 0 && 
             point.marketCap >= 0 && 
             point.volume24h >= 0;
    })
    .map(point => ({
      date: point.date,
      price: Math.round(point.price * 100000000) / 100000000, // Round to 8 decimal places
      marketCap: Math.round(point.marketCap),
      volume24h: Math.round(point.volume24h)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Validate CoinGecko API response format
 */
export function validateCoinGeckoResponse(response: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!response) {
    return {
      isValid: false,
      errors: ['Response is null or undefined'],
      warnings: []
    };
  }

  // Check required arrays
  if (!Array.isArray(response.prices)) {
    errors.push('prices array is missing or invalid');
  }
  if (!Array.isArray(response.market_caps)) {
    errors.push('market_caps array is missing or invalid');
  }
  if (!Array.isArray(response.total_volumes)) {
    errors.push('total_volumes array is missing or invalid');
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Check array lengths match
  const pricesLength = response.prices.length;
  const marketCapsLength = response.market_caps.length;
  const volumesLength = response.total_volumes.length;

  if (pricesLength !== marketCapsLength || pricesLength !== volumesLength) {
    warnings.push(`Array lengths don't match: prices=${pricesLength}, market_caps=${marketCapsLength}, volumes=${volumesLength}`);
  }

  // Check data format
  if (pricesLength > 0) {
    const samplePrice = response.prices[0];
    if (!Array.isArray(samplePrice) || samplePrice.length !== 2) {
      errors.push('Invalid price data format - expected [timestamp, price] arrays');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}