import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order, OrderStatus, Role } from '../../core/models/plts.models';

@Component({
  selector: 'app-stakeholder-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ portalTitle }} Tasks
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <strong class="text-slate-900 dark:text-white font-mono">{{ auth.currentUser()?.generatedUserId }}</strong> &bull; {{ auth.currentUser()?.companyName }}
          </p>
        </div>

        <button 
          (click)="loadTasks()"
          class="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <span class="material-symbols-outlined text-base">refresh</span>
          <span>Refresh Tasks</span>
        </button>
      </div>

      <!-- Task Cards List -->
      <div class="space-y-4">
        <div *ngIf="tasks().length === 0" class="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2">task</span>
          <p class="text-sm font-semibold">No active tasks assigned to your company right now.</p>
        </div>

        <div *ngFor="let t of tasks()" class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-4">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div class="flex items-center space-x-3">
                <span class="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  {{ t.orderNumber }}
                </span>
                <h3 class="text-lg font-bold font-heading text-slate-900 dark:text-white">{{ t.productName }}</h3>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                Quantity: <strong>{{ t.quantity }} units</strong> &bull; Organization: <strong>{{ t.organizationName }}</strong>
              </p>
            </div>

            <span [class]="getStatusBadgeClass(t.status)">
              {{ t.status.replace('_', ' ') }}
            </span>
          </div>

          <!-- Description / Remarks -->
          <p *ngIf="t.description" class="text-xs text-slate-600 dark:text-slate-400">
            {{ t.description }}
          </p>

          <!-- MANUFACTURER ACTIONS -->
          <ng-container *ngIf="auth.userRole() === 'MANUFACTURER'">
            <div class="flex flex-wrap gap-2 pt-2">
              <button 
                *ngIf="t.status === 'MANUFACTURER_ASSIGNED'" 
                (click)="handleManufacturerAction(t, 'ACCEPT')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Accept Manufacturing Task
              </button>

              <button 
                *ngIf="t.status === 'MANUFACTURER_ASSIGNED'" 
                (click)="handleManufacturerAction(t, 'REJECT')"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Reject Task
              </button>

              <button 
                *ngIf="t.status === 'MANUFACTURING'" 
                (click)="openCompleteMfgModal(t)"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20"
              >
                Mark Manufacturing Completed & Submit Notes
              </button>
            </div>
          </ng-container>

          <!-- QA ACTIONS -->
          <ng-container *ngIf="auth.userRole() === 'QA'">
            <div class="flex flex-wrap gap-2 pt-2">
              <button 
                *ngIf="t.status === 'QA_ASSIGNED'" 
                (click)="handleQaAction(t, 'ACCEPT')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Accept Inspection Request
              </button>

              <button 
                *ngIf="t.status === 'QA_ASSIGNED'" 
                (click)="handleQaAction(t, 'REJECT')"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Reject Request
              </button>

              <button 
                *ngIf="t.status === 'QA_IN_PROGRESS'" 
                (click)="openQaReportModal(t)"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20"
              >
                Perform Inspection & Submit Pass/Fail Report
              </button>
            </div>
          </ng-container>

          <!-- PACKAGING & TRANSPORT ACTIONS -->
          <ng-container *ngIf="auth.userRole() === 'PACKAGING_TRANSPORT'">
            <div class="flex flex-wrap gap-2 pt-2">
              <button 
                *ngIf="t.status === 'PACKAGING_ASSIGNED'" 
                (click)="handlePackagingAction(t, 'ACCEPT')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Accept Packaging Task
              </button>

              <button 
                *ngIf="t.status === 'PACKAGING_IN_PROGRESS'" 
                (click)="openShippingModal(t)"
                class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20"
              >
                Input Tracking & Vehicle Details & Dispatch
              </button>

              <button 
                *ngIf="t.status === 'PACKAGING_COMPLETED'" 
                (click)="handlePackagingAction(t, 'MARK_TRANSPORT_COMPLETE')"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20"
              >
                Mark Transport Completed
              </button>
            </div>
          </ng-container>

          <!-- RETAILER ACTIONS -->
          <ng-container *ngIf="auth.userRole() === 'RETAILER'">
            <div class="flex flex-wrap gap-2 pt-2">
              <button 
                *ngIf="t.status === 'RETAILER_ASSIGNED'" 
                (click)="handleRetailerAction(t, 'CONFIRM_DELIVERY')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Confirm Physical Delivery Received
              </button>

              <button 
                *ngIf="t.status === 'DELIVERED'" 
                (click)="handleRetailerAction(t, 'MARK_AVAILABLE')"
                class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20"
              >
                Mark Product Available & Close Lifecycle
              </button>
            </div>
          </ng-container>

        </div>
      </div>

    </div>

    <!-- MANUFACTURER COMPLETE MODAL -->
    <div *ngIf="showMfgModal()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Complete Manufacturing</h3>
        <form (ngSubmit)="submitMfgCompletion()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Completion Notes</label>
            <textarea [(ngModel)]="mfgNotes" name="mfgNotes" rows="3" required placeholder="All batch units produced according to ISO standards..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs focus:outline-none"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Document / Certificate URL (Optional)</label>
            <input type="text" [(ngModel)]="mfgDocUrl" name="mfgDocUrl" placeholder="https://docs.company.com/cert-123.pdf" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs focus:outline-none">
          </div>
          <div class="flex space-x-3 pt-2">
            <button type="button" (click)="showMfgModal.set(false)" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md">Submit Completion</button>
          </div>
        </form>
      </div>
    </div>

    <!-- QA REPORT MODAL -->
    <div *ngIf="showQaModal()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Submit QA Inspection Report</h3>
        <form (ngSubmit)="submitQaReport()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inspection Outcome *</label>
            <select [(ngModel)]="qaPassed" name="qaPassed" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs font-bold focus:outline-none">
              <option [ngValue]="true">PASS - Quality Inspection Certified</option>
              <option [ngValue]="false">FAIL - Quality Requirements Not Met</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inspection Remarks *</label>
            <textarea [(ngModel)]="qaRemarks" name="qaRemarks" rows="3" required placeholder="Detailed QA evaluation notes..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs focus:outline-none"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Inspection Report URL (Optional)</label>
            <input type="text" [(ngModel)]="qaReportUrl" name="qaReportUrl" placeholder="https://qa.org/reports/rep-99.pdf" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs focus:outline-none">
          </div>
          <div class="flex space-x-3 pt-2">
            <button type="button" (click)="showQaModal.set(false)" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md">Submit QA Report</button>
          </div>
        </form>
      </div>
    </div>

    <!-- PACKAGING & DISPATCH MODAL -->
    <div *ngIf="showShippingModal()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Shipping & Dispatch Details</h3>
        <form (ngSubmit)="submitShippingDetails()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tracking Number *</label>
            <input type="text" [(ngModel)]="shippingForm.trackingNumber" name="trackingNumber" required placeholder="TRK-88776655" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs font-mono uppercase focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle & Driver Details *</label>
            <input type="text" [(ngModel)]="shippingForm.vehicleDetails" name="vehicleDetails" required placeholder="Volvo Truck (Reg: KA-01-AB-1234), Driver: Alex" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border text-xs focus:outline-none">
          </div>
          <div class="flex space-x-3 pt-2">
            <button type="button" (click)="showShippingModal.set(false)" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl">Cancel</button>
            <button type="submit" class="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md">Dispatch Shipment</button>
          </div>
        </form>
      </div>
    </div>
  `
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
    vehicleDetails: ''
  };

  ngOnInit() {
    this.loadTasks();
  }

  get portalTitle(): string {
    const role = this.auth.userRole();
    switch (role) {
      case 'MANUFACTURER': return 'Manufacturer';
      case 'QA': return 'Quality Assurance Inspection';
      case 'PACKAGING_TRANSPORT': return 'Packaging & Logistics';
      case 'RETAILER': return 'Retailer Shipment';
      default: return 'Stakeholder';
    }
  }

  loadTasks() {
    const user = this.auth.currentUser();
    if (!user || !user.id) return;

    this.orderService.getOrdersForStakeholderUser(user.id, user.role).subscribe(res => {
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
    this.orderService.updateManufacturerStatus(order.id, 'COMPLETE', { notes: this.mfgNotes, documentUrl: this.mfgDocUrl })
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
    this.orderService.updateQaStatus(order.id, 'SUBMIT_REPORT', { passed: this.qaPassed, qaRemarks: this.qaRemarks, qaReportUrl: this.qaReportUrl })
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
    this.orderService.updatePackagingStatus(order.id, 'DISPATCH', this.shippingForm)
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
      case 'COMPLETED': return 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'REJECTED': return 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default: return 'px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  }
}
