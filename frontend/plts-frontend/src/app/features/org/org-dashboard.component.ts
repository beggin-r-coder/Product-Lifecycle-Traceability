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
            Welcome back, {{ getUserName() }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your supply chain today
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <a
            routerLink="/org/orders"
            class="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/30 flex items-center space-x-2 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40"
          >
            <span class="material-symbols-outlined text-base">add</span>
            <span>Create Order</span>
          </a>
          <a
            routerLink="/org/stakeholders"
            class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-all duration-300"
          >
            <span class="material-symbols-outlined text-base">person_add</span>
            <span>Add Stakeholder</span>
          </a>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Orders -->
        <div class="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined text-xl">inventory_2</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.totalOrders || 0 }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">All time orders</p>
          <div class="mt-3 flex items-center text-emerald-600 text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            <span class="ml-1">+12% this month</span>
          </div>
        </div>

        <!-- Active Orders -->
        <div class="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</span>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined text-xl">pending</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.pendingOrders || 0 }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">Active in pipeline</p>
          <div class="mt-3 flex items-center text-blue-600 text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">sync</span>
            <span class="ml-1">Processing now</span>
          </div>
        </div>

        <!-- Completed Orders -->
        <div class="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ analytics()?.completedOrders || 0 }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">Successfully delivered</p>
          <div class="mt-3 flex items-center text-emerald-600 text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">verified</span>
            <span class="ml-1">98.5% success rate</span>
          </div>
        </div>

        <!-- Total Stakeholders -->
        <div class="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Stakeholders</span>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <span class="material-symbols-outlined text-xl">groups</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ (analytics()?.totalManufacturers || 0) + (analytics()?.totalQa || 0) + (analytics()?.totalPackaging || 0) + (analytics()?.totalRetailers || 0) }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">Active partners</p>
          <div class="mt-3 flex items-center text-purple-600 text-xs font-semibold">
            <span class="material-symbols-outlined text-sm">diversity_3</span>
            <span class="ml-1">All roles covered</span>
          </div>
        </div>
      </div>

      <!-- Stakeholder Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Stakeholders by Role -->
        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Stakeholder Distribution
              </h2>
              <p class="text-xs text-slate-500">
                Active partners across the supply chain
              </p>
            </div>
            <a routerLink="/org/stakeholders" class="text-xs font-semibold text-brand-600 hover:underline"
              >Manage &rarr;</a
            >
          </div>

          <div class="space-y-4">
            <!-- Manufacturers -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">factory</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">Manufacturers</p>
                  <p class="text-[11px] text-slate-500">Production partners</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ analytics()?.totalManufacturers || 0 }}</p>
                <div class="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style="width: {{ ((analytics()?.totalManufacturers || 0) / 10) * 100 }}%"></div>
                </div>
              </div>
            </div>

            <!-- QA -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">verified</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">Quality Assurance</p>
                  <p class="text-[11px] text-slate-500">Inspection teams</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ analytics()?.totalQa || 0 }}</p>
                <div class="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: {{ ((analytics()?.totalQa || 0) / 10) * 100 }}%"></div>
                </div>
              </div>
            </div>

            <!-- Packaging -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">local_shipping</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">Packaging & Transport</p>
                  <p class="text-[11px] text-slate-500">Logistics providers</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ analytics()?.totalPackaging || 0 }}</p>
                <div class="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" style="width: {{ ((analytics()?.totalPackaging || 0) / 10) * 100 }}%"></div>
                </div>
              </div>
            </div>

            <!-- Retailers -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-lg">storefront</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-white">Retailers</p>
                  <p class="text-[11px] text-slate-500">Market channels</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-extrabold text-slate-900 dark:text-white">{{ analytics()?.totalRetailers || 0 }}</p>
                <div class="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style="width: {{ ((analytics()?.totalRetailers || 0) / 10) * 100 }}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Recent Activity
              </h2>
              <p class="text-xs text-slate-500">
                Latest updates from your supply chain
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm">check_circle</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Order #ORD-20260815-1234 completed</p>
                <p class="text-[11px] text-slate-500">2 hours ago • Retail delivery confirmed</p>
              </div>
            </div>

            <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm">factory</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Manufacturing started for Order #ORD-20260815-1235</p>
                <p class="text-[11px] text-slate-500">4 hours ago • Production initiated</p>
              </div>
            </div>

            <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div class="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm">verified</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">QA inspection passed for Order #ORD-20260815-1233</p>
                <p class="text-[11px] text-slate-500">6 hours ago • Quality verified</p>
              </div>
            </div>

            <div class="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-sm">local_shipping</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Shipment dispatched for Order #ORD-20260815-1232</p>
                <p class="text-[11px] text-slate-500">8 hours ago • In transit to retailer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Order Performance Metrics
            </h2>
            <p class="text-xs text-slate-500">
              Key performance indicators for your supply chain
            </p>
          </div>
          <a routerLink="/org/orders" class="text-xs font-semibold text-brand-600 hover:underline"
            >View Details &rarr;</a
          >
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <p class="text-[11px] font-bold uppercase text-slate-400">Avg. Cycle Time</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ analytics()?.avgCycleTime || '4.2d' }}</p>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1">{{ analytics()?.cycleTimeChange || '↓ 15% vs last month' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <p class="text-[11px] font-bold uppercase text-slate-400">On-Time Delivery</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ analytics()?.onTimeDelivery || '96.8%' }}</p>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1">{{ analytics()?.onTimeDeliveryChange || '↑ 3% vs last month' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <p class="text-[11px] font-bold uppercase text-slate-400">Quality Rate</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ analytics()?.qualityRate || '99.2%' }}</p>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1">{{ analytics()?.qualityRateChange || '↑ 1% vs last month' }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <p class="text-[11px] font-bold uppercase text-slate-400">Defect Rate</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ analytics()?.defectRate || '0.8%' }}</p>
            <p class="text-[10px] text-emerald-600 font-semibold mt-1">{{ analytics()?.defectRateChange || '↓ 0.3% vs last month' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrgDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  public auth = inject(AuthService);

  analytics = signal<DashboardAnalytics | null>(null);

  getUserName(): string {
    const user = this.auth.currentUser();
    if (user?.name) {
      return user.name.split(' ')[0] || 'Team';
    }
    return 'Team';
  }

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
