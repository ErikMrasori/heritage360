import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/app.models';

const TOKEN_KEY = 'ktcp_token';
const USER_KEY = 'ktcp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userSignal = signal<User | null>(this.restoreUser());

  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());
  readonly isAdmin = computed(() => this.userSignal()?.role === 'admin');

  register(payload: { fullName: string; email: string; password: string }) {
    return this.http.post<AuthResponse | { message: string }>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((response) => {
        if ('token' in response) {
          this.setSession(response);
        }
      })
    );
  }

  resendVerification(email: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, { email });
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((response) => this.setSession(response))
    );
  }

  getCurrentUser() {
    return this.http.get<{ user: User }>(`${environment.apiUrl}/auth/me`).pipe(
      tap((response) => this.persistUser(response.user))
    );
  }

  updateProfile(payload: { fullName: string; bio: string }) {
    return this.http.patch<{ user: User }>(`${environment.apiUrl}/auth/me`, payload).pipe(
      tap((response) => this.persistUser(response.user))
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return this.http.patch<{ message: string }>(`${environment.apiUrl}/auth/password`, payload);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(response: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, response.token);
    this.persistUser(response.user);
  }

  private persistUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private restoreUser(): User | null {
    const rawUser = localStorage.getItem(USER_KEY);
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
