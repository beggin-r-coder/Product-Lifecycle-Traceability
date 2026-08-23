import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api.config';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-org-recalls',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
            Safety operations
          </p>
          <h1
            class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl"
          >
            Recall Management
          </h1>
          <p class="mt-1 text-xs text-slate-500">
            Initiate recalls, measure impact, and track recovery through completion.
          </p>
        </div>
        <div class="flex gap-2">
          <a
            routerLink="/org/defects"
            class="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            ><span class="material-symbols-outlined mr-1 text-base">report_problem</span>Defects</a
          >
          <button
            (click)="openRecallForm()"
            class="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-500/25 transition hover:from-red-700 hover:to-red-800"
          >
            <span class="material-symbols-outlined mr-1 text-base">add</span>Initiate Recall
          </button>
        </div>
      </header>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article class="metric-card">
          <span class="metric-label">Total recalls</span><strong>{{ recallCases().length }}</strong
          ><span class="material-symbols-outlined metric-icon text-blue-600 dark:text-blue-300"
            >crisis_alert</span
          >
        </article>
        <article class="metric-card">
          <span class="metric-label">Active</span><strong>{{ activeRecallCount() }}</strong
          ><span class="material-symbols-outlined metric-icon text-red-600 dark:text-red-300"
            >warning</span
          >
        </article>
        <article class="metric-card">
          <span class="metric-label">Products in scope</span
          ><strong>{{ recallMetrics()?.totalProductsRecalled || 0 }}</strong
          ><span class="material-symbols-outlined metric-icon text-amber-600 dark:text-amber-300"
            >inventory_2</span
          >
        </article>
        <article class="metric-card">
          <span class="metric-label">Recovery progress</span
          ><strong>{{ recallMetrics()?.completionPercentage || 0 }}%</strong
          ><span
            class="material-symbols-outlined metric-icon text-emerald-600 dark:text-emerald-300"
            >task_alt</span
          >
        </article>
      </section>

      @if (selectedRecall() && !showStatusModal()) {
        <section
          class="rounded-3xl border border-brand-200 bg-brand-50/60 p-6 shadow-sm dark:border-brand-900/60 dark:bg-brand-950/20"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p
                class="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300"
              >
                Impact report
              </p>
              <h2 class="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                {{ selectedRecall().recallId }}
              </h2>
            </div>
            <button
              (click)="clearSelectedRecall()"
              class="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          @if (impactLoading()) {
            <div class="py-7 text-center text-xs text-slate-500">
              <span class="material-symbols-outlined animate-spin text-xl">refresh</span>
              <p class="mt-2">Preparing impact analysis...</p>
            </div>
          } @else if (impactReport()) {
            <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="impact-stat">
                <span>Produced</span><strong>{{ impactReport().totalProduced || 0 }}</strong>
              </div>
              <div class="impact-stat">
                <span>In transit</span><strong>{{ impactReport().unitsInTransit || 0 }}</strong>
              </div>
              <div class="impact-stat">
                <span>With retailers</span
                ><strong>{{ impactReport().unitsWithRetailers || 0 }}</strong>
              </div>
              <div class="impact-stat">
                <span>Coverage</span><strong>{{ impactReport().recallCoverage || 0 }}%</strong>
              </div>
            </div>
          } @else {
            <p class="mt-4 text-xs text-slate-500">
              Impact data could not be prepared for this recall.
            </p>
          }
        </section>
      }

      <section
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800"
        >
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">Recall cases</h2>
            <p class="mt-1 text-xs text-slate-500">
              Open an impact report or advance a recall status.
            </p>
          </div>
          <button
            (click)="loadAll()"
            class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh"
          >
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>
        @if (loading()) {
          <div class="p-12 text-center text-sm text-slate-500">
            <span class="material-symbols-outlined animate-spin text-2xl">refresh</span>
            <p class="mt-2">Loading recall cases...</p>
          </div>
        } @else if (!recallCases().length) {
          <div class="p-12 text-center">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600"
              >crisis_alert</span
            >
            <p class="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              No recalls have been initiated
            </p>
            <button
              (click)="openRecallForm()"
              class="mt-4 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Initiate the first recall
            </button>
          </div>
        } @else {
          <div class="divide-y divide-slate-100 dark:divide-slate-800">
            @for (recall of recallCases(); track recall.id) {
              <article
                class="flex flex-col gap-4 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span
                      [class]="
                        'rounded-full px-2 py-1 text-[10px] font-extrabold ' +
                        getStatusClass(recall.status)
                      "
                      >{{ formatLabel(recall.status) }}</span
                    ><span class="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{{
                      recall.recallId
                    }}</span
                    ><span
                      [class]="
                        'rounded-full px-2 py-1 text-[10px] font-bold ' +
                        getPriorityClass(recall.priority)
                      "
                      >{{ recall.priority || 'STANDARD' }}</span
                    >
                  </div>
                  <h3 class="mt-2 truncate text-sm font-bold text-slate-900 dark:text-white">
                    {{ recall.recallReason || 'Recall reason pending' }}
                  </h3>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ formatLabel(recall.recallScope) }} · {{ recall.affectedProductCount }} units
                    · initiated by {{ recall.initiatedByName }}
                  </p>
                </div>
                <div class="flex shrink-0 gap-2">
                  <button
                    (click)="viewImpactReport(recall)"
                    class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-300"
                  >
                    <span class="material-symbols-outlined mr-1 text-sm">assessment</span
                    >Impact</button
                  ><button
                    (click)="openStatusModal(recall)"
                    class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    <span class="material-symbols-outlined mr-1 text-sm">edit</span>Status
                  </button>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </div>

    @if (showInitiateForm()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div
            class="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800"
          >
            <div>
              <h2 class="text-xl font-bold text-slate-900 dark:text-white">Initiate recall</h2>
              <p class="mt-1 text-xs text-slate-500">
                Link a verified defect and define the recovery scope.
              </p>
            </div>
            <button
              (click)="showInitiateForm.set(false)"
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form [formGroup]="recallForm" (ngSubmit)="initiateRecall()" class="mt-6 space-y-4">
            @if (formError()) {
              <p
                class="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"
              >
                {{ formError() }}
              </p>
            }
            <div>
              <label class="form-label">Defect case *</label
              ><select formControlName="defectCaseId" class="form-control">
                <option value="">Select a defect case</option>
                @for (defect of defectCases(); track defect.id) {
                  <option [value]="defect.id">
                    {{ defect.defectCaseId }} · {{ formatLabel(defect.defectCategory) }}
                  </option>
                }
              </select>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="form-label">Recall scope *</label
                ><select formControlName="recallScope" class="form-control">
                  <option value="MANUFACTURING_BATCH">Manufacturing batch</option>
                  <option value="QA_BATCH">QA batch</option>
                  <option value="PACKAGING_BATCH">Packaging batch</option>
                  <option value="TRANSPORT_BATCH">Transport batch</option>
                  <option value="SINGLE_PRODUCT">Single product</option>
                  <option value="PRODUCT_LINE">Product line</option>
                  <option value="FULL_RECALL">Full recall</option>
                </select>
              </div>
              <div>
                <label class="form-label">Affected product count *</label
                ><input
                  type="number"
                  min="1"
                  formControlName="affectedProductCount"
                  class="form-control"
                />
              </div>
            </div>
            <div>
              <label class="form-label">Affected batches</label
              ><input
                formControlName="affectedBatches"
                class="form-control"
                placeholder="Comma-separated batch numbers"
              />
            </div>
            <div>
              <label class="form-label">Recall reason</label
              ><textarea
                rows="3"
                formControlName="recallReason"
                class="form-control"
                placeholder="Explain why the recall is needed"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="form-label">Priority</label
                ><select formControlName="priority" class="form-control">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label class="form-label">Estimated completion</label
                ><input
                  type="date"
                  formControlName="estimatedCompletionDate"
                  class="form-control"
                />
              </div>
            </div>
            <div>
              <label class="form-label">Estimated cost</label
              ><input
                type="number"
                min="0"
                formControlName="estimatedCost"
                class="form-control"
                placeholder="Optional"
              />
            </div>
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                (click)="showInitiateForm.set(false)"
                class="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel</button
              ><button
                type="submit"
                [disabled]="submitting()"
                class="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {{ submitting() ? 'Initiating...' : 'Initiate Recall' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    @if (showStatusModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      >
        <div
          class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            class="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800"
          >
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">Update Recall Status</h2>
              <p class="mt-1 text-xs text-slate-500">{{ selectedRecall()?.recallId }}</p>
            </div>
            <button
              (click)="showStatusModal.set(false)"
              class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form (ngSubmit)="submitStatusUpdate()" class="mt-5 space-y-4">
            <select [(ngModel)]="recallStatus" name="recallStatus" class="form-control">
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="NOTIFICATIONS_SENT">Notifications sent</option>
              <option value="COLLECTION_IN_PROGRESS">Collection in progress</option>
              <option value="VERIFICATION_IN_PROGRESS">Verification in progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
            @if (formError()) {
              <p class="text-xs text-red-600 dark:text-red-300">{{ formError() }}</p>
            }
            <div class="flex gap-3">
              <button
                type="button"
                (click)="showStatusModal.set(false)"
                class="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel</button
              ><button
                type="submit"
                [disabled]="submitting()"
                class="flex-1 rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Save Status
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class OrgRecallsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = API_BASE_URL;

  showInitiateForm = signal(false);
  showStatusModal = signal(false);
  loading = signal(false);
  submitting = signal(false);
  impactLoading = signal(false);
  formError = signal<string | null>(null);
  recallCases = signal<any[]>([]);
  defectCases = signal<any[]>([]);
  recallMetrics = signal<any>(null);
  selectedRecall = signal<any>(null);
  impactReport = signal<any>(null);
  recallStatus = 'DRAFT';

  recallForm: FormGroup = this.fb.group({
    defectCaseId: ['', Validators.required],
    recallScope: ['MANUFACTURING_BATCH', Validators.required],
    affectedProductCount: [1, [Validators.required, Validators.min(1)]],
    affectedBatches: [''],
    priority: ['HIGH'],
    recallReason: [''],
    estimatedCost: [null],
    estimatedCompletionDate: [''],
  });

  ngOnInit() {
    this.loadAll();
    this.route.queryParamMap.subscribe((params) => {
      const defectId = Number(params.get('defectId'));
      if (params.get('open') === 'true' && defectId > 0) this.openRecallForm(defectId);
    });
  }

  loadAll() {
    this.loadRecallCases();
    this.loadDefectCases();
    this.loadRecallMetrics();
  }

  loadRecallCases() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) return;
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/recalls/organization/${orgId}`).subscribe({
      next: (res) => {
        this.recallCases.set(res.success && res.data ? res.data : []);
        this.loading.set(false);
      },
      error: () => {
        this.recallCases.set([]);
        this.loading.set(false);
      },
    });
  }

  loadDefectCases() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) return;
    this.http.get<any>(`${this.apiUrl}/defects/organization/${orgId}`).subscribe({
      next: (res) => this.defectCases.set(res.success && res.data ? res.data : []),
      error: () => this.defectCases.set([]),
    });
  }

  loadRecallMetrics() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) return;
    this.http.get<any>(`${this.apiUrl}/recalls/metrics/organization/${orgId}`).subscribe({
      next: (res) => this.recallMetrics.set(res.success ? res.data : null),
      error: () => this.recallMetrics.set(null),
    });
  }

  openRecallForm(defectId?: number) {
    this.formError.set(null);
    this.recallForm.reset({
      defectCaseId: defectId || '',
      recallScope: 'MANUFACTURING_BATCH',
      affectedProductCount: 1,
      affectedBatches: '',
      priority: 'HIGH',
      recallReason: '',
      estimatedCost: null,
      estimatedCompletionDate: '',
    });
    const defect = this.defectCases().find((item) => item.id === defectId);
    if (defect)
      this.recallForm.patchValue({
        affectedProductCount: defect.quantityAffected || 1,
        affectedBatches: defect.batchNumber || '',
        recallReason: defect.description || '',
      });
    this.showInitiateForm.set(true);
  }

  initiateRecall() {
    if (this.recallForm.invalid) return;
    const user = this.auth.currentUser();
    if (!user) return;
    this.submitting.set(true);
    this.formError.set(null);
    const value = this.recallForm.value;
    const payload = {
      ...value,
      defectCaseId: Number(value.defectCaseId),
      initiatedBy: String(user.id),
      initiatedByName: user.name,
      approvedBy: String(user.id),
      approvedByName: user.name,
      affectedBatches: String(value.affectedBatches || '')
        .split(',')
        .map((batch) => batch.trim())
        .filter(Boolean),
      estimatedCompletionDate: value.estimatedCompletionDate
        ? `${value.estimatedCompletionDate}T00:00:00`
        : null,
    };
    this.http.post<any>(`${this.apiUrl}/recalls/initiate`, payload).subscribe({
      next: (res) => {
        if (!res.success) {
          this.formError.set(res.message || 'Unable to initiate the recall.');
          this.submitting.set(false);
          return;
        }
        this.submitting.set(false);
        this.showInitiateForm.set(false);
        this.loadAll();
      },
      error: (error) => {
        this.formError.set(error.error?.message || 'Unable to initiate the recall.');
        this.submitting.set(false);
      },
    });
  }

  viewImpactReport(recall: any) {
    this.selectedRecall.set(recall);
    this.impactReport.set(null);
    this.impactLoading.set(true);
    this.http.get<any>(`${this.apiUrl}/recalls/${recall.recallId}/impact-report`).subscribe({
      next: (res) => {
        this.impactReport.set(res.success ? res.data : null);
        this.impactLoading.set(false);
      },
      error: () => this.impactLoading.set(false),
    });
  }

  openStatusModal(recall: any) {
    this.selectedRecall.set(recall);
    this.recallStatus = recall.status;
    this.formError.set(null);
    this.showStatusModal.set(true);
  }

  submitStatusUpdate() {
    const recall = this.selectedRecall();
    if (!recall) return;
    this.submitting.set(true);
    this.formError.set(null);
    this.http
      .put<any>(`${this.apiUrl}/recalls/${recall.recallId}/status`, { status: this.recallStatus })
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.formError.set(res.message || 'Unable to update the recall status.');
            this.submitting.set(false);
            return;
          }
          this.submitting.set(false);
          this.showStatusModal.set(false);
          this.loadAll();
        },
        error: (error) => {
          this.formError.set(error.error?.message || 'Unable to update the recall status.');
          this.submitting.set(false);
        },
      });
  }

  clearSelectedRecall() {
    this.selectedRecall.set(null);
    this.impactReport.set(null);
  }
  activeRecallCount(): number {
    return this.recallCases().filter(
      (recall) => recall.status !== 'DRAFT' && recall.status !== 'COMPLETED',
    ).length;
  }
  formatLabel(value: string | undefined): string {
    return (value || '').replaceAll('_', ' ');
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      case 'NOTIFICATIONS_SENT':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
      case 'COLLECTION_IN_PROGRESS':
      case 'VERIFICATION_IN_PROGRESS':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  }
  getPriorityClass(priority: string): string {
    switch (priority) {
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
}
