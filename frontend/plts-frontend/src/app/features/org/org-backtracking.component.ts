import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-org-backtracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
            Backtracking Timeline
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Interactive visualization of product lifecycle traceability
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button (click)="animateBacktracking()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">play_arrow</span>
            <span>Trace Fault Origin</span>
          </button>
          <a routerLink="/org/investigation" class="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center space-x-2">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Investigation</span>
          </a>
        </div>
      </div>

      <!-- Product Info -->
      <div *ngIf="defectCase()" class="glass-card p-6 rounded-2xl">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">inventory_2</span>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">{{ defectCase().productName || 'Unknown Product' }}</h2>
            <p class="text-xs text-slate-500">Serial: {{ defectCase().productSerialNumber }} | Batch: {{ defectCase().batchNumber }}</p>
          </div>
        </div>
      </div>

      <!-- Backtracking Graph -->
      <div class="glass-card rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Lifecycle Timeline</h2>
          <p class="text-xs text-slate-500">Trace the product journey through each lifecycle stage</p>
        </div>

        <div *ngIf="loading()" class="p-8 text-center text-slate-500">
          <span class="material-symbols-outlined animate-spin text-3xl">refresh</span>
          <p class="mt-2">Loading backtracking data...</p>
        </div>

        <div *ngIf="!loading() && timeline().length === 0" class="p-8 text-center text-slate-500">
          <span class="material-symbols-outlined text-4xl">timeline</span>
          <p class="mt-2">No backtracking data available</p>
        </div>

        <div *ngIf="!loading() && timeline().length > 0" class="p-6">
          <div class="relative">
            <!-- Timeline Line -->
            <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

            <!-- Timeline Nodes -->
            <div class="space-y-8">
              <div *ngFor="let stage of timeline(); let i = index" 
                   class="relative flex items-start space-x-6"
                   [class.opacity-50]="animating() && i > currentStageIndex()"
                   [class.opacity-100]="!animating() || i <= currentStageIndex()">
                
                <!-- Stage Icon -->
                <div class="relative z-10 flex-shrink-0">
                  <div [class]="'w-16 h-16 rounded-2xl flex items-center justify-center ' + getStageColorClass(stage.stage)">
                    <span class="material-symbols-outlined text-3xl">{{ getStageIcon(stage.stage) }}</span>
                  </div>
                  <div *ngIf="animating() && i === currentStageIndex()" class="absolute -inset-2 rounded-2xl bg-brand-400/30 animate-ping"></div>
                </div>

                <!-- Stage Details -->
                <div class="flex-1 glass-card p-5 rounded-2xl space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-bold text-slate-900 dark:text-white">{{ stage.stage }}</h3>
                    <span class="text-xs text-slate-500">{{ stage.timestamp | date:'medium' }}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p class="text-[11px] font-bold uppercase text-slate-400">Stakeholder</p>
                      <p class="text-slate-700 dark:text-slate-300">{{ stage.stakeholderName }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold uppercase text-slate-400">Batch Number</p>
                      <p class="text-slate-700 dark:text-slate-300">{{ stage.batchNumber || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold uppercase text-slate-400">Responsible Person</p>
                      <p class="text-slate-700 dark:text-slate-300">{{ stage.responsiblePerson || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] font-bold uppercase text-slate-400">Stage ID</p>
                      <p class="text-slate-700 dark:text-slate-300">{{ stage.stakeholderId || 'N/A' }}</p>
                    </div>
                  </div>

                  <!-- Documents -->
                  <div *ngIf="stage.documents && stage.documents.length > 0" class="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p class="text-[11px] font-bold uppercase text-slate-400 mb-2">Documents</p>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let doc of stage.documents" class="px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs">
                        {{ doc }}
                      </span>
                    </div>
                  </div>

                  <!-- Certificates -->
                  <div *ngIf="stage.certificates && stage.certificates.length > 0" class="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p class="text-[11px] font-bold uppercase text-slate-400 mb-2">Certificates</p>
                    <div class="flex flex-wrap gap-2">
                      <span *ngFor="let cert of stage.certificates" class="px-2 py-1 bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 rounded-lg text-xs">
                        {{ cert }}
                      </span>
                    </div>
                  </div>

                  <!-- Remarks -->
                  <div *ngIf="stage.remarks" class="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p class="text-[11px] font-bold uppercase text-slate-400 mb-1">Remarks</p>
                    <p class="text-sm text-slate-600 dark:text-slate-400">{{ stage.remarks }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Animation Progress -->
      <div *ngIf="animating()" class="glass-card p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Tracing Fault Origin</h3>
          <span class="text-xs text-slate-500">{{ currentStageIndex() + 1 }} / {{ timeline().length }}</span>
        </div>
        <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full bg-brand-600 transition-all duration-500" [style.width.%]="((currentStageIndex() + 1) / timeline().length) * 100"></div>
        </div>
        <p class="text-xs text-slate-500 mt-2">Analyzing stage: {{ timeline()[currentStageIndex()]?.stage }}</p>
      </div>

      <!-- Risk Assessment -->
      <div *ngIf="!loading() && timeline().length > 0" class="glass-card p-6 rounded-2xl">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Risk Assessment</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p class="text-[11px] font-bold uppercase text-slate-400">Total Stages</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ timeline().length }}</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p class="text-[11px] font-bold uppercase text-slate-400">Stages with Documents</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ stagesWithDocuments() }}</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p class="text-[11px] font-bold uppercase text-slate-400">Stages with Certificates</p>
            <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{{ stagesWithCertificates() }}</p>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OrgBacktrackingComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8085';

  loading = signal(false);
  animating = signal(false);
  currentStageIndex = signal(0);
  timeline = signal<any[]>([]);
  defectCase = signal<any>(null);
  defectCaseId = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.defectCaseId.set(id);
      this.loadBacktrackingData();
    } else {
      this.router.navigate(['/org/investigation']);
    }
  }

  loadBacktrackingData() {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/api/v1/defects/${this.defectCaseId()}/backtracking`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.timeline.set(res.data.timeline || []);
          this.defectCase.set(res.data.defectCase || null);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  animateBacktracking() {
    if (this.timeline().length === 0) return;

    this.animating.set(true);
    this.currentStageIndex.set(0);

    const interval = setInterval(() => {
      if (this.currentStageIndex() < this.timeline().length - 1) {
        this.currentStageIndex.update(i => i + 1);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          this.animating.set(false);
        }, 2000);
      }
    }, 1500);
  }

  stagesWithDocuments() {
    return this.timeline().filter(t => t.documents && t.documents.length > 0).length;
  }

  stagesWithCertificates() {
    return this.timeline().filter(t => t.certificates && t.certificates.length > 0).length;
  }

  getStageIcon(stage: string): string {
    switch (stage?.toLowerCase()) {
      case 'manufacturing': return 'factory';
      case 'quality assurance': case 'qa': return 'verified';
      case 'packaging': return 'inventory';
      case 'transport': case 'packaging & transport': return 'local_shipping';
      case 'retail': case 'retailer': return 'storefront';
      default: return 'circle';
    }
  }

  getStageColorClass(stage: string): string {
    switch (stage?.toLowerCase()) {
      case 'manufacturing': return 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
      case 'quality assurance': case 'qa': return 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400';
      case 'packaging': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
      case 'transport': case 'packaging & transport': return 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400';
      case 'retail': case 'retailer': return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  }
}
