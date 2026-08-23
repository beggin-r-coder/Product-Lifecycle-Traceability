import { Component, OnInit, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { StakeholderService } from '../../core/services/stakeholder.service';
import { AuthService } from '../../core/services/auth.service';
import { Role, Stakeholder } from '../../core/models/plts.models';

@Component({
  selector: 'app-org-stakeholders',
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
            Stakeholder Directory
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your supply chain partners across all lifecycle stages
          </p>
        </div>

        <button
          (click)="openAddModal()"
          class="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/30 flex items-center space-x-2 self-start sm:self-auto transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/40"
        >
          <span class="material-symbols-outlined text-lg">person_add</span>
          <span>Add Stakeholder</span>
        </button>
      </div>

      <!-- Role Tabs -->
      <div
        class="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-fit text-xs font-bold"
      >
        @for (tab of tabs; track tab) {
          <button
            (click)="selectTab(tab.role)"
            [class.bg-white]="selectedRole() === tab.role"
            [class.dark:bg-slate-900]="selectedRole() === tab.role"
            [class.text-brand-600]="selectedRole() === tab.role"
            [class.shadow-sm]="selectedRole() === tab.role"
            class="px-4 py-2.5 rounded-xl transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Stakeholders Grid -->
      @if (stakeholders().length === 0) {
        <div class="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span class="material-symbols-outlined text-3xl text-slate-400">groups</span>
            </div>
            <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">No stakeholders yet</p>
            <p class="text-xs text-slate-500 dark:text-slate-500">Add your first stakeholder to start building your supply chain</p>
          </div>
        </div>
      }

      @if (stakeholders().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (s of stakeholders(); track s) {
            <div class="group bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-brand-300 dark:hover:border-brand-600 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 rounded-xl {{ getRoleBgClass(s.role) }} text-white flex items-center justify-center shadow-lg">
                    <span class="material-symbols-outlined text-xl">{{ getRoleIcon(s.role) }}</span>
                  </div>
                  <div>
                    <p class="font-mono font-extrabold text-brand-600 dark:text-brand-400 text-xs">{{ s.generatedUserId }}</p>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {{ s.role.replace('_', ' ') }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-1">
                  <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Active</span>
                  </span>
                </div>
              </div>

              <!-- Company Info -->
              <div class="space-y-3">
                <div>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ s.companyName }}</p>
                  <p class="text-xs text-slate-500">{{ s.personInCharge }}</p>
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                    <span class="material-symbols-outlined text-sm">email</span>
                    <span class="font-mono">{{ s.companyEmail }}</span>
                  </div>
                  @if (s.phone) {
                    <div class="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                      <span class="material-symbols-outlined text-sm">phone</span>
                      <span>{{ s.phone }}</span>
                    </div>
                  }
                  @if (s.address) {
                    <div class="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                      <span class="material-symbols-outlined text-sm">location_on</span>
                      <span class="truncate">{{ s.address }}</span>
                    </div>
                  }
                </div>

                @if (s.notes) {
                  <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p class="text-[11px] text-slate-600 dark:text-slate-400 italic">{{ s.notes }}</p>
                  </div>
                }
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button class="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  View Details
                </button>
                <button class="px-3 py-2 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-lg hover:bg-brand-100 dark:hover:bg-brand-950 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- ADD STAKEHOLDER MODAL -->
    @if (showModal()) {
      <div
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
      >
        <div
          class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4"
          >
            <div>
              <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">
                Add Stakeholder
              </h3>
              <p class="text-xs text-slate-400">
                System will automatically generate a non-editable User ID (e.g. MAN-000001)
              </p>
            </div>
            <button
              (click)="closeModal()"
              class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          @if (modalError()) {
            <div
              class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 text-xs font-semibold"
            >
              {{ modalError() }}
            </div>
          }
          <form (ngSubmit)="saveStakeholder()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Stakeholder Role *</label
              >
              <select
                [(ngModel)]="form.role"
                name="role"
                required
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              >
                <option value="MANUFACTURER">Manufacturer (MAN-XXXXXX)</option>
                <option value="QA">Quality Assurance (QA-XXXXXX)</option>
                <option value="PACKAGING_TRANSPORT">Packaging & Transport (PT-XXXXXX)</option>
                <option value="RETAILER">Retailer (RET-XXXXXX)</option>
              </select>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Company Name *</label
                >
                <input
                  type="text"
                  [(ngModel)]="form.companyName"
                  name="companyName"
                  required
                  placeholder="Apex Manufacturing Ltd"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Company Email *</label
                >
                <input
                  type="email"
                  [(ngModel)]="form.companyEmail"
                  name="companyEmail"
                  required
                  placeholder="contact@apex.com"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Person In Charge *</label
                >
                <input
                  type="text"
                  [(ngModel)]="form.personInCharge"
                  name="personInCharge"
                  required
                  placeholder="John Doe"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >Phone Number</label
                >
                <input
                  type="text"
                  [(ngModel)]="form.phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Address</label
              >
              <input
                type="text"
                [(ngModel)]="form.address"
                name="address"
                placeholder="Factory 4, Industrial Zone..."
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >Notes / Instructions</label
              >
              <textarea
                [(ngModel)]="form.notes"
                name="notes"
                rows="2"
                placeholder="Special requirements or contact notes..."
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              ></textarea>
            </div>
            <div class="flex space-x-3 pt-2">
              <button
                type="button"
                (click)="closeModal()"
                class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="loading()"
                class="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2"
              >
                @if (loading()) {
                  <span
                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></span>
                }
                <span>Generate ID & Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class OrgStakeholdersComponent implements OnInit {
  private stakeholderService = inject(StakeholderService);
  private auth = inject(AuthService);

  stakeholders = signal<Stakeholder[]>([]);
  selectedRole = signal<Role | undefined>(undefined);
  showModal = signal(false);
  loading = signal(false);
  modalError = signal<string | null>(null);

  tabs = [
    { label: 'All Stakeholders', role: undefined },
    { label: 'Manufacturers', role: 'MANUFACTURER' as Role },
    { label: 'Quality Assurance', role: 'QA' as Role },
    { label: 'Packaging & Transport', role: 'PACKAGING_TRANSPORT' as Role },
    { label: 'Retailers', role: 'RETAILER' as Role },
  ];

  form = {
    role: 'MANUFACTURER' as Role,
    companyName: '',
    companyEmail: '',
    personInCharge: '',
    phone: '',
    address: '',
    notes: '',
  };

  ngOnInit() {
    this.loadStakeholders();
  }

  selectTab(role?: Role) {
    this.selectedRole.set(role);
    this.loadStakeholders();
  }

  loadStakeholders() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (orgId) {
      this.stakeholderService.getStakeholders(orgId, this.selectedRole()).subscribe((res) => {
        if (res.success && res.data) {
          this.stakeholders.set(res.data);
        }
      });
    }
  }

  openAddModal() {
    this.showModal.set(true);
    this.modalError.set(null);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveStakeholder() {
    const orgId = this.auth.currentUser()?.organizationId;
    if (!orgId) return;

    this.loading.set(true);
    this.modalError.set(null);

    this.stakeholderService.createStakeholder(orgId, this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.closeModal();
        this.loadStakeholders();
        this.form = {
          role: 'MANUFACTURER',
          companyName: '',
          companyEmail: '',
          personInCharge: '',
          phone: '',
          address: '',
          notes: '',
        };
      },
      error: (err) => {
        this.loading.set(false);
        this.modalError.set(err.error?.message || 'Failed to create stakeholder.');
      },
    });
  }

  getRoleBgClass(role: string): string {
    switch (role) {
      case 'MANUFACTURER':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'QA':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'PACKAGING_TRANSPORT':
        return 'bg-gradient-to-br from-amber-500 to-amber-600';
      case 'RETAILER':
        return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      default:
        return 'bg-gradient-to-br from-slate-500 to-slate-600';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'MANUFACTURER':
        return 'factory';
      case 'QA':
        return 'verified';
      case 'PACKAGING_TRANSPORT':
        return 'local_shipping';
      case 'RETAILER':
        return 'storefront';
      default:
        return 'business';
    }
  }
}
