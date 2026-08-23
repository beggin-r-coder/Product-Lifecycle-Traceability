import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PublicTraceability } from '../models/plts.models';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class TraceabilityService {
  private readonly apiUrl = `${API_BASE_URL}/public`;

  constructor(private http: HttpClient) {}

  getPublicTraceability(orderNumber: string): Observable<ApiResponse<PublicTraceability>> {
    return this.http.get<ApiResponse<PublicTraceability>>(
      `${this.apiUrl}/traceability/${orderNumber}`,
    );
  }
}
