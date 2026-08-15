import { Component, OnInit, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { StakeholderService } from '../../core/services/stakeholder.service';
import { AuthService } from '../../core/services/auth.service';
import {
  Order,
  OrderPriority,
  OrderStatus,
  Role,
  Stakeholder,
} from '../../core/models/plts.models';

@Component({
  selector: 'app-org-orders',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white"
          >
            Orders & Lifecycle Management
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create product orders and manage sequential stage transitions across stakeholders.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button
            (click)="exportExcel()"
            class="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100 flex items-center space-x-1.5"
          >
            <span class="material-symbols-outlined text-base">file_download</span>
            <span>Export Excel</span>
          </button>

          <button
            (click)="openCreateModal()"
            class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2"
          >
            <span class="material-symbols-outlined text-lg">add_box</span>
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      <!-- Orders Data Table -->
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead
              class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800"
            >
              <tr>
                <th class="py-3.5 px-6">Order ID</th>
                <th class="py-3.5 px-6">Product</th>
                <th class="py-3.5 px-6">Quantity</th>
                <th class="py-3.5 px-6">Priority</th>
                <th class="py-3.5 px-6">Status</th>
                <th class="py-3.5 px-6">Assigned Stakeholders</th>
                <th class="py-3.5 px-6 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300"
            >
              @if (orders().length === 0) {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400">
                    No orders created yet. Click "Create New Order" to start.
                  </td>
                </tr>
              }
              @for (o of orders(); track o) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-4 px-6 font-mono font-extrabold text-slate-900 dark:text-white">
                    {{ o.orderNumber }}
                  </td>
                  <td class="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    {{ o.productName }}
                  </td>
                  <td class="py-4 px-6">{{ o.quantity }} units</td>
                  <td class="py-4 px-6">
                    <span [class]="getPriorityBadgeClass(o.priority)">
                      {{ o.priority }}
                    </span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="flex items-center space-x-2">
                      <span [class]="getStatusBadgeClass(o.status)">
                        {{ getStatusLabel(o.status) }}
                      </span>
                      @if (o.isPremapped) {
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          AUTO-FLOW
                        </span>
                      }
                    </div>
                  </td>
                  <td class="py-4 px-6 text-[11px] space-y-0.5">
                    @if (o.manufacturer) {
                      <p>
                        Mfg:
                        <strong class="text-slate-900 dark:text-white">{{
                          o.manufacturer.companyName
                        }}</strong>
                      </p>
                    }
                    @if (o.qa) {
                      <p>
                        QA:
                        <strong class="text-slate-900 dark:text-white">{{
                          o.qa.companyName
                        }}</strong>
                      </p>
                    }
                    @if (o.packagingTransport) {
                      <p>
                        P&T:
                        <strong class="text-slate-900 dark:text-white">{{
                          o.packagingTransport.companyName
                        }}</strong>
                      </p>
                    }
                    @if (o.retailer) {
                      <p>
                        Retail:
                        <strong class="text-slate-900 dark:text-white">{{
                          o.retailer.companyName
                        }}</strong>
                      </p>
                    }
                  </td>
                  <td class="py-4 px-6 text-right space-x-2">
                    <!-- Stage Transition Actions -->
                    @if (o.status === 'CREATED' && (!o.isPremapped || !o.manufacturer)) {
                      <button
                        (click)="openAssignModal(o, 'MANUFACTURER')"
                        class="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                      >
                        Assign Manufacturer
                      </button>
                    }
                    @if (o.status === 'MANUFACTURING_COMPLETED' && (!o.isPremapped || !o.qa)) {
                      <button
                        (click)="openAssignModal(o, 'QA')"
                        class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center space-x-1"
                      >
                        <span>Proceed Next &rarr; QA</span>
                      </button>
                    }
                    @if (o.status === 'QA_COMPLETED' && (!o.isPremapped || !o.packagingTransport)) {
                      <button
                        (click)="openAssignModal(o, 'PACKAGING_TRANSPORT')"
                        class="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center space-x-1"
                      >
                        <span>Proceed Next &rarr; Packaging</span>
                      </button>
                    }
                    @if (o.status === 'TRANSPORT_COMPLETED' && (!o.isPremapped || !o.retailer)) {
                      <button
                        (click)="openAssignModal(o, 'RETAILER')"
                        class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center space-x-1"
                      >
                        <span>Proceed Next &rarr; Retailer</span>
                      </button>
                    }
                    <!-- Auto-assignment indicator for	premap orders -->
                    @if (o.status === 'MANUFACTURING_COMPLETED' && o.isPremapped && o.qa) {
                      <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg">
                        Auto-assigning QA...
                      </span>
                    }
                    @if (o.status === 'QA_COMPLETED' && o.isPremapped && o.packagingTransport) {
                      <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg">
                        Auto-assigning Packaging...
                      </span>
                    }
                    @if (o.status === 'TRANSPORT_COMPLETED' && o.isPremapped && o.retailer) {
                      <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg">
                        Auto-assigning Retailer...
                      </span>
                    }
                    <!-- Cancel Order Button -->
                    @if (canCancelOrder(o)) {
                      <button
                        (click)="openCancelModal(o)"
                        title="Cancel Order"
                        class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-lg shadow-sm"
                      >
                        Cancel
                      </button>
                    }
                    <!-- Utilities: QR Code & PDF Export -->
                    <button
                      (click)="openQrModal(o)"
                      title="View QR Code"
                      class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span class="material-symbols-outlined text-lg">qr_code</span>
                    </button>
                    <button
                      (click)="exportPdf(o)"
                      title="Export PDF Certificate"
                      class="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CREATE ORDER MODAL -->
    @if (showCreateModal()) {
      <div
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4"
          >
            <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">
              Create New Order
            </h3>
            <button
              (click)="showCreateModal.set(false)"
              class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form (ngSubmit)="createOrder()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Product Name *</label
              >
              <input
                type="text"
                [(ngModel)]="orderForm.productName"
                name="productName"
                required
                placeholder="Solar Panel 400W Pro"
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Quantity *</label
                >
                <input
                  type="number"
                  [(ngModel)]="orderForm.quantity"
                  name="quantity"
                  required
                  min="1"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Priority *</label
                >
                <select
                  [(ngModel)]="orderForm.priority"
                  name="priority"
                  required
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Description</label
              >
              <textarea
                [(ngModel)]="orderForm.description"
                name="description"
                rows="2"
                placeholder="High efficiency monocrystalline solar module batch..."
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              ></textarea>
            </div>
            <div class="flex space-x-3 pt-2">
              <button
                type="button"
                (click)="showCreateModal.set(false)"
                class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="loading()"
                class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2"
              >
                <span>Create Order</span>
              </button>
            </div>
          </form>
        </div>

        <form (ngSubmit)="createOrder()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
            <input type="text" [(ngModel)]="orderForm.productName" name="productName" required placeholder="Solar Panel 400W Pro" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
              <input type="number" [(ngModel)]="orderForm.quantity" name="quantity" required min="1" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority *</label>
              <select [(ngModel)]="orderForm.priority" name="priority" required class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea [(ngModel)]="orderForm.description" name="description" rows="2" placeholder="High efficiency monocrystalline solar module batch..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"></textarea>
          </div>

          <!-- Stakeholder Premapping Section -->
          <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Premap Stakeholders (Optional)</h4>
            <p class="text-[11px] text-slate-500">Pre-assign stakeholders to enable automatic hierarchical notifications throughout the order lifecycle.</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Manufacturer</label>
                <select [(ngModel)]="orderForm.manufacturerId" name="manufacturerId" class="w-full px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
                  <option [ngValue]="null">Select Manufacturer</option>
                  <option *ngFor="let m of manufacturers()" [ngValue]="m.id">{{ m.companyName }} ({{ m.generatedUserId }})</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Quality Assurance</label>
                <select [(ngModel)]="orderForm.qaId" name="qaId" class="w-full px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
                  <option [ngValue]="null">Select QA Company</option>
                  <option *ngFor="let qa of qaCompanies()" [ngValue]="qa.id">{{ qa.companyName }} ({{ qa.generatedUserId }})</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Packaging & Transport</label>
                <select [(ngModel)]="orderForm.packagingTransportId" name="packagingTransportId" class="w-full px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
                  <option [ngValue]="null">Select P&T Company</option>
                  <option *ngFor="let pt of packagingCompanies()" [ngValue]="pt.id">{{ pt.companyName }} ({{ pt.generatedUserId }})</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Retailer</label>
                <select [(ngModel)]="orderForm.retailerId" name="retailerId" class="w-full px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
                  <option [ngValue]="null">Select Retailer</option>
                  <option *ngFor="let r of retailers()" [ngValue]="r.id">{{ r.companyName }} ({{ r.generatedUserId }})</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex space-x-3 pt-2">
            <button type="button" (click)="showCreateModal.set(false)" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">
              Cancel
            </button>
            <button type="submit" [disabled]="loading()" class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2">
              <span>Create Order</span>
            </button>
          </div>
        </form>

      </div>
    }

    <!-- ASSIGN STAKEHOLDER MODAL -->
    @if (showAssignModal()) {
      <div
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4"
          >
            <div>
              <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Assign Stakeholder
              </h3>
              <p class="text-xs text-slate-400">Order #{{ selectedOrder()?.orderNumber }}</p>
            </div>
            <button
              (click)="showAssignModal.set(false)"
              class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form (ngSubmit)="assignStakeholderSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Select Stakeholder *</label
              >
              <select
                [(ngModel)]="selectedStakeholderId"
                name="stakeholderId"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              >
                @for (s of availableStakeholders(); track s) {
                  <option [value]="s.id">{{ s.companyName }} ({{ s.generatedUserId }})</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Assignment Remarks</label
              >
              <textarea
                [(ngModel)]="assignRemarks"
                name="remarks"
                rows="2"
                placeholder="Special handling or timeline requirements..."
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              ></textarea>
            </div>
            <div class="flex space-x-3 pt-2">
              <button
                type="button"
                (click)="showAssignModal.set(false)"
                class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="loading()"
                class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2"
              >
                <span>Confirm & Dispatch Notification</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- QR CODE MODAL -->
    @if (showQrModal()) {
      <div
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"
          >
            <h3 class="text-lg font-bold font-heading text-slate-900 dark:text-white">
              Product QR Code
            </h3>
            <button
              (click)="showQrModal.set(false)"
              class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <div
            class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 inline-block"
          >
            @if (qrCodeBase64()) {
              <img [src]="qrCodeBase64()" alt="QR Code" class="w-56 h-56 mx-auto rounded-xl" />
            }
          </div>
          <p class="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            Order ID: {{ selectedOrder()?.orderNumber }}
          </p>
          <button
            (click)="showQrModal.set(false)"
            class="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    }

    <!-- CANCEL ORDER MODAL -->
    @if (showCancelModal()) {
      <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">

        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Cancel Order</h3>
            <p class="text-xs text-slate-400">Order #{{ orderToCancel()?.orderNumber }}</p>
          </div>
          <button (click)="showCancelModal.set(false)" class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div class="p-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800">
          <p class="text-xs text-red-700 dark:text-red-300">
            <strong>Warning:</strong> This will cancel the order and notify all assigned stakeholders. This action cannot be undone.
          </p>
        </div>

        <form (ngSubmit)="cancelOrder()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cancellation Reason *</label>
            <textarea [(ngModel)]="cancelReason" name="cancelReason" required rows="3" placeholder="Please provide a reason for cancelling this order..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-red-500/50 focus:outline-none"></textarea>
          </div>

          <div class="flex space-x-3 pt-2">
            <button type="button" (click)="showCancelModal.set(false)" class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">
              Keep Order
            </button>
            <button type="submit" [disabled]="loading()" class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 flex items-center justify-center space-x-2">
              <span>Confirm Cancellation</span>
            </button>
          </div>
        </form>

      </div>
    </div>
    }
  `
})
export class OrgOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private stakeholderService = inject(StakeholderService);
  private auth = inject(AuthService);

  orders = signal<Order[]>([]);
  availableStakeholders = signal<Stakeholder[]>([]);
  selectedOrder = signal<Order | null>(null);

  showCreateModal = signal(false);
  showAssignModal = signal(false);
  showQrModal = signal(false);
  loading = signal(false);

  assignTargetRole = signal<Role>('MANUFACTURER');
  selectedStakeholderId: number | null = null;
  assignRemarks = '';

  qrCodeBase64 = signal<string | null>(null);

  orderForm = {
    productName: '',
    description: '',
    quantity: 100,
    priority: 'HIGH' as OrderPriority,
    manufacturerId: null as number | null,
    qaId: null as number | null,
    packagingTransportId: null as number | null,
    retailerId: null as number | null
  };

  // Stakeholder lists for premapping
  manufacturers = signal<Stakeholder[]>([]);
  qaCompanies = signal<Stakeholder[]>([]);
  packagingCompanies = signal<Stakeholder[]>([]);
  retailers = signal<Stakeholder[]>([]);

  showCancelModal = signal(false);
  cancelReason = '';
  orderToCancel = signal<Order | null>(null);

  ngOnInit() {
    this.loadOrders();
    this.loadStakeholdersForPremapping();
  }

  loadStakeholdersForPremapping() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (orgId) {
      // Load all stakeholder types for premapping
      this.stakeholderService.getStakeholders(orgId, 'MANUFACTURER').subscribe(res => {
        if (res.success && res.data) this.manufacturers.set(res.data);
      });
      this.stakeholderService.getStakeholders(orgId, 'QA').subscribe(res => {
        if (res.success && res.data) this.qaCompanies.set(res.data);
      });
      this.stakeholderService.getStakeholders(orgId, 'PACKAGING_TRANSPORT').subscribe(res => {
        if (res.success && res.data) this.packagingCompanies.set(res.data);
      });
      this.stakeholderService.getStakeholders(orgId, 'RETAILER').subscribe(res => {
        if (res.success && res.data) this.retailers.set(res.data);
      });
    }
  }

  loadOrders() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (orgId) {
      this.orderService.getOrgOrders(orgId).subscribe((res) => {
        if (res.success && res.data) {
          this.orders.set(res.data);
        }
      });
    }
  }

  openCreateModal() {
    this.showCreateModal.set(true);
  }

  createOrder() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) return;

    this.loading.set(true);
    this.orderService.createOrder(orgId, this.orderForm).subscribe({
      next: () => {
        this.loading.set(false);
        this.showCreateModal.set(false);
        this.loadOrders();
        this.orderForm = { 
          productName: '', 
          description: '', 
          quantity: 100, 
          priority: 'HIGH' as OrderPriority,
          manufacturerId: null,
          qaId: null,
          packagingTransportId: null,
          retailerId: null
        };
      },
      error: () => this.loading.set(false),
    });
  }

  openAssignModal(order: Order, role: Role) {
    this.selectedOrder.set(order);
    this.assignTargetRole.set(role);
    this.selectedStakeholderId = null;
    this.assignRemarks = '';

    const orgId = this.auth.currentUser()?.organizationId;
    if (orgId) {
      this.stakeholderService.getStakeholders(orgId, role).subscribe((res) => {
        if (res.success && res.data) {
          this.availableStakeholders.set(res.data);
          if (res.data.length > 0) {
            this.selectedStakeholderId = res.data[0].id;
          }
          this.showAssignModal.set(true);
        }
      });
    }
  }

  assignStakeholderSubmit() {
    const order = this.selectedOrder();
    if (!order || !this.selectedStakeholderId) return;

    this.loading.set(true);
    const role = this.assignTargetRole();

    let obs;
    if (role === 'MANUFACTURER')
      obs = this.orderService.assignManufacturer(
        order.id,
        this.selectedStakeholderId,
        this.assignRemarks,
      );
    else if (role === 'QA')
      obs = this.orderService.assignQa(order.id, this.selectedStakeholderId, this.assignRemarks);
    else if (role === 'PACKAGING_TRANSPORT')
      obs = this.orderService.assignPackaging(
        order.id,
        this.selectedStakeholderId,
        this.assignRemarks,
      );
    else
      obs = this.orderService.assignRetailer(
        order.id,
        this.selectedStakeholderId,
        this.assignRemarks,
      );

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.showAssignModal.set(false);
        this.loadOrders();
      },
      error: () => this.loading.set(false),
    });
  }

  openQrModal(order: Order) {
    this.selectedOrder.set(order);
    this.orderService.getQrCode(order.id).subscribe((res) => {
      if (res.success && res.data) {
        this.qrCodeBase64.set(res.data.qrCode);
        this.showQrModal.set(true);
      }
    });
  }

  exportPdf(order: Order) {
    this.orderService.exportPdf(order.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order-${order.orderNumber}.pdf`;
      a.click();
    });
  }

  exportExcel() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (orgId) {
      this.orderService.exportExcel(orgId).subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orders-Report.xlsx`;
        a.click();
      });
    }
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'COMPLETED':
        return 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'REJECTED':
        return 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default:
        return 'px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  }

  getPriorityBadgeClass(priority: OrderPriority): string {
    switch (priority) {
      case 'URGENT':
        return 'px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white';
      case 'HIGH':
        return 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white';
      default:
        return 'px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    return status.replace(/_/g, ' ');
  }

  openCancelModal(order: Order) {
    if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
      alert('Cannot cancel completed or delivered orders');
      return;
    }
    this.orderToCancel.set(order);
    this.cancelReason = '';
    this.showCancelModal.set(true);
  }

  cancelOrder() {
    const order = this.orderToCancel();
    if (!order || !this.cancelReason.trim()) return;

    this.loading.set(true);
    this.orderService.cancelOrder(order.id, this.cancelReason).subscribe({
      next: () => {
        this.loading.set(false);
        this.showCancelModal.set(false);
        this.orderToCancel.set(null);
        this.cancelReason = '';
        this.loadOrders();
      },
      error: () => this.loading.set(false)
    });
  }

  canCancelOrder(order: Order): boolean {
    return order.status !== 'COMPLETED' && order.status !== 'DELIVERED';
  }
}
