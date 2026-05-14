import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  template: `
    <div class="auth-shell">
      <div class="auth-card card-surface">
        <div class="auth-brand">
          <span class="auth-brand-mark"
                style="width:32px;height:32px;border-radius:7px;background:#C8102E;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="white"/>
            </svg>
          </span>
          <span class="auth-brand-name" style="font-weight:700;">Heritage<span style="color:#C8102E;">360</span></span>
        </div>

        <div class="auth-head">
          <h1>Welcome back</h1>
          <p>Sign in to track your visits and explore Kosovo's heritage.</p>
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
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="current-password" />
          </mat-form-field>

          <button mat-flat-button type="submit" class="auth-submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="auth-divider">or</div>

        <p class="auth-alt-link">
          New to Heritage360?&nbsp;<a routerLink="/register">Create an account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['verified'] === 'true') {
      this.snackBar.open('Email verified! You can now log in.', 'Dismiss', { duration: 4000 });
    }
  }

  protected submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 403) {
          this.snackBar.open('Please verify your email before logging in.', 'Dismiss', { duration: 4000 });
          return;
        }
        this.error.set(err?.error?.message || 'Invalid email or password.');
      }
    });
  }
}
