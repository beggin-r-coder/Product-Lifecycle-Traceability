import { Component, OnInit, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardAnalytics } from '../../core/models/plts.models';

@Component({
  selector: 'app-org-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <!-- Welcome Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Organization Control Center
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry and management across your entire stakeholder supply chain network.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <a
            routerLink="/org/orders"
            class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2"
          >
            <span class="material-symbols-outlined text-base">add</span>
            <span>Create New Order</span>
          </a>
          <a
            routerLink="/org/stakeholders"
            class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-2"
          >
            <span class="material-symbols-outlined text-base">person_add</span>
            <span>Add Stakeholder</span>
          </a>
          <a routerLink="/org/defects" class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">report</span>
            <span>Defect Management</span>
          </a>
        </div>
      </div>

      <!-- Analytics Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Manufacturers -->
        <div class="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Total Manufacturers</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">factory</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.totalManufacturers || 0 }}
          </p>
          <p class="text-[11px] text-slate-400">Active manufacturing partners</p>
        </div>

        <!-- QA Companies -->
        <div class="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Quality Assurance</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">verified</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.totalQa || 0 }}
          </p>
          <p class="text-[11px] text-slate-400">QA inspection teams</p>
        </div>

        <!-- Packaging & Transport -->
        <div class="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Packaging & Transport</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">local_shipping</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.totalPackaging || 0 }}
          </p>
          <p class="text-[11px] text-slate-400">Logistics & shipping providers</p>
        </div>

        <!-- Retailers -->
        <div class="glass-card p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Total Retailers</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">storefront</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.totalRetailers || 0 }}
          </p>
          <p class="text-[11px] text-slate-400">Retail market channels</p>
        </div>
      </div>

      <!-- Orders Performance Metrics Banner -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Orders Overview Card -->
        <div class="glass-card p-6 rounded-3xl space-y-6 lg:col-span-2">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Order Throughput Metrics
              </h2>
              <p class="text-xs text-slate-500">
                Live summary of active product orders across lifecycle stages
              </p>
            </div>
            <a routerLink="/org/orders" class="text-xs font-semibold text-brand-600 hover:underline"
              >View All Orders &rarr;</a
            >
          </div>

          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <p class="text-[11px] font-bold uppercase text-slate-400">Total Orders</p>
              <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {{ analytics()?.totalOrders || 0 }}
              </p>
            </div>
            <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <p class="text-[11px] font-bold uppercase text-emerald-600">Completed</p>
              <p class="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                {{ analytics()?.completedOrders || 0 }}
              </p>
            </div>
            <div class="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30">
              <p class="text-[11px] font-bold uppercase text-blue-600">In Progress</p>
              <p class="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">
                {{ analytics()?.pendingOrders || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Info Box -->
        <div class="glass-card p-6 rounded-3xl space-y-4">
          <h2 class="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Lifecycle Security
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All stakeholder operations are secured via tokenized authentication, One-Time Passwords
            (OTP), and immutable timestamp audit logs.
          </p>
          <div
            class="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-xl border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300 font-semibold flex items-center space-x-2"
          >
            <span class="material-symbols-outlined text-lg">shield</span>
            <span>OTP Authentication Active</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrgDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private auth = inject(AuthService);

  analytics = signal<DashboardAnalytics | null>(null);

  ngOnInit() {
    const orgId = this.auth.currentUser()?.organizationId;
    const userId = this.auth.currentUser()?.id;

    if (orgId) {
      this.analyticsService.getAnalytics(orgId, userId).subscribe((res) => {
        if (res.success && res.data) {
          this.analytics.set(res.data);
        }
      });
    }
  }
}
