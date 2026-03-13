import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatToolbarModule],
  template: `
    <mat-toolbar color="primary">
      <span>Kosovo Tourism & Cultural Platform</span>
      <span class="toolbar-spacer"></span>
      <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">Home</a>
      <a mat-button routerLink="/locations" routerLinkActive="active-link">Locations</a>
      <a mat-button routerLink="/map" routerLinkActive="active-link">Map</a>
      @if (showAdmin()) {
        <a mat-button routerLink="/admin" routerLinkActive="active-link">Admin</a>
      }
      @if (!isAuthenticated()) {
        <a mat-button routerLink="/login" routerLinkActive="active-link">Login</a>
        <a mat-stroked-button routerLink="/register">Register</a>
      } @else {
        <button mat-button type="button" (click)="logout()">Logout</button>
      }
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .active-link {
      font-weight: 700;
    }
  `]
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly showAdmin = computed(() => this.authService.isAdmin());

  protected logout() {
    this.authService.logout();
  }
}
