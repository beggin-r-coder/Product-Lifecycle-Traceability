import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { API_BASE_URL } from '../../core/api.config';

@Component({
  selector: 'app-org-defects',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            Defect Management
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Report, investigate, and track product defects with full traceability
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button
            (click)="showReportForm.set(true)"
            class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/30 flex items-center space-x-2 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40"
          >
            <span class="material-symbols-outlined text-base">report</span>
            <span>Report Defect</span>
          </button>
          <a
            routerLink="/org/dashboard"
            class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 transition-all duration-300"
          >
            <span class="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard</span>
          </a>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Total Cases</span
            >
            <div
              class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">report_problem</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ defectCases().length }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">All reported defects</p>
        </div>

        <div
          class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Under Investigation</span
            >
            <div
              class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">search</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ defectCases().filter((d) => d.status === 'UNDER_INVESTIGATION').length }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">Active investigations</p>
        </div>

        <div
          class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Critical</span>
            <div
              class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">priority_high</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ defectCases().filter((d) => d.severity === 'CRITICAL').length }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">High priority cases</p>
        </div>

        <div
          class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved</span>
            <div
              class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ defectCases().filter((d) => d.status === 'RESOLVED').length }}
          </p>
          <p class="text-[11px] text-slate-500 mt-1">Successfully resolved</p>
        </div>
      </div>

      <!-- Report Form Modal -->
      @if (showReportForm()) {
        <div
          class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4"
            >
              <div>
                <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  Report New Defect
                </h3>
                <p class="text-xs text-slate-400">Report product defects with full traceability</p>
              </div>
              <button
                (click)="showReportForm.set(false)"
                class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form [formGroup]="defectForm" (ngSubmit)="submitDefect()" class="space-y-4">
              <!-- Order Selection -->
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Select Order (Optional)</label
                >
                <div class="relative">
                  <input
                    type="text"
                    [value]="orderSearchTerm()"
                    (input)="orderSearchTerm.set($any($event.target).value)"
                    (focus)="onSearchFocus()"
                    (blur)="onSearchBlur()"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                    placeholder="Search by order number, product name, or serial number"
                  />
                  <span class="absolute right-3 top-2 text-slate-400">
                    <span class="material-symbols-outlined">search</span>
                  </span>
                </div>

                <!-- Order Dropdown -->
                @if (showOrderDropdown() && getFilteredOrders().length > 0) {
                  <div
                    class="mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg"
                  >
                    @for (order of getFilteredOrders(); track order) {
                      <div
                        (click)="onOrderSelect(order)"
                        class="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <div class="flex items-center justify-between">
                          <div>
                            <p class="text-xs font-semibold text-slate-900 dark:text-white">
                              {{ order.orderNumber }}
                            </p>
                            <p class="text-[11px] text-slate-500">{{ order.productName }}</p>
                          </div>
                          <span
                            [class]="
                              'px-2 py-0.5 rounded-full text-[10px] font-bold ' +
                              getOrderStatusClass(order.status)
                            "
                          >
                            {{ order.status }}
                          </span>
                        </div>
                        <div class="mt-1 flex items-center space-x-3 text-[11px] text-slate-400">
                          <span>Serial: {{ order.productSerialNumber || 'N/A' }}</span>
                          <span
                            >Batch:
                            {{ order.manufacturingBatchId || order.qaBatchId || 'N/A' }}</span
                          >
                        </div>
                      </div>
                    }
                  </div>
                }

                <!-- No Results Message -->
                @if (showOrderDropdown() && getFilteredOrders().length === 0) {
                  <div
                    class="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-500"
                  >
                    No orders found matching your search
                  </div>
                }

                <!-- Selected Order Info -->
                @if (selectedOrder()) {
                  <div
                    class="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800"
                  >
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Selected: {{ selectedOrder().orderNumber }}
                        </p>
                        <p class="text-[11px] text-blue-600 dark:text-blue-400">
                          {{ selectedOrder().productName }}
                        </p>
                      </div>
                      <button
                        (click)="clearSelectedOrder()"
                        class="text-blue-600 hover:text-blue-800"
                      >
                        <span class="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Product QR Code</label
                  >
                  <input
                    type="text"
                    formControlName="productQrCode"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                    placeholder="Auto-filled from order or scan QR"
                  />
                  <p class="text-[10px] text-slate-400 mt-1">
                    Generated when order is created (QR-orderNumber)
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Product Serial Number</label
                  >
                  <input
                    type="text"
                    formControlName="productSerialNumber"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                    placeholder="Auto-filled or enter manually"
                  />
                  <p class="text-[10px] text-slate-400 mt-1">
                    Generated by Manufacturer during production
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Batch Number</label
                  >
                  <input
                    type="text"
                    formControlName="batchNumber"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                    placeholder="Auto-filled or enter manually"
                  />
                  <p class="text-[10px] text-slate-400 mt-1">
                    Generated by Manufacturer (MFG), QA (QA), or Packaging (PKG)
                  </p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Quantity Affected</label
                  >
                  <input
                    type="number"
                    formControlName="quantityAffected"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Defect Category</label
                  >
                  <select
                    formControlName="defectCategory"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="MANUFACTURING_DEFECT">Manufacturing Defect</option>
                    <option value="QUALITY_FAILURE">Quality Failure</option>
                    <option value="PACKAGING_DAMAGE">Packaging Damage</option>
                    <option value="TRANSPORT_DAMAGE">Transport Damage</option>
                    <option value="LABELING_ERROR">Labeling Error</option>
                    <option value="SAFETY_HAZARD">Safety Hazard</option>
                    <option value="CONTAMINATION">Contamination</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Severity</label
                  >
                  <select
                    formControlName="severity"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  >
                    <option value="">Select severity</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Description</label
                >
                <textarea
                  formControlName="description"
                  rows="3"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  placeholder="Describe the defect in detail"
                ></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Location</label
                >
                <input
                  type="text"
                  formControlName="location"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  placeholder="Where was the defect discovered?"
                />
              </div>

              <div class="flex space-x-3 pt-2">
                <button
                  type="button"
                  (click)="showReportForm.set(false)"
                  class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                  @if (submitting()) {
                    <span
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></span>
                  }
                  <span>{{ submitting() ? 'Submitting...' : 'Submit Report' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Recall Initiation Modal -->
      @if (showRecallForm()) {
        <div
          class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
        >
          <div
            class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
          >
            <div
              class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4"
            >
              <div>
                <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  Initiate Product Recall
                </h3>
                <p class="text-xs text-slate-400">Initiate recall for defective products</p>
              </div>
              <button
                (click)="showRecallForm.set(false)"
                class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            @if (selectedDefect()) {
              <div
                class="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800"
              >
                <p class="text-sm font-semibold text-red-700 dark:text-red-300">
                  Defect: {{ selectedDefect().defectCategory }}
                </p>
                <p class="text-xs text-red-600 dark:text-red-400">
                  Severity: {{ selectedDefect().severity }} | Product:
                  {{ selectedDefect().productSerialNumber }}
                </p>
              </div>
            }

            <form [formGroup]="recallForm" (ngSubmit)="submitRecall()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Recall Scope</label
                  >
                  <select
                    formControlName="recallScope"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  >
                    <option value="MANUFACTURING_BATCH">Manufacturing Batch</option>
                    <option value="SINGLE_PRODUCT">Single Product</option>
                    <option value="FULL_RECALL">Full Recall</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Priority</label
                  >
                  <select
                    formControlName="priority"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Affected Product Count</label
                >
                <input
                  type="number"
                  formControlName="affectedProductCount"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  placeholder="Number of affected products"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Affected Batches (comma-separated)</label
                >
                <input
                  type="text"
                  formControlName="affectedBatches"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  placeholder="e.g., BATCH001, BATCH002"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Recall Reason</label
                >
                <textarea
                  formControlName="recallReason"
                  rows="3"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  placeholder="Explain why this recall is necessary"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Estimated Cost</label
                  >
                  <input
                    type="number"
                    formControlName="estimatedCost"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                    placeholder="Estimated cost in USD"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Estimated Completion Date</label
                  >
                  <input
                    type="date"
                    formControlName="estimatedCompletionDate"
                    class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div class="flex space-x-3 pt-2">
                <button
                  type="button"
                  (click)="showRecallForm.set(false)"
                  class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="submitting()"
                  class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                  @if (submitting()) {
                    <span
                      class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></span>
                  }
                  <span>{{ submitting() ? 'Initiating...' : 'Initiate Recall' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Defect Cases List -->
      <div
        class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg"
      >
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Defect Cases</h2>
          <p class="text-xs text-slate-500">
            Track all reported defects and their investigation status
          </p>
        </div>

        @if (loading()) {
          <div class="p-12 text-center">
            <div
              class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto"
            >
              <span class="material-symbols-outlined animate-spin text-2xl text-slate-400"
                >refresh</span
              >
            </div>
            <p class="mt-3 text-sm text-slate-500">Loading defect cases...</p>
          </div>
        }

        @if (!loading() && defectCases().length === 0) {
          <div class="p-12 text-center">
            <div
              class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto"
            >
              <span class="material-symbols-outlined text-3xl text-slate-400">inbox</span>
            </div>
            <p class="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
              No defect cases reported yet
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Report your first defect to get started
            </p>
          </div>
        }

        @if (!loading() && defectCases().length > 0) {
          <div class="divide-y divide-slate-100 dark:divide-slate-700">
            @for (defect of defectCases(); track defect) {
              <div
                class="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group"
                (click)="selectDefect(defect)"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-3">
                      <span
                        [class]="
                          'px-2.5 py-1 rounded-lg text-xs font-bold ' +
                          getSeverityClass(defect.severity)
                        "
                      >
                        {{ defect.severity }}
                      </span>
                      <span class="text-xs font-mono text-slate-500">{{
                        defect.defectCaseId
                      }}</span>
                      <span
                        [class]="
                          'px-2.5 py-1 rounded-lg text-xs font-bold ' +
                          getStatusClass(defect.status)
                        "
                      >
                        {{ defect.status.replace('_', ' ') }}
                      </span>
                    </div>
                    <h3 class="font-bold text-slate-900 dark:text-white text-sm">
                      {{ defect.defectCategory.replace('_', ' ') }}
                    </h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {{ defect.description }}
                    </p>
                    <div class="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                      <div class="flex items-center space-x-1">
                        <span class="material-symbols-outlined text-sm">inventory</span>
                        <span>{{ defect.productSerialNumber || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center space-x-1">
                        <span class="material-symbols-outlined text-sm">label</span>
                        <span>{{ defect.batchNumber || 'N/A' }}</span>
                      </div>
                      <div class="flex items-center space-x-1">
                        <span class="material-symbols-outlined text-sm">person</span>
                        <span>{{ defect.reportedByName }}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <button
                      (click)="$event.stopPropagation(); viewBacktracking(defect)"
                      class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                      title="View Backtracking"
                    >
                      <span class="material-symbols-outlined">timeline</span>
                    </button>
                    <button
                      (click)="$event.stopPropagation(); viewAffectedProducts(defect)"
                      class="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                      title="View Affected Products"
                    >
                      <span class="material-symbols-outlined">warning</span>
                    </button>
                    <button
                      (click)="$event.stopPropagation(); analyzeRootCause(defect)"
                      class="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg transition-colors"
                      title="Analyze Root Cause"
                    >
                      <span class="material-symbols-outlined">psychology</span>
                    </button>
                    <button
                      (click)="$event.stopPropagation(); initiateRecall(defect)"
                      class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Initiate Recall"
                    >
                      <span class="material-symbols-outlined">recall</span>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class OrgDefectsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  private readonly apiUrl = API_BASE_URL;

  showReportForm = signal(false);
  showRecallForm = signal(false);
  loading = signal(false);
  submitting = signal(false);
  defectCases = signal<any[]>([]);
  selectedDefect = signal<any>(null);
  orders = signal<any[]>([]);
  selectedOrder = signal<any>(null);
  orderSearchTerm = signal('');
  showOrderDropdown = signal(false);

  defectForm: FormGroup = this.fb.group({
    orderId: [null],
    productQrCode: ['', Validators.required],
    productSerialNumber: ['', Validators.required],
    batchNumber: [''],
    quantityAffected: [1, Validators.required],
    defectCategory: ['', Validators.required],
    severity: ['', Validators.required],
    description: ['', Validators.required],
    location: [''],
    reportedByRole: ['ORGANIZATION', Validators.required],
  });

  recallForm: FormGroup = this.fb.group({
    defectCaseId: [''],
    recallScope: ['MANUFACTURING_BATCH', Validators.required],
    affectedProductCount: [1, Validators.required],
    affectedBatches: [''],
    initiatedBy: [''],
    initiatedByName: [''],
    approvedBy: [''],
    approvedByName: [''],
    priority: ['HIGH', Validators.required],
    recallReason: ['', Validators.required],
    affectedRetailers: [[]],
    affectedTransportPartners: [[]],
    estimatedCost: [0],
    estimatedCompletionDate: [''],
  });

  ngOnInit() {
    this.loadDefectCases();
    this.loadOrders();
  }

  loadOrders() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) {
      console.error('Organization ID not found');
      return;
    }
    this.http.get<any>(`${this.apiUrl}/orders/org/${orgId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.orders.set(res.data);
        }
      },
      error: () => this.orders.set([]),
    });
  }

  onOrderSelect(order: any) {
    this.selectedOrder.set(order);
    // Auto-fill with priority: manufacturingBatchId > qaBatchId > packagingBatchId > transportBatchId
    const batchNumber =
      order.manufacturingBatchId ||
      order.qaBatchId ||
      order.packagingBatchId ||
      order.transportBatchId ||
      '';

    this.defectForm.patchValue({
      orderId: order.id,
      productQrCode: order.productQrCode || '',
      productSerialNumber: order.productSerialNumber || '',
      batchNumber: batchNumber,
    });
    this.orderSearchTerm.set(order.orderNumber);
    this.showOrderDropdown.set(false);
  }

  getFilteredOrders() {
    const searchTerm = this.orderSearchTerm().toLowerCase();
    if (!searchTerm) return this.orders();

    const filtered = this.orders().filter(
      (order) =>
        order.orderNumber?.toLowerCase().includes(searchTerm) ||
        order.productName?.toLowerCase().includes(searchTerm) ||
        order.productSerialNumber?.toLowerCase().includes(searchTerm),
    );

    return filtered;
  }

  clearSelectedOrder() {
    this.selectedOrder.set(null);
    this.defectForm.patchValue({
      orderId: null,
      productQrCode: '',
      productSerialNumber: '',
      batchNumber: '',
    });
    this.orderSearchTerm.set('');
  }

  onSearchFocus() {
    this.showOrderDropdown.set(true);
  }

  onSearchBlur() {
    // Delay hiding to allow clicking on dropdown items
    setTimeout(() => {
      this.showOrderDropdown.set(false);
    }, 200);
  }

  loadDefectCases() {
    this.loading.set(true);
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) {
      console.error('Organization ID not found');
      this.loading.set(false);
      return;
    }
    this.http.get<any>(`${this.apiUrl}/defects/organization/${orgId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.defectCases.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  submitDefect() {
    if (this.defectForm.invalid) return;

    this.submitting.set(true);
    const orgId = this.auth.currentUser()?.organizationId;
    const userId = this.auth.currentUser()?.id;
    const userName = this.auth.currentUser()?.name;

    if (!orgId || !userId) {
      console.error('Organization ID or User ID not found');
      this.submitting.set(false);
      return;
    }

    const payload = {
      ...this.defectForm.value,
      organizationId: Number(orgId),
      reportedById: userId,
      reportedByName: userName || 'Unknown',
      reportedByRole: 'ORGANIZATION',
    };

    this.http.post<any>(`${this.apiUrl}/defects/report`, payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.showReportForm.set(false);
        this.defectForm.reset({ quantityAffected: 1, reportedByRole: 'ORGANIZATION' });
        this.clearSelectedOrder();
        this.loadDefectCases();
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  selectDefect(defect: any) {
    // Navigate to defect detail view with investigation
    this.router.navigate(['/org/investigation', defect.defectCaseId]);
  }

  viewBacktracking(defect: any) {
    // Navigate to backtracking view
    this.router.navigate(['/org/investigation', defect.defectCaseId, 'backtracking']);
  }

  viewAffectedProducts(defect: any) {
    // Navigate to affected products view (could be a modal or separate view)
    this.router.navigate(['/org/investigation', defect.defectCaseId], {
      queryParams: { tab: 'affected-products' },
    });
  }

  analyzeRootCause(defect: any) {
    // Navigate to root cause analysis view
    this.router.navigate(['/org/investigation', defect.defectCaseId], {
      queryParams: { tab: 'root-cause' },
    });
  }

  initiateRecall(defect: any) {
    this.selectedDefect.set(defect);
    const userId = this.auth.currentUser()?.id;
    const userName = this.auth.currentUser()?.name;
    this.recallForm.patchValue({
      defectCaseId: defect.id,
      affectedBatches: defect.batchNumber || '',
      affectedProductCount: defect.quantityAffected || 1,
      initiatedBy: userId,
      initiatedByName: userName || 'Unknown',
      approvedBy: userId,
      approvedByName: userName || 'Unknown',
    });
    this.showRecallForm.set(true);
  }

  submitRecall() {
    if (this.recallForm.invalid) return;

    this.submitting.set(true);
    const payload = {
      ...this.recallForm.value,
      affectedBatches: String(this.recallForm.value.affectedBatches || '')
        .split(',')
        .map((batch: string) => batch.trim())
        .filter(Boolean),
      affectedRetailers: [],
      affectedTransportPartners: [],
    };

    this.http.post<any>(`${this.apiUrl}/recalls/initiate`, payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.showRecallForm.set(false);
        this.recallForm.reset();
        this.selectedDefect.set(null);
        this.loadDefectCases();
        // Navigate to recalls page
        this.router.navigate(['/org/recalls']);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DEFECT_REPORTED':
        return 'bg-blue-100 text-blue-700';
      case 'UNDER_INVESTIGATION':
        return 'bg-yellow-100 text-yellow-700';
      case 'RECALL_APPROVED':
        return 'bg-red-100 text-red-700';
      case 'RESOLVED':
        return 'bg-green-100 text-green-700';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case 'CREATED':
        return 'bg-slate-100 text-slate-700';
      case 'MANUFACTURER_ASSIGNED':
        return 'bg-blue-100 text-blue-700';
      case 'MANUFACTURING':
        return 'bg-indigo-100 text-indigo-700';
      case 'MANUFACTURING_COMPLETED':
        return 'bg-purple-100 text-purple-700';
      case 'QA_ASSIGNED':
        return 'bg-cyan-100 text-cyan-700';
      case 'QA_IN_PROGRESS':
        return 'bg-teal-100 text-teal-700';
      case 'QA_COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PACKAGING_ASSIGNED':
        return 'bg-amber-100 text-amber-700';
      case 'PACKAGING_IN_PROGRESS':
        return 'bg-orange-100 text-orange-700';
      case 'PACKAGING_COMPLETED':
        return 'bg-yellow-100 text-yellow-700';
      case 'TRANSPORT_COMPLETED':
        return 'bg-lime-100 text-lime-700';
      case 'RETAILER_ASSIGNED':
        return 'bg-emerald-100 text-emerald-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}
