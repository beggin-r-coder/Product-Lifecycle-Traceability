import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl gradient-brand mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <span class="material-symbols-outlined text-2xl">domain</span>
          </div>
          <h2 class="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">Register Organization</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Create an enterprise organization profile to manage stakeholders and lifecycle orders</p>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage()" class="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Signup Form -->
        <form (ngSubmit)="onRegister()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Organization Name *</label>
              <input type="text" [(ngModel)]="form.name" name="name" required placeholder="Acme Logistics Corp" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Organization Email *</label>
              <input type="email" [(ngModel)]="form.email" name="email" required placeholder="owner@acme.com" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
              <input type="password" [(ngModel)]="form.password" name="password" required placeholder="••••••••" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="+1 (555) 000-1234" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Reg Number *</label>
              <input type="text" [(ngModel)]="form.companyRegistrationNumber" name="companyRegistrationNumber" required placeholder="REG-2026-9988" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GST Number (Optional)</label>
              <input type="text" [(ngModel)]="form.gstNumber" name="gstNumber" placeholder="22AAAAA0000A1Z5" class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs uppercase font-mono focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headquarters Address</label>
            <textarea [(ngModel)]="form.address" name="address" rows="2" placeholder="100 Tech Parkway, Suite 400..." class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500/50 focus:outline-none"></textarea>
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Register & Request OTP</span>
          </button>
        </form>

        <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="text-xs text-slate-500">
            Already registered? 
            <a routerLink="/login" class="font-bold text-brand-600 dark:text-brand-400 hover:underline">Sign In</a>
          </p>
        </div>

      </div>
    </div>

    <!-- OTP VERIFICATION MODAL -->
    <div *ngIf="showOtpModal()" class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl">mark_email_read</span>
          </div>
          <h3 class="text-xl font-bold font-heading text-slate-900 dark:text-white">Verify Email Address</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            We sent a 6-digit One-Time Password to <strong class="text-slate-800 dark:text-slate-200">{{ form.email }}</strong>
          </p>
        </div>

        <div *ngIf="modalError()" class="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 text-xs font-semibold">
          {{ modalError() }}
        </div>

        <div>
          <input 
            type="text" 
            [(ngModel)]="otpCode" 
            maxlength="6"
            placeholder="123456" 
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-lg font-mono tracking-widest text-center font-extrabold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
          >
        </div>

        <button 
          (click)="verifyOtp()" 
          [disabled]="loading()"
          class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>Verify OTP & Unlock Dashboard</span>
        </button>
      </div>
    </div>
  `
})
export class AuthSignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  showOtpModal = signal(false);
  errorMessage = signal<string | null>(null);
  modalError = signal<string | null>(null);

  otpCode = '';

  form = {
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gstNumber: '',
    companyRegistrationNumber: ''
  };

  onRegister() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.registerOrg(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.showOtpModal.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Check inputs.');
      }
    });
  }

  verifyOtp() {
    if (!this.otpCode.trim()) return;
    this.loading.set(true);
    this.modalError.set(null);

    this.auth.verifyOrgOtp(this.form.email, this.otpCode.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.showOtpModal.set(false);
        this.router.navigate(['/org/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.modalError.set(err.error?.message || 'Invalid or expired OTP code.');
      }
    });
  }
}
