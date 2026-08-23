import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthResponse, Role, User } from '../models/plts.models';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${API_BASE_URL}/auth`;

  currentUser = signal<User | null>(this.getUserFromStorage());
  token = signal<string | null>(localStorage.getItem('plts_token'));

  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role || null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  registerOrg(payload: any): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/register-org`, payload);
  }

  verifyOrgOtp(identifier: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-org-otp`, { identifier, otp })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.setSession(res.data);
          }
        }),
      );
  }

  loginOrg(payload: any): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/login-org`, payload);
  }

  verifyOrgLoginOtp(identifier: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-org-login-otp`, { identifier, otp })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.setSession(res.data);
          }
        }),
      );
  }

  sendStakeholderOtp(generatedUserId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/send-stakeholder-otp`, {
      generatedUserId,
    });
  }

  verifyStakeholderOtp(identifier: string, otp: string): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/verify-stakeholder-otp`, { identifier, otp })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.setSession(res.data);
          }
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('plts_token');
    localStorage.removeItem('plts_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private setSession(authData: AuthResponse): void {
    const user: User = {
      id: authData.userId,
      email: authData.email,
      generatedUserId: authData.generatedUserId,
      role: authData.role,
      name: authData.name,
      companyName: authData.companyName,
      organizationId: authData.organizationId,
    };

    localStorage.setItem('plts_token', authData.token);
    localStorage.setItem('plts_user', JSON.stringify(user));

    this.token.set(authData.token);
    this.currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('plts_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.token();
  }
}
