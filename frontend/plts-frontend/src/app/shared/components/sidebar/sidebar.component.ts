import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] select-none">
      <div class="p-4 space-y-6">
        <!-- Role Badge -->
        <div class="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
              {{ roleTitle }}
            </span>
          </div>
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
            Active
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          <!-- Organization Navigation -->
          <ng-container *ngIf="auth.userRole() === 'ORGANIZATION'">
            <a routerLink="/org/dashboard" routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <span class="material-symbols-outlined text-lg">dashboard</span>
              <span>Dashboard</span>
            </a>
            <a routerLink="/org/stakeholders" routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <span class="material-symbols-outlined text-lg">group</span>
              <span>Stakeholders</span>
            </a>
            <a routerLink="/org/orders" routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <span class="material-symbols-outlined text-lg">inventory_2</span>
              <span>Orders & Lifecycle</span>
            </a>
            <a routerLink="/org/notifications" routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <span class="material-symbols-outlined text-lg">notifications</span>
              <span>Notifications</span>
            </a>
          </ng-container>

          <!-- Stakeholder Specific Navigation -->
          <ng-container *ngIf="auth.userRole() !== 'ORGANIZATION'">
            <a routerLink="/stakeholder/dashboard" routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <span class="material-symbols-outlined text-lg">task</span>
              <span>My Tasks</span>
            </a>
          </ng-container>

          <a routerLink="/traceability" routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400 font-semibold" class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            <span class="material-symbols-outlined text-lg">timeline</span>
            <span>Public Traceability</span>
          </a>
        </nav>
      </div>

      <!-- Footer Info -->
      <div class="p-4 border-t border-slate-100 dark:border-slate-800">
        <div class="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
          <p class="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Lifecycle Traceability v2.0</p>
          <p class="text-[10px] text-slate-400 mt-0.5">End-to-End Enterprise Chain</p>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  auth = inject(AuthService);

  get roleTitle(): string {
    const role = this.auth.userRole();
    switch (role) {
      case 'ORGANIZATION': return 'Organization Owner';
      case 'MANUFACTURER': return 'Manufacturer';
      case 'QA': return 'Quality Assurance';
      case 'PACKAGING_TRANSPORT': return 'Packaging & Transport';
      case 'RETAILER': return 'Retailer Portal';
      default: return 'Stakeholder';
    }
  }
}
