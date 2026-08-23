import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Role, Stakeholder } from '../models/plts.models';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class StakeholderService {
  private readonly apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  createStakeholder(orgId: number, payload: any): Observable<ApiResponse<Stakeholder>> {
    return this.http.post<ApiResponse<Stakeholder>>(
      `${this.apiUrl}/organizations/${orgId}/stakeholders`,
      payload,
    );
  }

  getStakeholders(orgId: number, role?: Role): Observable<ApiResponse<Stakeholder[]>> {
    let url = `${this.apiUrl}/organizations/${orgId}/stakeholders`;
    if (role) {
      url += `?role=${role}`;
    }
    return this.http.get<ApiResponse<Stakeholder[]>>(url);
  }

  getStakeholderById(id: number): Observable<ApiResponse<Stakeholder>> {
    return this.http.get<ApiResponse<Stakeholder>>(`${this.apiUrl}/stakeholders/${id}`);
  }
}
