import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-org-recalls',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Recall Management Center
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Initiate, track, and manage product recalls with full accountability
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button (click)="showInitiateForm.set(true)" class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">add</span>
            <span>Initiate Recall</span>
          </button>
          <a routerLink="/org/dashboard" class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard</span>
          </a>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recalls</span>
            <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">recall</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ recallMetrics()?.totalRecalls || 0 }}</p>
          <p class="text-[11px] text-slate-400">All time recalls</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Recalls</span>
            <div class="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">warning</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ recallMetrics()?.activeRecalls || 0 }}</p>
          <p class="text-[11px] text-slate-400">Currently in progress</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Products Recalled</span>
            <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">inventory_2</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ recallMetrics()?.totalProductsRecalled || 0 }}</p>
          <p class="text-[11px] text-slate-400">Units recovered</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Completion</span>
            <div class="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center">
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{{ recallMetrics()?.completionPercentage || 0 }}%</p>
          <p class="text-[11px] text-slate-400">Overall progress</p>
        </div>
      </div>

      <!-- Initiate Recall Form Modal -->
      <div *ngIf="showInitiateForm()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Initiate New Recall</h2>
            <button (click)="showInitiateForm.set(false)" class="text-slate-400 hover:text-slate-600">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form [formGroup]="recallForm" (ngSubmit)="initiateRecall()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Defect Case</label>
              <select formControlName="defectCaseId" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                <option value="">Select defect case</option>
                <option *ngFor="let defect of defectCases()" [value]="defect.id">{{ defect.defectCaseId }} - {{ defect.defectCategory }}</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recall Scope</label>
                <select formControlName="recallScope" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                  <option value="">Select scope</option>
                  <option value="BATCH_SPECIFIC">Batch Specific</option>
                  <option value="PRODUCT_SPECIFIC">Product Specific</option>
                  <option value="GLOBAL">Global Recall</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affected Product Count</label>
                <input type="number" formControlName="affectedProductCount" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="Enter count">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Affected Batches</label>
              <input type="text" formControlName="affectedBatches" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="Comma-separated batch numbers">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select formControlName="priority" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
                <option value="">Select priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Recall Reason</label>
              <textarea formControlName="recallReason" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="Describe the reason for recall"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Cost</label>
                <input type="number" formControlName="estimatedCost" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm" placeholder="Enter estimated cost">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Completion Date</label>
                <input type="date" formControlName="estimatedCompletionDate" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm">
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button type="button" (click)="showInitiateForm.set(false)" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-300">Cancel</button>
              <button type="submit" [disabled]="submitting()" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {{ submitting() ? 'Initiating...' : 'Initiate Recall' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Recall Cases List -->
      <div class="glass-card rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Active Recalls</h2>
          <p class="text-xs text-slate-500">Track all recall cases and their progress</p>
        </div>

        <div *ngIf="loading()" class="p-8 text-center text-slate-500">
          <span class="material-symbols-outlined animate-spin text-3xl">refresh</span>
          <p class="mt-2">Loading recall cases...</p>
        </div>

        <div *ngIf="!loading() && recallCases().length === 0" class="p-8 text-center text-slate-500">
          <span class="material-symbols-outlined text-4xl">inbox</span>
          <p class="mt-2">No recall cases initiated yet</p>
        </div>

        <div *ngIf="!loading() && recallCases().length > 0" class="divide-y divide-slate-200 dark:divide-slate-700">
          <div *ngFor="let recall of recallCases()" class="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" (click)="selectRecall(recall)">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <span [class]="'px-2 py-1 rounded-full text-xs font-bold ' + getStatusClass(recall.status)">
                    {{ recall.status }}
                  </span>
                  <span class="text-xs text-slate-500">{{ recall.recallId }}</span>
                  <span [class]="'px-2 py-1 rounded-full text-xs font-bold ' + getPriorityClass(recall.priority)">
                    {{ recall.priority }}
                  </span>
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white">{{ recall.recallReason || 'No reason provided' }}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Scope: {{ recall.recallScope }} | Affected: {{ recall.affectedProductCount }} products</p>
                <div class="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                  <span>Initiated by: {{ recall.initiatedByName }}</span>
                  <span>Approved by: {{ recall.approvedByName }}</span>
                  <span *ngIf="recall.estimatedCompletionDate">Due: {{ recall.estimatedCompletionDate | date:'short' }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button (click)="viewImpactReport(recall)" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Impact Report">
                  <span class="material-symbols-outlined">assessment</span>
                </button>
                <button (click)="updateStatus(recall)" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Update Status">
                  <span class="material-symbols-outlined">edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OrgRecallsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8080';

  showInitiateForm = signal(false);
  loading = signal(false);
  submitting = signal(false);
  recallCases = signal<any[]>([]);
  defectCases = signal<any[]>([]);
  recallMetrics = signal<any>(null);

  recallForm: FormGroup = this.fb.group({
    defectCaseId: ['', Validators.required],
    recallScope: ['', Validators.required],
    affectedProductCount: [1, Validators.required],
    affectedBatches: [''],
    priority: [''],
    recallReason: [''],
    estimatedCost: [null],
    estimatedCompletionDate: ['']
  });

  ngOnInit() {
    this.loadRecallCases();
    this.loadDefectCases();
    this.loadRecallMetrics();
  }

  loadRecallCases() {
    this.loading.set(true);
    const orgId = localStorage.getItem('organizationId');
    this.http.get<any>(`${this.apiUrl}/api/v1/recalls/organization/${orgId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recallCases.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadDefectCases() {
    const orgId = localStorage.getItem('organizationId');
    this.http.get<any>(`${this.apiUrl}/api/v1/defects/organization/${orgId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.defectCases.set(res.data.filter((d: any) => d.recallRequired));
        }
      }
    });
  }

  loadRecallMetrics() {
    const orgId = localStorage.getItem('organizationId');
    this.http.get<any>(`${this.apiUrl}/api/v1/recalls/metrics/${orgId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recallMetrics.set(res.data);
        }
      }
    });
  }

  initiateRecall() {
    if (this.recallForm.invalid) return;

    this.submitting.set(true);
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Unknown';

    const payload = {
      ...this.recallForm.value,
      initiatedBy: userId,
      initiatedByName: userName,
      approvedBy: userId,
      approvedByName: userName,
      affectedBatches: this.recallForm.value.affectedBatches ? this.recallForm.value.affectedBatches.split(',').map((b: string) => b.trim()) : []
    };

    this.http.post<any>(`${this.apiUrl}/api/v1/recalls/initiate`, payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.showInitiateForm.set(false);
        this.recallForm.reset();
        this.loadRecallCases();
        this.loadRecallMetrics();
      },
      error: () => {
        this.submitting.set(false);
      }
    });
  }

  selectRecall(recall: any) {
    // Navigate to recall detail view
  }

  viewImpactReport(recall: any) {
    // Navigate to impact report view
  }

  updateStatus(recall: any) {
    // Open status update dialog
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'INITIATED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
