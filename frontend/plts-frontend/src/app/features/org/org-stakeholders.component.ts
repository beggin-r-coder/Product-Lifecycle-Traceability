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
            Manage Manufacturers, Quality Assurance, Packaging & Transport, and Retailers for your
            organization.
          </p>
        </div>

        <button
          (click)="openAddModal()"
          class="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2 self-start sm:self-auto"
        >
          <span class="material-symbols-outlined text-lg">person_add</span>
          <span>Add Stakeholder</span>
        </button>
      </div>

      <!-- Role Tabs -->
      <div
        class="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-850 rounded-2xl w-full sm:w-fit text-xs font-bold"
      >
        @for (tab of tabs; track tab) {
          <button
            (click)="selectTab(tab.role)"
            [class.bg-white]="selectedRole() === tab.role"
            [class.dark:bg-slate-900]="selectedRole() === tab.role"
            [class.text-brand-600]="selectedRole() === tab.role"
            [class.shadow-sm]="selectedRole() === tab.role"
            class="px-4 py-2 rounded-xl transition-all text-slate-600 dark:text-slate-400"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Stakeholders Table -->
      <div
        class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead
              class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800"
            >
              <tr>
                <th class="py-3.5 px-6">Generated User ID</th>
                <th class="py-3.5 px-6">Company Name</th>
                <th class="py-3.5 px-6">Person In Charge</th>
                <th class="py-3.5 px-6">Email Address</th>
                <th class="py-3.5 px-6">Phone</th>
                <th class="py-3.5 px-6">Role</th>
                <th class="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300"
            >
              @if (stakeholders().length === 0) {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400">
                    No stakeholders registered under this category yet. Click "Add Stakeholder" to
                    create one.
                  </td>
                </tr>
              }
              @for (s of stakeholders(); track s) {
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-4 px-6 font-mono font-extrabold text-brand-600 dark:text-brand-400">
                    {{ s.generatedUserId }}
                  </td>
                  <td class="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    {{ s.companyName }}
                  </td>
                  <td class="py-4 px-6">
                    {{ s.personInCharge }}
                  </td>
                  <td class="py-4 px-6 font-mono">
                    {{ s.companyEmail }}
                  </td>
                  <td class="py-4 px-6">
                    {{ s.phone || 'N/A' }}
                  </td>
                  <td class="py-4 px-6">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    >
                      {{ s.role }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right">
                    <span
                      class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
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
}
