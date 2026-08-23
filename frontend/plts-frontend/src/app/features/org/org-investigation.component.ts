import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-org-investigation',
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
            Investigation Dashboard
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Premium investigation workspace with full traceability and analytics
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <a
            routerLink="/org/defects"
            class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-2"
          >
            <span class="material-symbols-outlined text-base">list</span>
            <span>All Defects</span>
          </a>
          <a
            routerLink="/org/dashboard"
            class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2"
          >
            <span class="material-symbols-outlined text-base">dashboard</span>
            <span>Dashboard</span>
          </a>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Total Defects</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">report</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ defectCases().length }}
          </p>
          <p class="text-[11px] text-slate-400">All reported cases</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Under Investigation</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">search</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ underInvestigationCount() }}
          </p>
          <p class="text-[11px] text-slate-400">Active investigations</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400"
              >Recall Required</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">warning</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ recallRequiredCount() }}
          </p>
          <p class="text-[11px] text-slate-400">Pending recalls</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved</span>
            <div
              class="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <p class="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">
            {{ resolvedCount() }}
          </p>
          <p class="text-[11px] text-slate-400">Closed cases</p>
        </div>
      </div>

      <!-- Defect Case Detail View -->
      <div *ngIf="selectedDefect()" class="glass-card rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Case: {{ selectedDefect().defectCaseId }}
              </h2>
              <p class="text-xs text-slate-500">
                {{ selectedDefect().productName }} - {{ selectedDefect().productSerialNumber }}
              </p>
            </div>
            <button (click)="returnToList()" class="text-slate-400 hover:text-slate-600">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Status and Severity -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p class="text-[11px] font-bold uppercase text-slate-400">Status</p>
              <p [class]="'mt-1 font-semibold ' + getStatusClass(selectedDefect().status)">
                {{ selectedDefect().status }}
              </p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p class="text-[11px] font-bold uppercase text-slate-400">Severity</p>
              <p [class]="'mt-1 font-semibold ' + getSeverityClass(selectedDefect().severity)">
                {{ selectedDefect().severity }}
              </p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p class="text-[11px] font-bold uppercase text-slate-400">Category</p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-white">
                {{ selectedDefect().defectCategory }}
              </p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p class="text-[11px] font-bold uppercase text-slate-400">Recall Required</p>
              <p
                class="mt-1 font-semibold"
                [class]="selectedDefect().recallRequired ? 'text-red-600' : 'text-green-600'"
              >
                {{ selectedDefect().recallRequired ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
            <p
              class="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl"
            >
              {{ selectedDefect().description }}
            </p>
          </div>

          @if (analysisMode()) {
            <section
              class="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-800/40"
            >
              <div class="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">
                    {{
                      analysisMode() === 'affected' ? 'Affected Products' : 'Root Cause Analysis'
                    }}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {{
                      analysisMode() === 'affected'
                        ? 'Items linked to the reported batch and supply chain.'
                        : 'Signals derived from the recorded lifecycle data.'
                    }}
                  </p>
                </div>
                <button
                  (click)="analysisMode.set(null)"
                  class="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-700"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              @if (analysisLoading()) {
                <div class="py-6 text-center text-xs text-slate-500">
                  <span class="material-symbols-outlined animate-spin text-xl">refresh</span>
                  <p class="mt-2">Analyzing traceability data...</p>
                </div>
              } @else if (analysisError()) {
                <div
                  class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  {{ analysisError() }}
                </div>
              } @else if (analysisMode() === 'affected') {
                @if (affectedProducts().length) {
                  <div
                    class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <table class="w-full text-left text-xs">
                      <thead class="bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                        <tr>
                          <th class="px-3 py-2.5">Batch</th>
                          <th class="px-3 py-2.5">Risk</th>
                          <th class="px-3 py-2.5">Location</th>
                          <th class="px-3 py-2.5">Reason</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
                        @for (product of affectedProducts(); track product.productId) {
                          <tr>
                            <td class="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-200">
                              {{ product.batchNumber }}
                            </td>
                            <td class="px-3 py-2.5">
                              <span
                                [class]="
                                  'rounded-full px-2 py-1 text-[10px] font-bold ' +
                                  getRiskClass(product.riskLevel)
                                "
                                >{{ product.riskLevel }}</span
                              >
                            </td>
                            <td class="px-3 py-2.5 text-slate-600 dark:text-slate-300">
                              {{ product.currentLocation || 'Unknown' }}
                            </td>
                            <td class="px-3 py-2.5 text-slate-500">{{ product.riskReason }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="rounded-xl bg-white p-4 text-xs text-slate-500 dark:bg-slate-900">
                    No related batches were found for this defect.
                  </p>
                }
              } @else if (rootCause()) {
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div class="rounded-xl bg-white p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Probable root cause
                    </p>
                    <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {{ rootCause().probableRootCause || 'Insufficient lifecycle data' }}
                    </p>
                  </div>
                  <div class="rounded-xl bg-white p-4 dark:bg-slate-900">
                    <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Confidence
                    </p>
                    <p class="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {{ rootCause().confidenceScore || 0 }}%
                    </p>
                  </div>
                </div>
                <div class="mt-3 rounded-xl bg-white p-4 dark:bg-slate-900">
                  <p class="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Contributing factors
                  </p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    @for (factor of rootCause().contributingFactors || []; track factor) {
                      <span
                        class="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                        >{{ factor }}</span
                      >
                    } @empty {
                      <span class="text-xs text-slate-500">No factors are available yet.</span>
                    }
                  </div>
                </div>
              }
            </section>
          }

          <!-- Investigation Update Form -->
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Update Investigation
            </h3>
            <form
              [formGroup]="investigationForm"
              (ngSubmit)="updateInvestigation()"
              class="space-y-4"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Status</label
                  >
                  <select
                    formControlName="status"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="">Select status</option>
                    <option value="DEFECT_REPORTED">Defect Reported</option>
                    <option value="UNDER_INVESTIGATION">Under Investigation</option>
                    <option value="RECALL_APPROVED">Recall Approved</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                    >Recall Required</label
                  >
                  <select
                    formControlName="recallRequired"
                    class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="">Select option</option>
                    <option [ngValue]="true">Yes</option>
                    <option [ngValue]="false">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Investigation Notes</label
                >
                <textarea
                  formControlName="investigationNotes"
                  rows="3"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  placeholder="Add investigation notes..."
                ></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Root Cause</label
                >
                <input
                  type="text"
                  formControlName="rootCause"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  placeholder="Identified root cause"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Corrective Actions</label
                >
                <textarea
                  formControlName="correctiveActions"
                  rows="2"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                  placeholder="Describe corrective actions..."
                ></textarea>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="submit"
                  [disabled]="updating()"
                  class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
                >
                  {{ updating() ? 'Updating...' : 'Update Investigation' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              (click)="viewBacktracking()"
              class="px-4 py-2 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-200 flex items-center space-x-2"
            >
              <span class="material-symbols-outlined text-lg">timeline</span>
              <span>View Backtracking</span>
            </button>
            <button
              (click)="viewAffectedProducts()"
              class="px-4 py-2 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-semibold hover:bg-amber-200 flex items-center space-x-2"
            >
              <span class="material-symbols-outlined text-lg">warning</span>
              <span>Affected Products</span>
            </button>
            <button
              (click)="analyzeRootCause()"
              class="px-4 py-2 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold hover:bg-purple-200 flex items-center space-x-2"
            >
              <span class="material-symbols-outlined text-lg">psychology</span>
              <span>Root Cause Analysis</span>
            </button>
            <button
              (click)="initiateRecall()"
              class="px-4 py-2 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 flex items-center space-x-2"
            >
              <span class="material-symbols-outlined text-lg">recall</span>
              <span>Initiate Recall</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Defect Cases List -->
      <div *ngIf="!selectedDefect()" class="glass-card rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Defect Cases</h2>
          <p class="text-xs text-slate-500">Select a case to investigate</p>
        </div>

        <div *ngIf="loading()" class="p-8 text-center text-slate-500">
          <span class="material-symbols-outlined animate-spin text-3xl">refresh</span>
          <p class="mt-2">Loading defect cases...</p>
        </div>

        <div
          *ngIf="!loading() && defectCases().length === 0"
          class="p-8 text-center text-slate-500"
        >
          <span class="material-symbols-outlined text-4xl">inbox</span>
          <p class="mt-2">No defect cases reported yet</p>
        </div>

        <div
          *ngIf="!loading() && defectCases().length > 0"
          class="divide-y divide-slate-200 dark:divide-slate-700"
        >
          <div
            *ngFor="let defect of defectCases()"
            class="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            (click)="selectDefect(defect)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <span
                    [class]="
                      'px-2 py-1 rounded-full text-xs font-bold ' +
                      getSeverityClass(defect.severity)
                    "
                  >
                    {{ defect.severity }}
                  </span>
                  <span class="text-xs text-slate-500">{{ defect.defectCaseId }}</span>
                  <span
                    [class]="
                      'px-2 py-1 rounded-full text-xs font-bold ' + getStatusClass(defect.status)
                    "
                  >
                    {{ defect.status }}
                  </span>
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white">
                  {{ defect.defectCategory }}
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {{ defect.description }}
                </p>
                <div class="flex items-center space-x-4 mt-3 text-xs text-slate-500">
                  <span>Product: {{ defect.productSerialNumber }}</span>
                  <span>Batch: {{ defect.batchNumber }}</span>
                  <span>Reported by: {{ defect.reportedByName }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="material-symbols-outlined text-slate-400">chevron_right</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OrgInvestigationComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  private readonly apiUrl = API_BASE_URL;

  loading = signal(false);
  updating = signal(false);
  defectCases = signal<any[]>([]);
  selectedDefect = signal<any>(null);
  analysisMode = signal<'affected' | 'root-cause' | null>(null);
  analysisLoading = signal(false);
  analysisError = signal<string | null>(null);
  affectedProducts = signal<any[]>([]);
  rootCause = signal<any>(null);

  investigationForm: FormGroup = this.fb.group({
    status: [''],
    recallRequired: [null],
    investigationNotes: [''],
    rootCause: [''],
    correctiveActions: [''],
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => this.loadDefectCases(params.get('defectCaseId')));
  }

  loadDefectCases(defectCaseId?: string | null) {
    this.loading.set(true);
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) {
      this.loading.set(false);
      return;
    }
    this.http.get<any>(`${this.apiUrl}/defects/organization/${orgId}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.defectCases.set(res.data);
          const selected = defectCaseId
            ? res.data.find((defect: any) => defect.defectCaseId === defectCaseId)
            : null;
          if (selected) {
            this.selectDefect(selected);
            this.openRequestedAnalysis();
          } else if (defectCaseId) {
            this.selectedDefect.set(null);
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  selectDefect(defect: any) {
    this.selectedDefect.set(defect);
    this.investigationForm.patchValue({
      status: defect.status,
      recallRequired: defect.recallRequired,
      investigationNotes: defect.investigationNotes,
      rootCause: defect.rootCause,
      correctiveActions: defect.correctiveActions,
    });
  }

  updateInvestigation() {
    if (!this.selectedDefect()) return;

    this.updating.set(true);
    const defectCaseId = this.selectedDefect().defectCaseId;

    this.http
      .put<any>(
        `${this.apiUrl}/defects/${defectCaseId}/investigation`,
        this.investigationForm.value,
      )
      .subscribe({
        next: (res) => {
          this.updating.set(false);
          this.loadDefectCases();
          if (res.success && res.data) {
            this.selectedDefect.set(res.data);
          }
        },
        error: () => {
          this.updating.set(false);
        },
      });
  }

  viewBacktracking() {
    if (!this.selectedDefect()) return;
    this.router.navigate([
      '/org/investigation',
      this.selectedDefect().defectCaseId,
      'backtracking',
    ]);
  }

  viewAffectedProducts() {
    if (!this.selectedDefect()) return;
    this.analysisMode.set('affected');
    this.analysisLoading.set(true);
    this.analysisError.set(null);
    this.http
      .get<any>(`${this.apiUrl}/defects/${this.selectedDefect().defectCaseId}/affected-products`)
      .subscribe({
        next: (res) => {
          this.affectedProducts.set(res.success && res.data ? res.data : []);
          this.analysisLoading.set(false);
        },
        error: () => {
          this.analysisError.set('Affected-product analysis is not available for this case.');
          this.analysisLoading.set(false);
        },
      });
  }

  analyzeRootCause() {
    if (!this.selectedDefect()) return;
    this.analysisMode.set('root-cause');
    this.analysisLoading.set(true);
    this.analysisError.set(null);
    this.http
      .get<any>(`${this.apiUrl}/defects/${this.selectedDefect().defectCaseId}/root-cause`)
      .subscribe({
        next: (res) => {
          this.rootCause.set(res.success ? res.data : null);
          this.analysisLoading.set(false);
        },
        error: () => {
          this.analysisError.set('Root-cause analysis is not available for this case.');
          this.analysisLoading.set(false);
        },
      });
  }

  initiateRecall() {
    if (!this.selectedDefect()) return;
    this.router.navigate(['/org/recalls'], {
      queryParams: { defectId: this.selectedDefect().id, open: 'true' },
    });
  }

  returnToList() {
    this.analysisMode.set(null);
    this.selectedDefect.set(null);
    this.router.navigate(['/org/investigation']);
  }

  getRiskClass(riskLevel: string): string {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  }

  private openRequestedAnalysis() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'affected-products') this.viewAffectedProducts();
    if (tab === 'root-cause') this.analyzeRootCause();
  }

  underInvestigationCount() {
    return this.defectCases().filter((d) => d.status === 'UNDER_INVESTIGATION').length;
  }

  recallRequiredCount() {
    return this.defectCases().filter((d) => d.recallRequired).length;
  }

  resolvedCount() {
    return this.defectCases().filter((d) => d.status === 'RESOLVED' || d.status === 'CLOSED')
      .length;
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
}
