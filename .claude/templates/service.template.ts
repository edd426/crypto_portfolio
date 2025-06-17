import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, catchError, throwError } from 'rxjs';

// Import your models
// import { YourModel } from '../models/your.model';

@Injectable({
  providedIn: 'root'
})
export class [ServiceName]Service {
  // API configuration
  private readonly apiBaseUrl = 'https://api.example.com/v1';
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(private http: HttpClient) {}

  /**
   * Example method - Get data from API with caching
   * @param id The resource ID
   * @returns Observable of the data
   */
  getData(id: string): Observable<any> {
    const cacheKey = `data-${id}`;
    const cachedData = this.getFromCache(cacheKey);
    
    if (cachedData) {
      return of(cachedData);
    }

    return this.http.get<any>(`${this.apiBaseUrl}/resource/${id}`)
      .pipe(
        map(response => {
          // Transform response if needed
          const transformedData = this.transformData(response);
          this.setCache(cacheKey, transformedData);
          return transformedData;
        }),
        catchError(error => {
          console.error(`[ServiceName] Error fetching data for ${id}:`, error);
          return throwError(() => new Error('Failed to fetch data'));
        })
      );
  }

  /**
   * Example method - Post data to API
   * @param data The data to post
   * @returns Observable of the response
   */
  postData(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/resource`, data)
      .pipe(
        map(response => {
          // Clear relevant cache on successful update
          this.clearCache();
          return response;
        }),
        catchError(error => {
          console.error('[ServiceName] Error posting data:', error);
          return throwError(() => new Error('Failed to save data'));
        })
      );
  }

  /**
   * Transform API response to internal model
   * @param data Raw API response
   * @returns Transformed data
   */
  private transformData(data: any): any {
    // Transform your data here
    return {
      ...data,
      // Add any transformations
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Get data from cache if available and not expired
   * @param key Cache key
   * @returns Cached data or null
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache or specific keys
   * @param keys Optional specific keys to clear
   */
  private clearCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }
}