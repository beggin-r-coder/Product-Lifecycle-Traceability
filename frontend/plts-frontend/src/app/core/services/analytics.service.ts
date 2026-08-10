import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DashboardAnalytics } from '../models/plts.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8085/api/v1/analytics';

  constructor(private http: HttpClient) {}

  getAnalytics(orgId: number, userId?: number): Observable<ApiResponse<DashboardAnalytics>> {
    let url = `${this.apiUrl}/org/${orgId}`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    return this.http.get<ApiResponse<DashboardAnalytics>>(url);
  }
}
