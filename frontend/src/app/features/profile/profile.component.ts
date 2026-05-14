import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { VisitService } from '../../core/services/visit.service';
import { VisitRecord } from '../../core/models/app.models';

type ProfileTab = 'overview' | 'settings';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page-shell profile-shell">
      <section class="profile-header card-surface">
        <div class="profile-header-main">
          <div class="profile-avatar">{{ initials() }}</div>
          <div>
            <div class="profile-kicker">Account</div>
            <h1>{{ user()?.fullName }}</h1>
            <p>{{ user()?.email }}</p>
            @if (user()?.bio) {
              <div class="profile-bio">{{ user()?.bio }}</div>
            }
          </div>
        </div>
        <div class="profile-tabs">
          <button type="button" class="profile-tab" [class.active]="activeTab() === 'overview'" (click)="openTab('overview')">Overview</button>
          <button type="button" class="profile-tab" [class.active]="activeTab() === 'settings'" (click)="openTab('settings')">Settings</button>
        </div>
      </section>

      @if (activeTab() === 'overview') {
        <section class="profile-overview">
          <div class="profile-actions">
            <a mat-stroked-button routerLink="/locations">Browse locations</a>
            <a mat-stroked-button routerLink="/map">Open map</a>
          </div>

          <div class="profile-stats">
            <div class="profile-stat card-surface">
              <div class="profile-stat-value">{{ visits().length }}</div>
              <div class="profile-stat-label">Places visited</div>
            </div>
            <div class="profile-stat card-surface">
              <div class="profile-stat-value">{{ uniqueCities() }}</div>
              <div class="profile-stat-label">Cities explored</div>
            </div>
            <div class="profile-stat card-surface">
              <div class="profile-stat-value">{{ uniqueCategories() }}</div>
              <div class="profile-stat-label">Categories</div>
            </div>
          </div>

          <div class="profile-milestones card-surface">
            <div class="profile-milestones-row">
              @for (milestone of visitService.progress().milestones; track milestone.threshold) {
                <div class="profile-milestone" [class.complete]="milestone.achieved">
                  <div class="profile-milestone-icon">
                    @if (milestone.achieved) {
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    } @else {
                      {{ milestone.threshold }}
                    }
                  </div>
                  <span class="profile-milestone-label">
                    {{ milestone.achieved ? 'Reached' : milestone.remaining + ' to go' }}
                  </span>
                </div>
              }
            </div>

            @let progress = visitService.progress();
            <div class="profile-progress">
              <div class="profile-progress-track"
                   role="progressbar"
                   [attr.aria-valuenow]="progressPercent()"
                   aria-valuemin="0"
                   aria-valuemax="100">
                <div class="profile-progress-fill" [style.width.%]="progressPercent()"></div>
              </div>
              <div class="profile-progress-meta">
                <span>{{ progress.totalVisited }} visited</span>
                @if (progress.nextMilestone !== null && progress.nextMilestone > progress.totalVisited) {
                  <span>{{ progress.nextMilestone - progress.totalVisited }} to {{ progress.nextMilestone }}</span>
                } @else {
                  <span>All milestones reached</span>
                }
              </div>
            </div>
          </div>

          <div class="section-accent"><h2>Visit history</h2></div>

          @if (loadingVisits()) {
            <div class="profile-visit-list">
              @for (_ of skeletons; track $index) {
                <div class="skeleton-card profile-visit-card">
                  <div class="skeleton profile-visit-icon"></div>
                  <div style="flex:1;">
                    <div class="skeleton skeleton-line" style="height:13px;width:40%;margin-bottom:8px;"></div>
                    <div class="skeleton skeleton-line" style="height:11px;width:60%;"></div>
                  </div>
                </div>
              }
            </div>
          }

          @if (!loadingVisits() && visits().length === 0) {
            <div class="profile-empty card-surface">
              <p>You haven't visited any locations yet.</p>
              <a mat-flat-button routerLink="/locations" class="start-exploring-btn">Start exploring</a>
            </div>
          }

          @if (!loadingVisits() && visits().length > 0) {
            <div class="profile-visit-list">
              @for (v of visits(); track v.id) {
                <a [routerLink]="['/locations', v.location_id]" class="profile-visit-link">
                  <div class="visit-card profile-visit-card">
                    <div class="visit-card-icon">+</div>
                    <div style="flex:1;min-width:0;">
                      <div class="profile-visit-title">{{ v.title }}</div>
                      <div class="visit-meta">{{ v.city }} · {{ v.category_name }} · {{ v.visited_at | date:'d MMM y' }}</div>
                    </div>
                    <div class="profile-visit-arrow">View</div>
                  </div>
                </a>
              }
            </div>
          }
        </section>
      }

      @if (activeTab() === 'settings') {
        <section class="profile-settings-grid">
          <div class="card-surface settings-card">
            <div class="section-accent"><h2>Profile settings</h2></div>
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid">
              <mat-form-field appearance="outline">
                <mat-label>Full name</mat-label>
                <input matInput formControlName="fullName" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" readonly />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Bio</mat-label>
                <textarea matInput rows="6" formControlName="bio"></textarea>
              </mat-form-field>

              <div class="settings-actions">
                <button mat-flat-button type="submit" [disabled]="profileForm.invalid || savingProfile()" class="visit-btn-primary">
                  {{ savingProfile() ? 'Saving...' : 'Save profile' }}
                </button>
              </div>
            </form>
          </div>

          <div class="card-surface settings-card">
            <div class="section-accent"><h2>Password</h2></div>
            <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="grid">
              <mat-form-field appearance="outline">
                <mat-label>Current password</mat-label>
                <input matInput type="password" formControlName="currentPassword" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>New password</mat-label>
                <input matInput type="password" formControlName="newPassword" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirm new password</mat-label>
                <input matInput type="password" formControlName="confirmPassword" />
              </mat-form-field>

              <div class="password-hint">Use your current password first, then choose a new one with at least 8 characters.</div>

              <div class="settings-actions">
                <button mat-flat-button type="submit" [disabled]="passwordForm.invalid || savingPassword()" class="change-pwd-btn">
                  {{ savingPassword() ? 'Updating...' : 'Change password' }}
                </button>
              </div>
            </form>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .profile-shell {
      display: grid;
      gap: 24px;
    }

    .profile-header {
      padding: 28px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
    }

    .profile-header-main {
      display: flex;
      align-items: flex-start;
      gap: 18px;
      flex-wrap: wrap;
    }

    .profile-avatar {
      width: 68px;
      height: 68px;
      border-radius: 18px;
      background: #111;
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 24px;
      font-weight: 700;
      flex: 0 0 auto;
    }

    .profile-kicker {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      margin-bottom: 10px;
      font-weight: 700;
    }

    .profile-header h1 {
      margin: 0 0 6px;
      font-size: clamp(1.8rem, 3vw, 2.6rem);
    }

    .profile-header p,
    .profile-bio,
    .password-hint {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
    }

    .profile-bio {
      margin-top: 10px;
      max-width: 640px;
    }

    .profile-tabs {
      display: inline-flex;
      gap: 6px;
      padding: 6px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: #f6f2ed;
    }

    .profile-tab {
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: transparent;
      color: var(--muted);
      font: inherit;
      font-size: 13px;
      font-weight: 650;
      cursor: pointer;
    }

    .profile-tab.active {
      background: #111;
      color: #fff;
    }

    .profile-overview {
      display: grid;
      gap: 24px;
    }

    .profile-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .profile-milestones {
      display: grid;
      gap: 16px;
      padding: 20px 22px;
    }

    .profile-milestones-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .profile-milestone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 14px 10px;
      border-radius: 12px;
      background: #faf9f7;
      text-align: center;
      transition: background 0.18s ease;
    }

    .profile-milestone.complete {
      background: rgba(107, 45, 26, 0.08);
      color: var(--alb-red);
    }

    .profile-milestone-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      letter-spacing: 0.02em;
    }

    .profile-milestone.complete .profile-milestone-label {
      color: var(--alb-red);
    }

    .profile-progress {
      display: grid;
      gap: 8px;
    }

    .profile-progress-track {
      height: 8px;
      border-radius: 999px;
      background: var(--line);
      overflow: hidden;
    }

    .profile-progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, var(--alb-red-soft), var(--alb-red));
      transition: width 0.4s ease;
    }

    .profile-progress-meta {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
    }

    .profile-stat {
      padding: 20px;
    }

    .profile-stat-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--alb-red);
    }

    .profile-stat-label {
      font-size: 12px;
      color: var(--muted);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .profile-visit-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .profile-visit-link {
      text-decoration: none;
    }

    .profile-visit-card {
      align-items: center;
      transition: border-color 0.15s ease;
    }

    .profile-visit-card:hover {
      border-color: var(--alb-red);
    }

    .profile-visit-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      flex: 0 0 auto;
    }

    .profile-visit-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--alb-ink);
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-visit-arrow {
      font-size: 12px;
      color: var(--alb-red);
      flex-shrink: 0;
    }

    .profile-empty {
      padding: 40px 24px;
      text-align: center;
    }

    .profile-settings-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 20px;
    }

    .settings-card {
      padding: 24px;
    }

    .settings-card mat-form-field {
      width: 100%;
    }

    .settings-actions {
      display: flex;
      justify-content: flex-end;
    }

    .change-pwd-btn {
      background: #111 !important;
      color: #fff !important;
      border-radius: 8px !important;
    }

    @media (max-width: 1023px) {
      .profile-stats,
      .profile-milestones-row,
      .profile-settings-grid {
        grid-template-columns: 1fr;
      }

      .profile-actions {
        justify-content: flex-start;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  protected readonly visitService = inject(VisitService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly user = this.authService.user;
  protected readonly visits = signal<VisitRecord[]>([]);
  protected readonly loadingVisits = signal(true);
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly activeTab = signal<ProfileTab>('overview');
  protected readonly skeletons = Array(5);
  protected readonly initials = computed(() => {
    return (this.user()?.fullName ?? 'U')
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  protected readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
    bio: ['', [Validators.maxLength(600)]]
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.activeTab.set(params.get('tab') === 'settings' ? 'settings' : 'overview');
    });

    this.authService.getCurrentUser().subscribe({
      next: ({ user }) => this.patchProfileForm(user),
      error: () => this.patchProfileForm(this.user())
    });

    this.patchProfileForm(this.user());
    this.loadVisits();
  }

  protected openTab(tab: ProfileTab): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'settings' ? 'settings' : null },
      queryParamsHandling: 'merge'
    });
  }

  protected uniqueCities(): number {
    return new Set(this.visits().map((visit) => visit.city)).size;
  }

  protected progressPercent(): number {
    const progress = this.visitService.progress();
    if (!progress.nextMilestone) return 100;
    return Math.min(100, Math.round((progress.totalVisited / progress.nextMilestone) * 100));
  }

  protected uniqueCategories(): number {
    return new Set(this.visits().map((visit) => visit.category_name)).size;
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.savingProfile.set(true);
    this.authService.updateProfile({
      fullName: this.profileForm.getRawValue().fullName,
      bio: this.profileForm.getRawValue().bio
    }).subscribe({
      next: ({ user }) => {
        this.savingProfile.set(false);
        this.patchProfileForm(user);
        this.snackBar.open('Profile updated.', 'Close', { duration: 2500 });
      },
      error: () => this.savingProfile.set(false)
    });
  }

  protected savePassword(): void {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.snackBar.open('New password confirmation does not match.', 'Dismiss', { duration: 3000 });
      return;
    }

    this.savingPassword.set(true);
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        this.snackBar.open('Password updated.', 'Close', { duration: 2500 });
      },
      error: () => this.savingPassword.set(false)
    });
  }

  private loadVisits(): void {
    const currentUser = this.user();
    if (!currentUser) return;

    this.visitService.getVisited(currentUser.id).subscribe({
      next: (response) => {
        this.visits.set(response.items);
        this.loadingVisits.set(false);
      },
      error: () => this.loadingVisits.set(false)
    });
  }

  private patchProfileForm(user: { fullName: string; email: string; bio: string } | null | undefined): void {
    if (!user) return;

    this.profileForm.reset({
      fullName: user.fullName || '',
      email: user.email || '',
      bio: user.bio || ''
    });
  }
}
