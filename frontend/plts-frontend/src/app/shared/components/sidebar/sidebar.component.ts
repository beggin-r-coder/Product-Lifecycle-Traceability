import { Component, inject } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="hidden min-h-[calc(100vh-4rem)] w-72 select-none flex-col justify-between border-r border-base-300 bg-base-100/90 px-3 py-4 shadow-sm md:flex"
    >
      <div class="space-y-4">
        <div class="alert alert-success border border-base-300 bg-base-200/70 p-3 shadow-sm">
          <div class="flex w-full items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-success"></span>
              <div>
                <p class="text-xs font-semibold">{{ roleTitle }}</p>
                <p class="text-[10px] uppercase tracking-[0.2em] opacity-70">Active Access</p>
              </div>
            </div>
            <span class="badge badge-success badge-sm">LIVE</span>
          </div>
        </div>

        <nav>
          <ul class="menu menu-sm w-full gap-1 p-0">
            @if (auth.userRole() === 'ORGANIZATION') {
              <li>
                <a
                  routerLink="/org/dashboard"
                  routerLinkActive="active bg-primary/10 text-primary"
                  class="rounded-lg px-3 py-2.5 text-sm"
                >
                  <span class="material-symbols-outlined text-lg">dashboard</span>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/org/stakeholders"
                  routerLinkActive="active bg-primary/10 text-primary"
                  class="rounded-lg px-3 py-2.5 text-sm"
                >
                  <span class="material-symbols-outlined text-lg">group</span>
                  <span>Stakeholders</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/org/orders"
                  routerLinkActive="active bg-primary/10 text-primary"
                  class="rounded-lg px-3 py-2.5 text-sm"
                >
                  <span class="material-symbols-outlined text-lg">inventory_2</span>
                  <span>Orders & Lifecycle</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/org/notifications"
                  routerLinkActive="active bg-primary/10 text-primary"
                  class="rounded-lg px-3 py-2.5 text-sm"
                >
                  <span class="material-symbols-outlined text-lg">notifications</span>
                  <span>Notifications</span>
                </a>
              </li>
            }

            @if (auth.userRole() !== 'ORGANIZATION') {
              <li>
                <a
                  routerLink="/stakeholder/dashboard"
                  routerLinkActive="active bg-primary/10 text-primary"
                  class="rounded-lg px-3 py-2.5 text-sm"
                >
                  <span class="material-symbols-outlined text-lg">task</span>
                  <span>My Tasks</span>
                </a>
              </li>
            }

            <li>
              <a
                routerLink="/traceability"
                routerLinkActive="active bg-primary/10 text-primary"
                class="rounded-lg px-3 py-2.5 text-sm"
              >
                <span class="material-symbols-outlined text-lg">timeline</span>
                <span>Public Traceability</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="rounded-box border border-base-300 bg-base-200/70 p-3 shadow-sm">
        <p class="text-[11px] font-semibold">Lifecycle Traceability v2.0</p>
        <p class="mt-1 text-[10px] opacity-70">End-to-End Enterprise Chain</p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  auth = inject(AuthService);

  get roleTitle(): string {
    const role = this.auth.userRole();
    switch (role) {
      case 'ORGANIZATION':
        return 'Organization Owner';
      case 'MANUFACTURER':
        return 'Manufacturer';
      case 'QA':
        return 'Quality Assurance';
      case 'PACKAGING_TRANSPORT':
        return 'Packaging & Transport';
      case 'RETAILER':
        return 'Retailer Portal';
      default:
        return 'Stakeholder';
    }
  }
}
