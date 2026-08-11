import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './auth-login.component.html',
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
      },
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
      },
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
      },
    });
  }

  verifyStakeholderOtp() {
    if (!this.otpCode.trim()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth
      .verifyStakeholderOtp(this.generatedUserId.trim().toUpperCase(), this.otpCode.trim())
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.router.navigate(['/stakeholder/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Invalid or expired OTP code.');
        },
      });
  }
}
