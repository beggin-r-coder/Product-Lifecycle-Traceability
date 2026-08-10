import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TraceabilityService } from '../../core/services/traceability.service';
import { PublicTraceability } from '../../core/models/plts.models';

@Component({
  selector: 'app-public-traceability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <!-- Container -->
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Header Banner -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold">
            <span class="material-symbols-outlined text-base">verified</span>
            <span>Public Lifecycle Traceability Portal</span>
          </div>
          <h1 class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Track Product Authenticity & Chain
          </h1>
          <p class="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Enter any Order ID or scan the QR Code on your product packaging to view the verified, tamper-proof end-to-end lifecycle timeline.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <div class="relative flex-1 w-full">
            <span class="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-xl">search</span>
            <input 
              type="text"
              placeholder="Enter Order ID (e.g. ORD-20260806-1001)..."
              [(ngModel)]="searchOrderId"
              (keyup.enter)="searchTraceability()"
              class="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
            >
          </div>
          <button 
            (click)="searchTraceability()" 
            [disabled]="loading()"
            class="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ loading() ? 'Searching...' : 'Track Product' }}</span>
          </button>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage()" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
          <span class="material-symbols-outlined text-lg">error</span>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Traceability Report Card -->
        <div *ngIf="data()" class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-8 p-6 sm:p-8">
          
          <!-- Summary Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div class="flex items-center space-x-3">
                <h2 class="text-2xl font-bold font-heading text-slate-900 dark:text-white">{{ data()?.productName }}</h2>
                <span [class]="getStatusBadgeClass(data()?.status)">
                  {{ data()?.status }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Order Number: <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ data()?.orderNumber }}</strong> &bull; Quantity: <strong>{{ data()?.quantity }}</strong>
              </p>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="material-symbols-outlined text-brand-600 text-2xl">verified_user</span>
              <div class="text-left">
                <p class="text-[10px] text-slate-400 font-semibold uppercase">Verified Origin</p>
                <p class="text-xs font-bold text-slate-900 dark:text-white">{{ data()?.organizationName }}</p>
              </div>
            </div>
          </div>

          <!-- Stakeholder Network Summary Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Manufacturer</p>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ data()?.manufacturerName }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Quality Assurance</p>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {{ data()?.qaName }}
                <span *ngIf="data()?.qaPassed" class="ml-1 text-[10px] text-emerald-600 font-extrabold">(Passed)</span>
              </p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Packaging & Transport</p>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ data()?.packagingTransportName }}</p>
            </div>
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Retailer</p>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ data()?.retailerName }}</p>
            </div>
          </div>

          <!-- Vertical Timeline -->
          <div class="space-y-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Lifecycle Audit History</h3>
            
            <div class="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              <div *ngFor="let stage of data()?.timeline; let i = index" class="relative group">
                <!-- Dot icon -->
                <div class="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-brand-600 border-2 border-white dark:border-slate-900 shadow-md"></div>
                
                <div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span class="font-bold text-sm text-slate-900 dark:text-white">{{ stage.stageTitle }}</span>
                    <span class="text-[11px] text-slate-400 font-mono">{{ stage.timestamp | date:'medium' }}</span>
                  </div>
                  <p *ngIf="stage.responsibleCompanyName" class="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    By: {{ stage.responsibleCompanyName }} ({{ stage.responsibleRole }})
                  </p>
                  <p *ngIf="stage.remarks" class="text-xs text-slate-600 dark:text-slate-300">
                    {{ stage.remarks }}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class PublicTraceabilityComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(TraceabilityService);

  searchOrderId = '';
  loading = signal(false);
  data = signal<PublicTraceability | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.searchOrderId = params['orderId'];
        this.searchTraceability();
      }
    });
  }

  searchTraceability() {
    if (!this.searchOrderId.trim()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.service.getPublicTraceability(this.searchOrderId.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.data.set(res.data);
        } else {
          this.errorMessage.set('Order not found or invalid Order ID.');
          this.data.set(null);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Order not found with number: ' + this.searchOrderId);
        this.data.set(null);
      }
    });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'COMPLETED': return 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'REJECTED': return 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default: return 'px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    }
  }
}
