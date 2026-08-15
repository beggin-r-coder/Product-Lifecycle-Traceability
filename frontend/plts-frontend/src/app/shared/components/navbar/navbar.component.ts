import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/plts.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header
      class="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 px-4 shadow-sm backdrop-blur md:px-6"
    >
      <div class="flex items-center justify-between h-full">
        <div class="flex items-center gap-3 md:gap-6">
          <a routerLink="/" class="flex items-center gap-2.5">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20"
            >
              <span class="material-symbols-outlined text-xl">token</span>
            </div>
            <div>
              <span class="font-heading text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
                >PLTS</span
              >
              <span
                class="ml-1 hidden rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-700 dark:text-brand-300 sm:inline-block"
              >
                Enterprise
              </span>
            </div>
          </a>
        </div>

        <div class="flex items-center gap-2 md:gap-3">
          @if (auth.isAuthenticated()) {
            <div class="relative">
              <button
                (click)="toggleNotifications()"
                class="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span class="material-symbols-outlined text-lg">notifications</span>
                @if (notificationService.unreadCount() > 0) {
                  <span
                    class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
                  >
                    {{ notificationService.unreadCount() }}
                  </span>
                }
              </button>
              @if (showNotifications()) {
                <div
                  class="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl md:w-96 z-50"
                >
                  <div
                    class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                      <span class="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold"
                        >{{ notificationService.unreadCount() }} new</span
                      >
                    </div>
                    <button
                      (click)="markAllAsRead()"
                      class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div class="max-h-80 divide-y divide-slate-200 dark:divide-slate-800 overflow-y-auto">
                    @if (notificationsList().length === 0) {
                      <div class="p-6 text-center text-sm text-slate-400">
                        No notifications found.
                      </div>
                    }
                    @for (n of notificationsList(); track n) {
                      <div
                        [class.bg-brand-50]="!n.isRead"
                        [class.dark:bg-brand-950]="!n.isRead"
                        class="flex items-start gap-3 p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div
                          class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
                        >
                          <span class="material-symbols-outlined text-base">info</span>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-center justify-between gap-2">
                            <p class="truncate text-xs font-bold text-slate-900 dark:text-white">{{ n.title }}</p>
                            <span class="text-[10px] text-slate-400">{{
                              n.createdAt | date: 'shortTime'
                            }}</span>
                          </div>
                          <p class="mt-0.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {{ n.message }}
                          </p>
                          @if (!n.isRead) {
                            <button
                              (click)="markRead(n.id)"
                              class="mt-1.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              Mark as read
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          @if (auth.isAuthenticated()) {
            <div class="relative">
              <button (click)="toggleUserMenu()" class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold uppercase text-slate-700 dark:text-slate-300"
                >
                  {{ auth.currentUser()?.name?.charAt(0) || 'U' }}
                </div>
                <div class="hidden text-left md:block">
                  <p class="max-w-32 truncate text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                    {{ auth.currentUser()?.name }}
                  </p>
                  <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {{ auth.currentUser()?.role }}
                  </p>
                </div>
                <span class="material-symbols-outlined text-base text-slate-400"
                  >expand_more</span
                >
              </button>
              @if (showUserMenu()) {
                <div
                  class="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50"
                >
                  <div class="border-b border-slate-200 dark:border-slate-800 px-3 py-2">
                    <p class="truncate text-xs font-bold text-slate-900 dark:text-white">{{ auth.currentUser()?.companyName }}</p>
                    <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {{ auth.currentUser()?.email || auth.currentUser()?.generatedUserId }}
                    </p>
                  </div>
                  <button
                    (click)="auth.logout()"
                    class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <span class="material-symbols-outlined text-base">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              }
            </div>
          }

          @if (!auth.isAuthenticated()) {
            <div class="flex items-center gap-2">
              <a routerLink="/login" class="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Login</a>
              <a routerLink="/signup" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20">Register Organization</a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

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
      this.notificationService.getNotifications(userId).subscribe((res) => {
        if (res.success && res.data) {
          this.notificationsList.set(res.data);
        }
      });
    }
  }

  toggleNotifications() {
    this.showNotifications.update((v) => !v);
    this.showUserMenu.set(false);
    if (this.showNotifications()) {
      this.loadNotifications();
    }
  }

  toggleUserMenu() {
    this.showUserMenu.update((v) => !v);
    this.showNotifications.set(false);
  }

  markRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      this.notificationsList.update((list) =>
        list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    });
  }

  markAllAsRead() {
    const userId = this.auth.currentUser()?.id;
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe(() => {
        this.notificationsList.update((list) => list.map((n) => ({ ...n, isRead: true })));
      });
    }
  }
}
