import { Component, OnInit, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order, OrderStatus, Role } from '../../core/models/plts.models';

@Component({
  selector: 'app-stakeholder-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            {{ portalTitle }} Dashboard
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as
            <strong class="text-slate-900 dark:text-white font-mono">{{
              auth.currentUser()?.generatedUserId
            }}</strong>
            &bull; {{ auth.currentUser()?.companyName }}
          </p>
        </div>

        <button
          (click)="loadTasks()"
          class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 self-start sm:self-auto transition-all duration-300"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Tasks</span>
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tasks</span>
            <div class="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">assignment</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ tasks().length }}</p>
          <p class="text-[11px] text-slate-500 mt-1">All assigned tasks</p>
        </div>

        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">pending</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ tasks().filter(t => t.status.includes('ASSIGNED')).length }}</p>
          <p class="text-[11px] text-slate-500 mt-1">Awaiting action</p>
        </div>

        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">In Progress</span>
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">hourglass_empty</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ tasks().filter(t => t.status.includes('IN_PROGRESS')).length }}</p>
          <p class="text-[11px] text-slate-500 mt-1">Currently working</p>
        </div>

        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Completed</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ tasks().filter(t => t.status === 'COMPLETED').length }}</p>
          <p class="text-[11px] text-slate-500 mt-1">Successfully completed</p>
        </div>
      </div>

      <!-- Task Cards List -->
      <div class="space-y-4">
        @if (tasks().length === 0) {
          <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
              <span class="material-symbols-outlined text-3xl text-slate-400">assignment</span>
            </div>
            <p class="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">No active tasks assigned</p>
            <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">Check back later for new assignments</p>
          </div>
        }

        @for (t of tasks(); track t) {
          <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4"
            >
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <span class="material-symbols-outlined text-xl">inventory</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span
                      class="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                    >
                      {{ t.orderNumber }}
                    </span>
                    <span [class]="getStatusBadgeClass(t.status)">
                      {{ t.status.replace('_', ' ') }}
                    </span>
                  </div>
                  <h3 class="text-lg font-bold font-heading text-slate-900 dark:text-white mt-1">
                    {{ t.productName }}
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">
                    <strong>{{ t.quantity }} units</strong> &bull; {{ t.organizationName }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Description / Remarks -->
            @if (t.description) {
              <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  {{ t.description }}
                </p>
              </div>
            }
            
            <!-- MANUFACTURER ACTIONS -->
            @if (auth.userRole() === 'MANUFACTURER') {
              <div class="flex flex-wrap gap-2 pt-2">
                @if (t.status === 'MANUFACTURER_ASSIGNED') {
                  <button
                    (click)="handleManufacturerAction(t, 'ACCEPT')"
                    class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
                  >
                    Accept Manufacturing Task
                  </button>
                }
                @if (t.status === 'MANUFACTURER_ASSIGNED') {
                  <button
                    (click)="handleManufacturerAction(t, 'REJECT')"
                    class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all duration-200"
                  >
                    Reject Task
                  </button>
                }
                @if (t.status === 'MANUFACTURING') {
                  <button
                    (click)="openCompleteMfgModal(t)"
                    class="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/30 transition-all duration-200"
                  >
                    Mark Manufacturing Completed
                  </button>
                }
              </div>
            }
            <!-- QA ACTIONS -->
            @if (auth.userRole() === 'QA') {
              <div class="flex flex-wrap gap-2 pt-2">
                @if (t.status === 'QA_ASSIGNED') {
                  <button
                    (click)="handleQaAction(t, 'ACCEPT')"
                    class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
                  >
                    Accept Inspection Request
                  </button>
                }
                @if (t.status === 'QA_ASSIGNED') {
                  <button
                    (click)="handleQaAction(t, 'REJECT')"
                    class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 transition-all duration-200"
                  >
                    Reject Request
                  </button>
                }
                @if (t.status === 'QA_IN_PROGRESS') {
                  <button
                    (click)="openQaReportModal(t)"
                    class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200"
                  >
                    Submit Inspection Report
                  </button>
                }
              </div>
            }
            <!-- PACKAGING & TRANSPORT ACTIONS -->
            @if (auth.userRole() === 'PACKAGING_TRANSPORT') {
              <div class="flex flex-wrap gap-2 pt-2">
                @if (t.status === 'PACKAGING_ASSIGNED') {
                  <button
                    (click)="handlePackagingAction(t, 'ACCEPT')"
                    class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
                  >
                    Accept Packaging Task
                  </button>
                }
                @if (t.status === 'PACKAGING_IN_PROGRESS') {
                  <button
                    (click)="openShippingModal(t)"
                    class="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-200"
                  >
                    Dispatch Shipment
                  </button>
                }
                @if (t.status === 'PACKAGING_COMPLETED') {
                  <button
                    (click)="handlePackagingAction(t, 'MARK_TRANSPORT_COMPLETE')"
                    class="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/30 transition-all duration-200"
                  >
                    Mark Transport Completed
                  </button>
                }
              </div>
            }
            <!-- RETAILER ACTIONS -->
            @if (auth.userRole() === 'RETAILER') {
              <div class="flex flex-wrap gap-2 pt-2">
                @if (t.status === 'RETAILER_ASSIGNED') {
                  <button
                    (click)="handleRetailerAction(t, 'CONFIRM_DELIVERY')"
                    class="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all duration-200"
                  >
                    Confirm Delivery Received
                  </button>
                }
                @if (t.status === 'DELIVERED') {
                  <button
                    (click)="handleRetailerAction(t, 'MARK_AVAILABLE')"
                    class="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/30 transition-all duration-200"
                  >
                    Mark Product Available
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- MANUFACTURER COMPLETE MODAL -->
    @if (showMfgModal()) {
      <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Complete Manufacturing</h3>
              <p class="text-xs text-slate-400">Submit manufacturing completion details</p>
            </div>
            <button (click)="showMfgModal.set(false)" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form (ngSubmit)="submitMfgCompletion()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Completion Notes</label>
              <textarea
                [(ngModel)]="mfgNotes"
                name="mfgNotes"
                rows="3"
                required
                placeholder="All batch units produced according to ISO standards..."
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              ></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Document / Certificate URL (Optional)</label>
              <input
                type="text"
                [(ngModel)]="mfgDocUrl"
                name="mfgDocUrl"
                placeholder="https://docs.company.com/cert-123.pdf"
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              />
            </div>
            <div class="flex space-x-3 pt-2">
              <button
                type="button"
                (click)="showMfgModal.set(false)"
                class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20"
              >
                Submit Completion
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- QA REPORT MODAL -->
    @if (showQaModal()) {
      <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Submit QA Inspection Report</h3>
              <p class="text-xs text-slate-400">Submit quality inspection results</p>
            </div>
            <button (click)="showQaModal.set(false)" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form (ngSubmit)="submitQaReport()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inspection Outcome *</label>
              <select
                [(ngModel)]="qaPassed"
                name="qaPassed"
                required
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              >
                <option [ngValue]="true">PASS - Quality Inspection Certified</option>
                <option [ngValue]="false">FAIL - Quality Requirements Not Met</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inspection Remarks *</label>
              <textarea
                [(ngModel)]="qaRemarks"
                name="qaRemarks"
                rows="3"
                required
                placeholder="Detailed QA evaluation notes..."
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              ></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inspection Report URL (Optional)</label>
              <input
                type="text"
                [(ngModel)]="qaReportUrl"
                name="qaReportUrl"
                placeholder="https://qa.org/reports/rep-99.pdf"
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              />
            </div>
            <div class="flex space-x-3 pt-2">
              <button
                type="button"
                (click)="showQaModal.set(false)"
                class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20"
              >
                Submit QA Report
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- PACKAGING & DISPATCH MODAL -->
    @if (showShippingModal()) {
      <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Shipping & Dispatch Details</h3>
              <p class="text-xs text-slate-400">Enter shipping and vehicle information</p>
            </div>
            <button (click)="showShippingModal.set(false)" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form (ngSubmit)="submitShippingDetails()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tracking Number *</label>
              <input
                type="text"
                [(ngModel)]="shippingForm.trackingNumber"
                name="trackingNumber"
                required
                placeholder="TRK-88776655"
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle & Driver Details *</label>
              <input
                type="text"
                [(ngModel)]="shippingForm.vehicleDetails"
                name="vehicleDetails"
                required
                placeholder="Volvo Truck (Reg: KA-01-AB-1234), Driver: Alex"
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              />
            </div>
            <div class="flex space-x-3 pt-2">
              <button
                type="button"
                (click)="showShippingModal.set(false)"
                class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20"
              >
                Dispatch Shipment
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class StakeholderDashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  auth = inject(AuthService);

  tasks = signal<Order[]>([]);
  selectedOrder = signal<Order | null>(null);

  // Mfg Modal
  showMfgModal = signal(false);
  mfgNotes = '';
  mfgDocUrl = '';

  // QA Modal
  showQaModal = signal(false);
  qaPassed = true;
  qaRemarks = '';
  qaReportUrl = '';

  // Shipping Modal
  showShippingModal = signal(false);
  shippingForm = {
    trackingNumber: '',
    vehicleDetails: '',
  };

  ngOnInit() {
    this.loadTasks();
  }

  get portalTitle(): string {
    const role = this.auth.userRole();
    switch (role) {
      case 'MANUFACTURER':
        return 'Manufacturer';
      case 'QA':
        return 'Quality Assurance Inspection';
      case 'PACKAGING_TRANSPORT':
        return 'Packaging & Logistics';
      case 'RETAILER':
        return 'Retailer Shipment';
      default:
        return 'Stakeholder';
    }
  }

  loadTasks() {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    this.orderService.getOrdersForStakeholderUser(user.id, user.role).subscribe((res) => {
      if (res.success && res.data) {
        this.tasks.set(res.data);
      }
    });
  }

  handleManufacturerAction(order: Order, action: string) {
    this.orderService.updateManufacturerStatus(order.id, action).subscribe(() => this.loadTasks());
  }

  openCompleteMfgModal(order: Order) {
    this.selectedOrder.set(order);
    this.mfgNotes = '';
    this.mfgDocUrl = '';
    this.showMfgModal.set(true);
  }

  submitMfgCompletion() {
    const order = this.selectedOrder();
    if (!order) return;
    this.orderService
      .updateManufacturerStatus(order.id, 'COMPLETE', {
        notes: this.mfgNotes,
        documentUrl: this.mfgDocUrl,
      })
      .subscribe(() => {
        this.showMfgModal.set(false);
        this.loadTasks();
      });
  }

  handleQaAction(order: Order, action: string) {
    this.orderService.updateQaStatus(order.id, action).subscribe(() => this.loadTasks());
  }

  openQaReportModal(order: Order) {
    this.selectedOrder.set(order);
    this.qaPassed = true;
    this.qaRemarks = '';
    this.qaReportUrl = '';
    this.showQaModal.set(true);
  }

  submitQaReport() {
    const order = this.selectedOrder();
    if (!order) return;
    this.orderService
      .updateQaStatus(order.id, 'SUBMIT_REPORT', {
        passed: this.qaPassed,
        qaRemarks: this.qaRemarks,
        qaReportUrl: this.qaReportUrl,
      })
      .subscribe(() => {
        this.showQaModal.set(false);
        this.loadTasks();
      });
  }

  handlePackagingAction(order: Order, action: string) {
    this.orderService.updatePackagingStatus(order.id, action).subscribe(() => this.loadTasks());
  }

  openShippingModal(order: Order) {
    this.selectedOrder.set(order);
    this.shippingForm = { trackingNumber: '', vehicleDetails: '' };
    this.showShippingModal.set(true);
  }

  submitShippingDetails() {
    const order = this.selectedOrder();
    if (!order) return;
    this.orderService
      .updatePackagingStatus(order.id, 'DISPATCH', this.shippingForm)
      .subscribe(() => {
        this.showShippingModal.set(false);
        this.loadTasks();
      });
  }

  handleRetailerAction(order: Order, action: string) {
    this.orderService.updateRetailerStatus(order.id, action).subscribe(() => this.loadTasks());
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'COMPLETED':
        return 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'REJECTED':
        return 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  }
}
