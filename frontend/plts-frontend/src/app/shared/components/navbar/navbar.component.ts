import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/plts.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <!-- Left: Logo & Search -->
      <div class="flex items-center space-x-4 md:space-x-8">
        <a routerLink="/" class="flex items-center space-x-2.5">
          <div class="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <span class="material-symbols-outlined text-xl">token</span>
          </div>
          <div>
            <span class="font-heading font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">PLTS</span>
            <span class="hidden sm:inline-block ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Enterprise
            </span>
          </div>
        </a>

        <!-- Public Traceability Search -->
        <div class="relative hidden sm:block w-64 md:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Search Order ID (e.g. ORD-20260806-1001)..." 
            [(ngModel)]="searchQuery"
            (keyup.enter)="onSearch()"
            class="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          >
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center space-x-3">
        <!-- Public Trace Link -->
        <a routerLink="/traceability" class="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800">
          <span class="material-symbols-outlined text-sm">qr_code_scanner</span>
          <span>Public Trace</span>
        </a>

        <!-- Notifications Bell (If Logged In) -->
        <div *ngIf="auth.isAuthenticated()" class="relative">
          <button 
            (click)="toggleNotifications()"
            class="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined text-xl">notifications</span>
            <span 
              *ngIf="notificationService.unreadCount() > 0"
              class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-sm animate-pulse"
            >
              {{ notificationService.unreadCount() }}
            </span>
          </button>

          <!-- Notification Dropdown -->
          <div 
            *ngIf="showNotifications()" 
            class="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
          >
            <div class="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-sm text-slate-900 dark:text-white">Notifications</span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                  {{ notificationService.unreadCount() }} new
                </span>
              </div>
              <button 
                (click)="markAllAsRead()" 
                class="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            </div>

            <div class="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              <div *ngIf="notificationsList().length === 0" class="p-6 text-center text-slate-400 text-sm">
                No notifications found.
              </div>
              <div 
                *ngFor="let n of notificationsList()" 
                [class.bg-brand-50\/40]="!n.isRead"
                [class.dark:bg-brand-950\/20]="!n.isRead"
                class="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800\/60 transition-colors flex space-x-3 items-start"
              >
                <div class="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-base">info</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ n.title }}</p>
                    <span class="text-[10px] text-slate-400">{{ n.createdAt | date:'shortTime' }}</span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{{ n.message }}</p>
                  <button 
                    *ngIf="!n.isRead" 
                    (click)="markRead(n.id)" 
                    class="mt-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile Avatar & Menu -->
        <div *ngIf="auth.isAuthenticated()" class="relative">
          <button 
            (click)="toggleUserMenu()"
            class="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div class="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
              {{ auth.currentUser()?.name?.charAt(0) || 'U' }}
            </div>
            <div class="hidden md:block text-left">
              <p class="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                {{ auth.currentUser()?.name }}
              </p>
              <p class="text-[10px] text-slate-400 uppercase font-medium">
                {{ auth.currentUser()?.role }}
              </p>
            </div>
            <span class="material-symbols-outlined text-slate-400 text-base">expand_more</span>
          </button>

          <!-- Profile Dropdown -->
          <div 
            *ngIf="showUserMenu()" 
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50"
          >
            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ auth.currentUser()?.companyName }}</p>
              <p class="text-[11px] text-slate-400 truncate">{{ auth.currentUser()?.email || auth.currentUser()?.generatedUserId }}</p>
            </div>
            <button 
              (click)="auth.logout()" 
              class="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center space-x-2"
            >
              <span class="material-symbols-outlined text-base">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        <!-- Login / Signup buttons if not authenticated -->
        <div *ngIf="!auth.isAuthenticated()" class="flex items-center space-x-2">
          <a routerLink="/login" class="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            Login
          </a>
          <a routerLink="/signup" class="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm">
            Register Organization
          </a>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  searchQuery = '';
  showNotifications = signal(false);
  showUserMenu = signal(false);
  notificationsList = signal<NotificationItem[]>([]);

  ngOnInit() {
    if (this.auth.isAuthenticated() && this.auth.currentUser()) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.notificationService.getNotifications(userId).subscribe(res => {
        if (res.success && res.data) {
          this.notificationsList.set(res.data);
        }
      });
    }
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    this.showUserMenu.set(false);
    if (this.showNotifications()) {
      this.loadNotifications();
    }
  }

  toggleUserMenu() {
    this.showUserMenu.update(v => !v);
    this.showNotifications.set(false);
  }

  markRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.notificationsList.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    });
  }

  markAllAsRead() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe(() => {
        this.notificationsList.update(list => list.map(n => ({ ...n, isRead: true })));
      });
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/traceability'], { queryParams: { orderId: this.searchQuery.trim() } });
    }
  }
}
