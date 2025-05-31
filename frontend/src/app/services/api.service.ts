import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coin, Portfolio, RebalanceResult } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001/api/v1';

  constructor(private http: HttpClient) {}

  getTopCoins(limit: number = 15, exclude: string[] = []): Observable<{data: Coin[], timestamp: string, cached: boolean}> {
    let params = new HttpParams().set('limit', limit.toString());
    if (exclude.length > 0) {
      params = params.set('exclude', exclude.join(','));
    }
    
    return this.http.get<{data: Coin[], timestamp: string, cached: boolean}>(`${this.baseUrl}/market/top-coins`, { params });
  }

  getCoinPrices(symbols: string[]): Observable<{data: Record<string, {price: number, timestamp: string}>}> {
    const params = new HttpParams().set('symbols', symbols.join(','));
    return this.http.get<{data: Record<string, {price: number, timestamp: string}>}>(`${this.baseUrl}/market/prices`, { params });
  }

  searchCoins(query: string, limit: number = 10): Observable<{results: Array<{symbol: string, name: string, logo?: string}>}> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    
    return this.http.get<{results: Array<{symbol: string, name: string, logo?: string}>}>(`${this.baseUrl}/market/search`, { params });
  }

  calculateRebalancing(portfolio: Portfolio, excludedCoins: string[] = [], topN: number = 15): Observable<RebalanceResult> {
    const body = {
      portfolio,
      excludedCoins,
      options: { topN }
    };
    
    return this.http.post<RebalanceResult>(`${this.baseUrl}/rebalance/calculate`, body);
  }

  checkHealth(): Observable<{status: string, version: string, timestamp: string}> {
    return this.http.get<{status: string, version: string, timestamp: string}>(`${this.baseUrl}/health`);
  }
}