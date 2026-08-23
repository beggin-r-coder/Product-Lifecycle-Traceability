import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DashboardAnalytics } from '../models/plts.models';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly apiUrl = `${API_BASE_URL}/analytics`;

  constructor(private http: HttpClient) {}

  getAnalytics(orgId: number, userId?: number): Observable<ApiResponse<DashboardAnalytics>> {
    let url = `${this.apiUrl}/org/${orgId}`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    return this.http.get<ApiResponse<DashboardAnalytics>>(url);
  }

  getPublicStats(): Observable<
    ApiResponse<{ totalOrganizations: string; totalProducts: string; uptime: string }>
  > {
    return this.http.get<
      ApiResponse<{ totalOrganizations: string; totalProducts: string; uptime: string }>
    >(`${this.apiUrl}/public/stats`);
  }
}
