import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-org-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notifications
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View all your organization notifications and alerts
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button (click)="loadNotifications()" class="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">refresh</span>
            <span>Refresh</span>
          </button>
          <a routerLink="/org/dashboard" class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard</span>
          </a>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="glass-card rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">All Notifications</h2>
          <p class="text-xs text-slate-500">View all your notifications in one place</p>
        </div>

        @if (loading()) {
          <div class="p-8 text-center text-slate-500">
            <span class="material-symbols-outlined animate-spin text-3xl">refresh</span>
            <p class="mt-2">Loading notifications...</p>
          </div>
        }

        @if (!loading() && notifications().length === 0) {
          <div class="p-8 text-center text-slate-500">
            <span class="material-symbols-outlined text-4xl">notifications_none</span>
            <p class="mt-2">No notifications yet</p>
          </div>
        }

        @if (!loading() && notifications().length > 0) {
          <div class="divide-y divide-slate-200 dark:divide-slate-700">
            @for (notification of notifications(); track notification.id) {
              <div 
                [class.bg-brand-50]="!notification.isRead"
                [class.dark:bg-brand-950]="!notification.isRead"
                class="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <div class="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <span class="material-symbols-outlined text-xl">{{ getNotificationIcon(notification.type) }}</span>
                      </div>
                      <div>
                        <p class="text-sm font-bold text-slate-900 dark:text-white">{{ notification.title }}</p>
                        <p class="text-xs text-slate-500">{{ notification.createdAt | date:'medium' }}</p>
                      </div>
                      @if (!notification.isRead) {
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                          NEW
                        </span>
                      }
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ notification.message }}</p>
                    @if (notification.orderNumber) {
                      <p class="text-xs text-slate-500 mt-2">Order: <strong class="text-slate-900 dark:text-white">{{ notification.orderNumber }}</strong></p>
                    }
                  </div>
                  <div class="flex items-center space-x-2">
                    @if (!notification.isRead) {
                      <button (click)="markAsRead(notification.id)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Mark as read">
                        <span class="material-symbols-outlined">check_circle</span>
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class OrgNotificationsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private apiUrl = 'http://localhost:8085';

  loading = signal(false);
  notifications = signal<any[]>([]);

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.http.get<any>(`${this.apiUrl}/api/v1/notifications/user/${userId}`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.notifications.set(res.data);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  markAsRead(id: number) {
    this.http.patch<any>(`${this.apiUrl}/api/v1/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(list => 
          list.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'order_assigned': return 'assignment';
      case 'order_completed': return 'check_circle';
      case 'defect_reported': return 'report';
      case 'recall_initiated': return 'warning';
      case 'stakeholder_assigned': return 'person_add';
      case 'status_update': return 'update';
      default: return 'notifications';
    }
  }
}
