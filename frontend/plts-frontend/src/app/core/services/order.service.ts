import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Order, Role } from '../models/plts.models';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${API_BASE_URL}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orgId: number, payload: any): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/org/${orgId}`, payload);
  }

  getOrgOrders(orgId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/org/${orgId}`);
  }

  getStakeholderOrders(stakeholderId: number, role: Role): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      `${this.apiUrl}/stakeholder/${stakeholderId}?role=${role}`,
    );
  }

  getOrdersForStakeholderUser(userId: number, role: Role): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(
      `${this.apiUrl}/stakeholder/user/${userId}?role=${role}`,
    );
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  assignManufacturer(
    orderId: number,
    stakeholderId: number,
    remarks?: string,
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/assign-manufacturer`, {
      stakeholderId,
      remarks,
    });
  }

  updateManufacturerStatus(
    orderId: number,
    action: string,
    payload?: any,
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/manufacturer-status?action=${action}`,
      payload || {},
    );
  }

  assignQa(
    orderId: number,
    stakeholderId: number,
    remarks?: string,
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/assign-qa`, {
      stakeholderId,
      remarks,
    });
  }

  updateQaStatus(orderId: number, action: string, payload?: any): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/qa-status?action=${action}`,
      payload || {},
    );
  }

  assignPackaging(
    orderId: number,
    stakeholderId: number,
    remarks?: string,
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/assign-packaging`, {
      stakeholderId,
      remarks,
    });
  }

  updatePackagingStatus(
    orderId: number,
    action: string,
    payload?: any,
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/packaging-status?action=${action}`,
      payload || {},
    );
  }

  assignRetailer(
    orderId: number,
    stakeholderId: number,
    remarks?: string,
  ): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/assign-retailer`, {
      stakeholderId,
      remarks,
    });
  }

  updateRetailerStatus(orderId: number, action: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(
      `${this.apiUrl}/${orderId}/retailer-status?action=${action}`,
      {},
    );
  }

  getQrCode(orderId: number): Observable<ApiResponse<{ orderNumber: string; qrCode: string }>> {
    return this.http.get<ApiResponse<{ orderNumber: string; qrCode: string }>>(
      `${this.apiUrl}/${orderId}/qr-code`,
    );
  }

  exportPdf(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${orderId}/export-pdf`, { responseType: 'blob' });
  }

  exportExcel(orgId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/org/${orgId}/export-excel`, { responseType: 'blob' });
  }

  cancelOrder(orderId: number, reason: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.apiUrl}/${orderId}/cancel`, { reason });
  }
}
