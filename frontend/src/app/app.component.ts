import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from './core/services/auth.service';
import { AppLanguage, LanguageService } from './core/services/language.service';

const NAV_COPY = {
  sq: {
    home: 'Ballina',
    locations: 'Lokacionet',
    map: 'Harta',
    planner: 'Planifikuesi i Udhetimit',
    login: 'Hyrje',
    register: 'Regjistrohu',
    profile: 'Profili',
    settings: 'Cilesimet',
    logout: 'Dil',
    adminCrud: 'Admin CRUD'
  },
  en: {
    home: 'Home',
    locations: 'Locations',
    map: 'Map',
    planner: 'Trip Planner',
    login: 'Login',
    register: 'Register',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Log Out',
    adminCrud: 'Admin CRUD'
  }
} as const;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatToolbarModule],
  template: `
    <mat-toolbar class="app-toolbar">
      <a routerLink="/" class="brand-link">
        <img src="/heritage360-logo-SYMBOL.svg" alt="" class="brand-mark" />
        <span class="brand-text">
          <span class="brand-wordmark">Heritage360</span>
          <span class="brand-kicker">Kosovo</span>
        </span>
      </a>

      <span class="toolbar-spacer"></span>

      <span class="mobile-toolbar-lang">
        <ng-container [ngTemplateOutlet]="languagePicker"></ng-container>
      </span>

      <button type="button"
              class="mobile-menu-button"
              [class.open]="menuOpen()"
              (click)="toggleMenu()"
              [attr.aria-expanded]="menuOpen()"
              aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav class="desktop-nav" aria-label="Primary">
        <ng-container [ngTemplateOutlet]="navContent"></ng-container>
      </nav>
    </mat-toolbar>

    @if (menuOpen()) {
      <button type="button" class="mobile-menu-backdrop" aria-label="Close menu" (click)="closeMenu()"></button>
    }

    <nav class="mobile-menu-panel" [class.open]="menuOpen()" aria-label="Mobile primary">
      <div class="mobile-menu-header">
        <div>
          <span class="mobile-menu-kicker">Heritage360 · Kosovo</span>
          <strong>{{ displayName() }}</strong>
        </div>
      </div>
      <ng-container [ngTemplateOutlet]="mobileNavContent"></ng-container>
    </nav>

    <ng-template #navContent>
      @if (showAdmin()) {
        <a mat-button routerLink="/admin" routerLinkActive="active-nav" class="nav-link">{{ navCopy().adminCrud }}</a>
        <ng-container [ngTemplateOutlet]="languagePicker"></ng-container>
        <button mat-button type="button" (click)="logout()" class="nav-link muted">{{ navCopy().logout }}</button>
      } @else {
        <a mat-button routerLink="/" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact:true}" class="nav-link">{{ navCopy().home }}</a>
        <a mat-button routerLink="/locations" routerLinkActive="active-nav" class="nav-link">{{ navCopy().locations }}</a>
        <a mat-button routerLink="/map" routerLinkActive="active-nav" class="nav-link">{{ navCopy().map }}</a>
        <a mat-button routerLink="/planner" routerLinkActive="active-nav" class="nav-link">{{ navCopy().planner }}</a>

        @if (!isAuthenticated()) {
          <a mat-button routerLink="/login" routerLinkActive="active-nav" class="nav-link">{{ navCopy().login }}</a>
          <a mat-stroked-button routerLink="/register" class="register-link">{{ navCopy().register }}</a>
          <ng-container [ngTemplateOutlet]="languagePicker"></ng-container>
        } @else {
          <details class="user-menu" #userMenu>
            <summary class="user-menu-trigger">
              <span class="user-menu-name">{{ displayName() }}</span>
              <span class="user-menu-caret"></span>
            </summary>
            <div class="user-menu-panel">
              <a routerLink="/profile" class="user-menu-item" (click)="userMenu.open = false">{{ navCopy().profile }}</a>
              <a routerLink="/profile" [queryParams]="{ tab: 'settings' }" class="user-menu-item" (click)="userMenu.open = false">{{ navCopy().settings }}</a>
              <button type="button" class="user-menu-item button-item" (click)="userMenu.open = false; logout()">{{ navCopy().logout }}</button>
            </div>
          </details>
          <ng-container [ngTemplateOutlet]="languagePicker"></ng-container>
        }
      }
    </ng-template>

    <ng-template #mobileNavContent>
      @if (showAdmin()) {
        <a routerLink="/admin" routerLinkActive="active-nav" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().adminCrud }}</a>
        <button type="button" class="mobile-nav-link danger" (click)="logout()">{{ navCopy().logout }}</button>
      } @else {
        <a routerLink="/" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact:true}" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().home }}</a>
        <a routerLink="/locations" routerLinkActive="active-nav" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().locations }}</a>
        <a routerLink="/map" routerLinkActive="active-nav" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().map }}</a>
        <a routerLink="/planner" routerLinkActive="active-nav" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().planner }}</a>

        @if (!isAuthenticated()) {
          <a routerLink="/login" routerLinkActive="active-nav" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().login }}</a>
          <a routerLink="/register" class="mobile-nav-link primary" (click)="closeMenu()">{{ navCopy().register }}</a>
        } @else {
          <a routerLink="/profile" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().profile }}</a>
          <a routerLink="/profile" [queryParams]="{ tab: 'settings' }" class="mobile-nav-link" (click)="closeMenu()">{{ navCopy().settings }}</a>
          <button type="button" class="mobile-nav-link danger" (click)="logout()">{{ navCopy().logout }}</button>
        }
      }
    </ng-template>

    <ng-template #languagePicker>
      <label class="language-select-shell">
        <select [value]="language()" (change)="setLanguage($event)" aria-label="Language">
          <option value="sq">SQ</option>
          <option value="en">EN</option>
        </select>
      </label>
    </ng-template>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .app-toolbar {
      background: var(--alb-black);
      color: var(--alb-cream);
      position: sticky;
      top: 0;
      z-index: 1001;
      gap: 12px;
      min-height: 64px;
      padding: 8px clamp(16px, 4vw, 28px);
      border-bottom: 1px solid #2e2010;
      box-shadow: 0 8px 22px rgba(17, 17, 17, 0.18);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--alb-cream);
      text-decoration: none;
    }

    .brand-mark {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: block;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    .brand-wordmark {
      font-family: var(--font-brand);
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.02em;
      color: var(--alb-cream);
    }

    .brand-kicker {
      margin-top: 2px;
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--alb-tan);
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .nav-link {
      color: rgba(245, 237, 224, 0.72) !important;
      font-size: 13px;
      letter-spacing: 0.01em;
    }

    .nav-link.active-nav {
      color: var(--alb-cream) !important;
      font-weight: 600;
    }

    .nav-link.muted {
      color: rgba(245, 237, 224, 0.55) !important;
    }

    .register-link {
      color: var(--alb-cream) !important;
      border-color: rgba(245, 237, 224, 0.22) !important;
      font-size: 13px;
    }

    .language-select-shell {
      position: relative;
      width: 52px;
      height: 34px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .language-select-shell::after {
      content: '';
      position: absolute;
      right: 9px;
      top: 50%;
      width: 6px;
      height: 6px;
      border-right: 1px solid rgba(255, 255, 255, 0.68);
      border-bottom: 1px solid rgba(255, 255, 255, 0.68);
      transform: translateY(-65%) rotate(45deg);
      pointer-events: none;
    }

    .language-select-shell select {
      width: 100%;
      height: 100%;
      padding: 0 18px 0 10px;
      border: 0;
      outline: 0;
      appearance: none;
      background: transparent;
      color: var(--alb-cream);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      cursor: pointer;
    }

    .language-select-shell option {
      color: #111;
      background: #fff;
    }

    .mobile-menu-button {
      width: 42px;
      height: 42px;
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.08);
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
    }

    .mobile-menu-button span {
      width: 18px;
      height: 2px;
      border-radius: 2px;
      background: #fff;
      transition: transform 0.18s ease, opacity 0.18s ease;
    }

    .mobile-menu-button.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .mobile-menu-button.open span:nth-child(2) {
      opacity: 0;
    }

    .mobile-menu-button.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    .mobile-menu-backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
      border: 0;
      background: rgba(17, 17, 17, 0.42);
      cursor: pointer;
    }

    .mobile-menu-panel {
      position: fixed;
      top: 68px;
      left: 0;
      right: 0;
      z-index: 1000;
      display: none;
      padding: 16px;
      border-bottom: 1px solid rgba(17, 17, 17, 0.08);
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 20px 42px rgba(17, 17, 17, 0.18);
      transform: translateY(-10px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    .mobile-menu-panel.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .mobile-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 14px;
      background: #faf9f7;
    }

    .mobile-menu-header strong {
      display: block;
      margin-top: 2px;
      font-size: 15px;
      color: var(--alb-ink);
    }

    .mobile-menu-kicker {
      display: block;
      font-size: 11px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .mobile-menu-panel .language-select-shell {
      background: #111;
      flex: 0 0 auto;
    }

    .mobile-nav-link {
      width: 100%;
      min-height: 48px;
      border: 0;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 14px;
      background: transparent;
      color: var(--alb-ink);
      text-decoration: none;
      font: inherit;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      box-sizing: border-box;
    }

    .mobile-nav-link:hover,
    .mobile-nav-link.active-nav {
      background: var(--alb-red-muted);
      color: var(--alb-red) !important;
    }

    .mobile-nav-link.primary {
      background: #111;
      color: #fff;
      justify-content: center;
      margin-top: 8px;
    }

    .mobile-nav-link.danger {
      color: var(--alb-red);
    }

    .user-menu {
      position: relative;
    }

    .user-menu[open] .user-menu-caret {
      transform: rotate(225deg) translateY(-1px);
    }

    .user-menu summary {
      list-style: none;
    }

    .user-menu summary::-webkit-details-marker {
      display: none;
    }

    .user-menu-trigger {
      min-width: 0;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: #fff;
      cursor: pointer;
    }

    .user-menu-name {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px;
      font-weight: 600;
    }

    .user-menu-caret {
      width: 7px;
      height: 7px;
      border-right: 1px solid rgba(255, 255, 255, 0.7);
      border-bottom: 1px solid rgba(255, 255, 255, 0.7);
      transform: rotate(45deg) translateY(-1px);
      transition: transform 0.16s ease;
      flex: 0 0 auto;
    }

    .user-menu-panel {
      position: absolute;
      right: 0;
      top: calc(100% + 10px);
      min-width: 180px;
      padding: 8px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 14px 36px rgba(17, 17, 17, 0.16);
      display: grid;
      gap: 4px;
      z-index: 1000;
    }

    .user-menu-item {
      border: 0;
      border-radius: 8px;
      padding: 10px 12px;
      background: transparent;
      color: var(--alb-ink);
      text-align: left;
      text-decoration: none;
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }

    .user-menu-item:hover {
      background: #f6f2ed;
    }

    .button-item {
      width: 100%;
    }

    .mobile-toolbar-lang {
      display: none;
    }

    @media (max-width: 1023px) {
      .app-toolbar {
        min-height: 64px;
      }

      .desktop-nav {
        display: none;
      }

      .mobile-menu-button {
        display: inline-flex;
      }

      .mobile-menu-panel {
        display: block;
        top: 64px;
      }

      .brand-wordmark {
        font-size: 14px;
      }

      .mobile-toolbar-lang {
        display: inline-flex;
        align-items: center;
      }
    }
  `]
})
export class AppComponent {
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = this.authService.isAuthenticated;
  protected readonly showAdmin = computed(() => this.authService.isAdmin());
  protected readonly language = this.languageService.language;
  protected readonly navCopy = computed(() => NAV_COPY[this.language()]);
  protected readonly displayName = computed(() => this.authService.user()?.fullName || this.navCopy().profile);
  protected readonly menuOpen = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
      }
    });
  }

  protected logout() {
    this.closeMenu();
    this.authService.logout();
  }

  protected setLanguage(event: Event): void {
    this.languageService.setLanguage((event.target as HTMLSelectElement).value as AppLanguage);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
