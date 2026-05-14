import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="auth-shell">
      <div class="auth-card card-surface"
           [style.max-width.px]="showSuccess() ? 420 : null"
           [style.margin]="showSuccess() ? '0 auto' : null"
           [style.padding.px]="showSuccess() ? 40 : null"
           [style.text-align]="showSuccess() ? 'center' : null">
        @if (!showSuccess()) {
          <div class="auth-brand">
            <span class="auth-brand-mark"
                  style="width:32px;height:32px;border-radius:7px;background:#C8102E;">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="white"/>
              </svg>
            </span>
            <span class="auth-brand-name" style="font-weight:700;">Heritage<span style="color:#C8102E;">360</span></span>
          </div>
        }

        @if (!showSuccess()) {
          <div class="auth-head">
            <h1>Create an account</h1>
            <p>Join to track your visits and explore Kosovo's cultural heritage.</p>
          </div>

          @if (error()) {
            <div class="auth-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px;">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4v4m0 2v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ error() }}
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">
            <mat-form-field appearance="outline">
              <mat-label>Full name</mat-label>
              <input matInput formControlName="fullName" autocomplete="name" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <mat-hint>At least 8 characters</mat-hint>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
            </mat-form-field>

            <button mat-flat-button type="submit" class="auth-submit" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Creating account…' : 'Create account' }}
            </button>
          </form>

          <div class="auth-divider">or</div>

          <p class="auth-alt-link">
            Already have an account?&nbsp;<a routerLink="/login">Sign in</a>
          </p>
        } @else {
          <div style="padding:8px 0 0;">
            <img src="/heritage360-logo-SYMBOL.svg" alt="Heritage360"
                 style="width:64px;height:64px;display:block;margin:0 auto 18px;" />
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style="margin:0 auto 16px;display:block;">
              <circle cx="24" cy="24" r="22" stroke="#22c55e" stroke-width="3" fill="none"/>
              <path d="M14 24l7 7 13-13" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:var(--alb-ink, #111827);">Check your inbox</h2>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              We sent a verification link to <strong>{{ registeredEmail() }}</strong>. Click it to activate your account.
            </p>
            <button mat-stroked-button (click)="resend()" [disabled]="resendLoading()"
                    style="color:#C8102E;border-color:#C8102E;">
              {{ resendLoading() ? 'Sending…' : 'Resend email' }}
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly showSuccess = signal(false);
  protected readonly registeredEmail = signal('');
  protected readonly resendLoading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.registeredEmail.set(this.form.getRawValue().email);
        this.showSuccess.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  protected resend(): void {
    this.resendLoading.set(true);
    this.authService.resendVerification(this.registeredEmail()).subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.snackBar.open('Verification email resent!', 'Dismiss', { duration: 4000 });
      },
      error: (err) => {
        this.resendLoading.set(false);
        const message = err?.error?.message || 'Failed to resend. Please try again.';
        this.snackBar.open(message, 'Dismiss', { duration: 6000 });
      }
    });
  }
}
