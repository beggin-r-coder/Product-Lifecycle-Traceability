import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './auth-signup.component.html',
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
    companyRegistrationNumber: '',
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
      },
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
      },
    });
  }
}
