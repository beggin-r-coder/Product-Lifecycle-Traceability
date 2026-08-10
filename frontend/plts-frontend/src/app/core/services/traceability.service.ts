import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PublicTraceability } from '../models/plts.models';

@Injectable({
  providedIn: 'root'
})
export class TraceabilityService {
  private apiUrl = 'http://localhost:8085/api/v1/public';

  constructor(private http: HttpClient) {}

  getPublicTraceability(orderNumber: string): Observable<ApiResponse<PublicTraceability>> {
    return this.http.get<ApiResponse<PublicTraceability>>(`${this.apiUrl}/traceability/${orderNumber}`);
  }
}
