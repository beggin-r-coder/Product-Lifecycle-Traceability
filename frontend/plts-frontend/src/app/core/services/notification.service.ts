import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, NotificationItem } from '../models/plts.models';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiUrl = `${API_BASE_URL}/notifications`;
  unreadCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getNotifications(userId: number): Observable<ApiResponse<NotificationItem[]>> {
    return this.http.get<ApiResponse<NotificationItem[]>>(`${this.apiUrl}/user/${userId}`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          const unread = res.data.filter((n) => !n.isRead).length;
          this.unreadCount.set(unread);
        }
      }),
    );
  }

  fetchUnreadCount(userId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/user/${userId}/unread-count`).pipe(
      tap((res) => {
        if (res.success) {
          this.unreadCount.set(res.data);
        }
      }),
    );
  }

  markAsRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.unreadCount.update((c) => Math.max(0, c - 1));
      }),
    );
  }

  markAllAsRead(userId: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/user/${userId}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
      }),
    );
  }

  deleteNotification(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
