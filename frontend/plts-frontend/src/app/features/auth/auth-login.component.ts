import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl gradient-brand mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <span class="material-symbols-outlined text-2xl">lock</span>
          </div>
          <h2 class="text-2xl font-heading font-extrabold text-slate-900 dark:text-white">System Access Portal</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Select your account type to access the system</p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
          <button 
            (click)="activeTab.set('ORG')" 
            [class.bg-white]="activeTab() === 'ORG'"
            [class.dark:bg-slate-900]="activeTab() === 'ORG'"
            [class.text-brand-600]="activeTab() === 'ORG'"
            [class.shadow-sm]="activeTab() === 'ORG'"
            class="flex-1 py-2 rounded-lg transition-all text-center text-slate-600 dark:text-slate-300"
          >
            Organization Owner
          </button>
          <button 
            (click)="activeTab.set('STAKEHOLDER')" 
            [class.bg-white]="activeTab() === 'STAKEHOLDER'"
            [class.dark:bg-slate-900]="activeTab() === 'STAKEHOLDER'"
            [class.text-brand-600]="activeTab() === 'STAKEHOLDER'"
            [class.shadow-sm]="activeTab() === 'STAKEHOLDER'"
            class="flex-1 py-2 rounded-lg transition-all text-center text-slate-600 dark:text-slate-300"
          >
            Stakeholder (ID + OTP)
          </button>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage()" class="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
          <span class="material-symbols-outlined text-base">error</span>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- ORGANIZATION LOGIN FLOW -->
        <form *ngIf="activeTab() === 'ORG' && orgOtpStep() === 1" (ngSubmit)="onOrgLogin()" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Organization Email</label>
            <input 
              type="email" 
              [(ngModel)]="orgEmail" 
              name="orgEmail" 
              required 
              placeholder="org@company.com" 
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
            >
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              [(ngModel)]="orgPassword" 
              name="orgPassword" 
              required 
              placeholder="••••••••" 
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
            >
          </div>

          <button 
            type="submit" 
            [disabled]="loading()"
            class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Send Login OTP</span>
          </button>
        </form>

        <form *ngIf="activeTab() === 'ORG' && orgOtpStep() === 2" (ngSubmit)="verifyOrgLoginOtp()" class="space-y-4">
          <div class="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300">
            A 6-digit OTP was sent to <strong>{{ orgEmail }}</strong>.
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">6-Digit OTP Code</label>
            <input type="text" [(ngModel)]="orgOtpCode" name="orgOtpCode" required maxlength="6" placeholder="123456"
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-base font-mono tracking-widest text-center font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none">
          </div>

          <div class="flex space-x-2">
            <button type="button" (click)="orgOtpStep.set(1)" class="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">Back</button>
            <button type="submit" [disabled]="loading()" class="w-2/3 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2">
              <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Verify OTP & Sign In</span>
            </button>
          </div>
        </form>

        <!-- STAKEHOLDER OTP LOGIN FLOW -->
        <div *ngIf="activeTab() === 'STAKEHOLDER'" class="space-y-4">
          <!-- Step 1: Enter Generated User ID -->
          <form *ngIf="otpStep() === 1" (ngSubmit)="sendStakeholderOtp()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Generated User ID</label>
              <input 
                type="text" 
                [(ngModel)]="generatedUserId" 
                name="generatedUserId" 
                required 
                placeholder="e.g. MAN-000001, QA-000001" 
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm uppercase font-mono font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              >
              <p class="text-[11px] text-slate-400 mt-1">No password required. An OTP will be dispatched to your email.</p>
            </div>

            <button 
              type="submit" 
              [disabled]="loading()"
              class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Send OTP Code</span>
            </button>
          </form>

          <!-- Step 2: Enter 6-Digit OTP -->
          <form *ngIf="otpStep() === 2" (ngSubmit)="verifyStakeholderOtp()" class="space-y-4">
            <div class="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-800 text-xs text-brand-700 dark:text-brand-300">
              OTP sent for User ID: <strong class="font-mono">{{ generatedUserId }}</strong>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">6-Digit OTP Code</label>
              <input 
                type="text" 
                [(ngModel)]="otpCode" 
                name="otpCode" 
                required 
                maxlength="6"
                placeholder="123456" 
                class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-base font-mono tracking-widest text-center font-bold focus:ring-2 focus:ring-brand-500/50 focus:outline-none"
              >
            </div>

            <div class="flex space-x-2">
              <button 
                type="button" 
                (click)="otpStep.set(1)"
                class="w-1/3 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button 
                type="submit" 
                [disabled]="loading()"
                class="w-2/3 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span *ngIf="loading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Verify OTP & Login</span>
              </button>
            </div>
          </form>
        </div>

        <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <p class="text-xs text-slate-500">
            Don't have an organization account? 
            <a routerLink="/signup" class="font-bold text-brand-600 dark:text-brand-400 hover:underline">Register Organization</a>
          </p>
        </div>

      </div>
    </div>
  `
})
export class AuthLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<'ORG' | 'STAKEHOLDER'>('ORG');
  otpStep = signal<1 | 2>(1);
  orgOtpStep = signal<1 | 2>(1);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Org credentials
  orgEmail = '';
  orgPassword = '';
  orgOtpCode = '';

  // Stakeholder credentials
  generatedUserId = '';
  otpCode = '';

  onOrgLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.loginOrg({ email: this.orgEmail, password: this.orgPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.orgOtpStep.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password.');
      }
    });
  }

  verifyOrgLoginOtp() {
    if (!this.orgOtpCode.trim()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.verifyOrgLoginOtp(this.orgEmail.trim(), this.orgOtpCode.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/org/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired OTP code.');
      }
    });
  }

  sendStakeholderOtp() {
    if (!this.generatedUserId.trim()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.sendStakeholderOtp(this.generatedUserId.trim().toUpperCase()).subscribe({
      next: () => {
        this.loading.set(false);
        this.otpStep.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Stakeholder ID not found.');
      }
    });
  }

  verifyStakeholderOtp() {
    if (!this.otpCode.trim()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.verifyStakeholderOtp(this.generatedUserId.trim().toUpperCase(), this.otpCode.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/stakeholder/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired OTP code.');
      }
    });
  }
}
