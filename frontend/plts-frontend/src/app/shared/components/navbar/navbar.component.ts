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
    <header
      class="navbar sticky top-0 z-30 h-16 border-b border-base-300/80 bg-base-100/95 px-4 shadow-sm backdrop-blur md:px-6"
    >
      <div class="flex-1 items-center gap-3 md:gap-6">
        <a routerLink="/" class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md shadow-primary/20"
          >
            <span class="material-symbols-outlined text-xl">token</span>
          </div>
          <div>
            <span class="font-heading text-lg font-extrabold tracking-tight text-base-content"
              >PLTS</span
            >
            <span
              class="ml-1 hidden rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary sm:inline-block"
            >
              Enterprise
            </span>
          </div>
        </a>

        <div class="hidden w-64 md:block md:w-80">
          <label
            class="input input-bordered input-sm flex w-full items-center gap-2 bg-base-200/70"
          >
            <span class="material-symbols-outlined text-base">search</span>
            <input
              type="text"
              placeholder="Search Order ID (e.g. ORD-20260806-1001)..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              class="grow bg-transparent"
            />
          </label>
        </div>
      </div>

      <div class="flex items-center gap-2 md:gap-3">
        <a
          routerLink="/traceability"
          class="btn btn-ghost btn-sm hidden gap-2 text-primary sm:flex"
        >
          <span class="material-symbols-outlined text-sm">qr_code_scanner</span>
          <span>Public Trace</span>
        </a>

        @if (auth.isAuthenticated()) {
          <div class="dropdown dropdown-end">
            <button
              (click)="toggleNotifications()"
              class="btn btn-ghost btn-circle btn-sm relative"
            >
              <span class="material-symbols-outlined text-lg">notifications</span>
              @if (notificationService.unreadCount() > 0) {
                <span
                  class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-error-content shadow-sm"
                >
                  {{ notificationService.unreadCount() }}
                </span>
              }
            </button>
            @if (showNotifications()) {
              <div
                class="dropdown-content z-60 mt-2 w-80 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl md:w-96"
              >
                <div
                  class="flex items-center justify-between border-b border-base-300 bg-base-200/70 px-4 py-3"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold">Notifications</span>
                    <span class="badge badge-primary badge-sm"
                      >{{ notificationService.unreadCount() }} new</span
                    >
                  </div>
                  <button
                    (click)="markAllAsRead()"
                    class="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div class="max-h-80 divide-y divide-base-300 overflow-y-auto">
                  @if (notificationsList().length === 0) {
                    <div class="p-6 text-center text-sm text-base-content/60">
                      No notifications found.
                    </div>
                  }
                  @for (n of notificationsList(); track n) {
                    <div
                      [class.bg-primary/10]="!n.isRead"
                      class="flex items-start gap-3 p-3.5 transition-colors hover:bg-base-200/70"
                    >
                      <div
                        class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      >
                        <span class="material-symbols-outlined text-base">info</span>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <p class="truncate text-xs font-bold">{{ n.title }}</p>
                          <span class="text-[10px] text-base-content/60">{{
                            n.createdAt | date: 'shortTime'
                          }}</span>
                        </div>
                        <p class="mt-0.5 text-xs text-base-content/70 line-clamp-2">
                          {{ n.message }}
                        </p>
                        @if (!n.isRead) {
                          <button
                            (click)="markRead(n.id)"
                            class="mt-1.5 text-[11px] font-semibold text-primary hover:underline"
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
          <div class="dropdown dropdown-end">
            <button (click)="toggleUserMenu()" class="btn btn-ghost flex items-center gap-2 px-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-neutral text-xs font-bold uppercase text-neutral-content"
              >
                {{ auth.currentUser()?.name?.charAt(0) || 'U' }}
              </div>
              <div class="hidden text-left md:block">
                <p class="max-w-32 truncate text-xs font-semibold leading-tight">
                  {{ auth.currentUser()?.name }}
                </p>
                <p class="text-[10px] uppercase tracking-[0.2em] text-base-content/60">
                  {{ auth.currentUser()?.role }}
                </p>
              </div>
              <span class="material-symbols-outlined text-base text-base-content/60"
                >expand_more</span
              >
            </button>
            @if (showUserMenu()) {
              <div
                class="dropdown-content z-60 mt-2 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
              >
                <div class="border-b border-base-300 px-3 py-2">
                  <p class="truncate text-xs font-bold">{{ auth.currentUser()?.companyName }}</p>
                  <p class="truncate text-[11px] text-base-content/60">
                    {{ auth.currentUser()?.email || auth.currentUser()?.generatedUserId }}
                  </p>
                </div>
                <button
                  (click)="auth.logout()"
                  class="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-error hover:bg-error/10"
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
            <a routerLink="/login" class="btn btn-ghost btn-sm">Login</a>
            <a routerLink="/signup" class="btn btn-primary btn-sm">Register Organization</a>
          </div>
        }
      </div>
    </header>
  `,
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

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/traceability'], {
        queryParams: { orderId: this.searchQuery.trim() },
      });
    }
  }
}
