import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category, Location } from '../../core/models/app.models';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { LanguageService } from '../../core/services/language.service';
import { LocationService } from '../../core/services/location.service';
import { SuggestionService } from '../../core/services/suggestion.service';
import { VisitService } from '../../core/services/visit.service';
import { LocationCardComponent } from '../../shared/components/location-card.component';

const HOME_COPY = {
  sq: {
    eyebrow: 'Kosova - Trashegimi dhe kulture',
    title: 'Zbulo trashegimine e Kosoves me nje harte te gjalle',
    description: 'Gjej monumente historike, muze, vende natyrore dhe destinacione kulturore me filtra te thjeshte, progres vizitash dhe udhezime per rruge.',
    browse: 'Shfleto lokacionet',
    openMap: 'Hape harten',
    categories: 'Eksploro sipas kategorise',
    all: 'Te gjitha',
    featured: 'Destinacione te vecuara',
    viewAll: 'Shiko te gjitha',
    categoriesStat: 'Kategori',
    locationsStat: 'Lokacione',
    visitedStat: 'Te vizituara',
    quickTitle: 'Planifiko me pak hapa',
    quickCopy: 'Filtro, ruaj vizitat dhe hap drejtimet nga vendndodhja jote drejt secilit lokacion.',
    stepOne: 'Zgjidh nje kategori',
    stepTwo: 'Hap lokacionin ne harte',
    stepThree: 'Sheno vendet e vizituara',
    suggestTitle: 'Sugjero nje landmark',
    suggestCopy: 'Na dergo nje vend qe mungon ne harte. Ekipi mund ta shqyrtoje dhe ta shtoje ne listen e lokacioneve.',
    fullName: 'Emri i plote',
    email: 'Email',
    landmarkName: 'Emri i landmark-ut',
    city: 'Qyteti',
    category: 'Kategoria',
    message: 'Pershkrimi',
    send: 'Dergo sugjerimin',
    sending: 'Duke derguar...',
    sent: 'Sugjerimi u dergua.',
    required: 'Ploteso fushat e kerkuara.',
    noResults: 'Nuk ka lokacione per kete kategori akoma.'
  },
  en: {
    eyebrow: 'Kosovo - Heritage and culture',
    title: 'Discover Kosovo heritage through a living map',
    description: 'Find historical monuments, museums, natural sites, and cultural destinations with simple filters, visit progress, and directions.',
    browse: 'Browse locations',
    openMap: 'Open map',
    categories: 'Explore by category',
    all: 'All',
    featured: 'Featured destinations',
    viewAll: 'View all',
    categoriesStat: 'Categories',
    locationsStat: 'Locations',
    visitedStat: 'Visited',
    quickTitle: 'Plan in a few steps',
    quickCopy: 'Filter places, save your visits, and open directions from your location to each landmark.',
    stepOne: 'Pick a category',
    stepTwo: 'Open it on the map',
    stepThree: 'Track visited places',
    suggestTitle: 'Suggest a landmark',
    suggestCopy: 'Send us a place missing from the map. The team can review it and add it to the location list.',
    fullName: 'Full name',
    email: 'Email',
    landmarkName: 'Landmark name',
    city: 'City',
    category: 'Category',
    message: 'Description',
    send: 'Send suggestion',
    sending: 'Sending...',
    sent: 'Suggestion sent.',
    required: 'Please complete the required fields.',
    noResults: 'No locations in this category yet.'
  }
} as const;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    LocationCardComponent
  ],
  template: `
    <section class="home-hero">
      <div class="home-hero-copy">
        <div class="hero-eyebrow">
          <span class="hero-eyebrow-dot"></span>
          {{ copy().eyebrow }}
        </div>
        <h1>{{ copy().title }}</h1>
        <p>{{ copy().description }}</p>

        <div class="home-hero-actions">
          <a mat-flat-button routerLink="/locations">{{ copy().browse }}</a>
          <a mat-stroked-button routerLink="/map">{{ copy().openMap }}</a>
        </div>

        <div class="home-stat-grid">
          <div><strong>{{ totalCategories() }}</strong><span>{{ copy().categoriesStat }}</span></div>
          <div><strong>{{ totalLocations() }}</strong><span>{{ copy().locationsStat }}</span></div>
          <div><strong>{{ visitService.visitedIds().size }}</strong><span>{{ copy().visitedStat }}</span></div>
        </div>
      </div>

      <aside class="hero-plan-card" aria-label="Plan steps">
        <div class="hero-plan-head">
          <span class="hero-plan-eyebrow">{{ copy().quickTitle }}</span>
          <p>{{ copy().quickCopy }}</p>
        </div>

        <ol class="hero-plan-track">
          <li class="hero-plan-step">
            <span class="hero-plan-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M6 12h12M10 18h4"/>
              </svg>
            </span>
            <div class="hero-plan-text">
              <strong>01 · {{ copy().stepOne }}</strong>
            </div>
          </li>
          <li class="hero-plan-step">
            <span class="hero-plan-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <div class="hero-plan-text">
              <strong>02 · {{ copy().stepTwo }}</strong>
            </div>
          </li>
          <li class="hero-plan-step">
            <span class="hero-plan-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </span>
            <div class="hero-plan-text">
              <strong>03 · {{ copy().stepThree }}</strong>
            </div>
          </li>
        </ol>
      </aside>
    </section>

    <div class="page-shell home-content">
      <section class="home-explore">
        <div class="home-section-header">
          <div class="section-accent"><h2>{{ copy().categories }}</h2></div>
          <a mat-button routerLink="/locations">{{ copy().viewAll }}</a>
        </div>
        <div class="chip-row" role="listbox" aria-label="Categories">
          <button type="button" class="cat-chip" [class.active]="!selectedCat()" (click)="selectCategory(null)">
            {{ copy().all }}
          </button>
          @for (c of categories(); track c.id) {
            <button type="button" class="cat-chip" [class.active]="selectedCat()===c.id" (click)="selectCategory(c.id)">
              {{ c.name }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="grid grid-3 home-explore-grid">
            @for (_ of skeletons; track $index) {
              <div class="skeleton-card">
                <div class="skeleton skeleton-thumb"></div>
                <div class="skeleton-body">
                  <div class="skeleton skeleton-line short"></div>
                  <div class="skeleton skeleton-line long"></div>
                  <div class="skeleton skeleton-line mid"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          @if (visibleLocations().length) {
            <div class="grid grid-3 home-explore-grid">
              @for (loc of visibleLocations(); track loc.id) {
                <app-location-card [location]="loc" [visited]="isVisited(loc.id)"></app-location-card>
              }
            </div>
          } @else {
            <div class="home-explore-empty card-surface">
              <p>{{ copy().noResults }}</p>
            </div>
          }
        }
      </section>

      <section class="suggestion-section">
        <div class="suggestion-copy">
          <div class="section-accent"><h2>{{ copy().suggestTitle }}</h2></div>
          <p>{{ copy().suggestCopy }}</p>
        </div>

        <form class="suggestion-form card-surface" [formGroup]="suggestionForm" (ngSubmit)="submitSuggestion()">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>{{ copy().fullName }}</mat-label>
              <input matInput formControlName="fullName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ copy().email }}</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ copy().landmarkName }}</mat-label>
              <input matInput formControlName="landmarkName" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>{{ copy().city }}</mat-label>
              <input matInput formControlName="city" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>{{ copy().category }}</mat-label>
            <mat-select formControlName="categoryId">
              <mat-option [value]="null">{{ copy().all }}</mat-option>
              @for (category of categories(); track category.id) {
                <mat-option [value]="category.id">{{ category.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ copy().message }}</mat-label>
            <textarea matInput rows="5" formControlName="message"></textarea>
          </mat-form-field>

          <div class="suggestion-actions">
            <button mat-flat-button type="submit" [disabled]="suggestionForm.invalid || sendingSuggestion()">
              {{ sendingSuggestion() ? copy().sending : copy().send }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .home-hero {
      max-width: 1240px;
      margin: 0 auto;
      padding: clamp(28px, 4vw, 52px) clamp(16px, 4vw, 28px) 32px;
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(300px, 380px);
      gap: clamp(20px, 4vw, 40px);
      align-items: start;
    }

    .hero-plan-card {
      margin-top: 38px;
    }

    @media (max-width: 1023px) {
      .hero-plan-card { margin-top: 0; }
    }

    .home-hero .hero-eyebrow {
      color: var(--alb-red);
    }

    .home-hero .hero-eyebrow-dot {
      background: var(--alb-red);
    }

    .home-hero-copy h1 {
      margin: 0 0 14px;
      max-width: 560px;
      font-size: clamp(2rem, 3.4vw, 2.8rem);
      line-height: 1.15;
      letter-spacing: -0.01em;
    }

    .home-hero-copy p,
    .home-guide-card p,
    .suggestion-copy p {
      margin: 0;
      color: var(--muted);
      line-height: 1.7;
    }

    .home-hero-copy p {
      max-width: 540px;
      font-size: 0.95rem;
    }

    .home-hero-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 22px;
    }

    .home-hero-actions a:first-child,
    .suggestion-actions button {
      background: var(--alb-red);
      color: #fff;
      border-radius: 8px;
      font-weight: 700;
    }

    .home-hero-actions a:last-child {
      border-radius: 8px;
      border-color: rgba(17,17,17,0.18);
      color: var(--alb-ink);
      font-weight: 700;
    }

    .home-stat-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0;
      max-width: 460px;
      margin-top: 28px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--surface-card);
      overflow: hidden;
    }

    .home-stat-grid div {
      padding: 14px 12px;
      text-align: center;
      border-right: 1px solid var(--line);
    }

    .home-stat-grid div:last-child { border-right: 0; }

    .home-stat-grid strong,
    .home-stat-grid span {
      display: block;
    }

    .home-stat-grid strong {
      font-size: 22px;
      color: var(--alb-red);
      font-weight: 700;
    }

    .home-stat-grid span {
      margin-top: 2px;
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .hero-plan-card {
      position: relative;
      padding: 26px 26px 28px;
      border-radius: 16px;
      background: linear-gradient(160deg, var(--alb-black) 0%, #2a1c10 100%);
      color: var(--alb-cream);
      box-shadow: 0 22px 50px rgba(26, 16, 8, 0.18);
      overflow: hidden;
    }

    .hero-plan-card::before {
      content: '';
      position: absolute;
      inset: -40% -10% auto auto;
      width: 220px;
      height: 220px;
      background: radial-gradient(circle, rgba(212, 168, 122, 0.18), transparent 65%);
      pointer-events: none;
    }

    .hero-plan-head {
      position: relative;
      margin-bottom: 22px;
    }

    .hero-plan-eyebrow {
      display: inline-block;
      font-family: var(--font-brand);
      font-size: 18px;
      font-weight: 700;
      color: var(--alb-cream);
      letter-spacing: 0.01em;
      margin-bottom: 6px;
    }

    .hero-plan-head p {
      margin: 0;
      font-size: 12.5px;
      line-height: 1.55;
      color: rgba(245, 237, 224, 0.66);
    }

    .hero-plan-track {
      position: relative;
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 14px;
    }

    .hero-plan-track::before {
      content: '';
      position: absolute;
      left: 19px;
      top: 18px;
      bottom: 18px;
      width: 2px;
      background: linear-gradient(to bottom,
        rgba(212, 168, 122, 0.55),
        rgba(212, 168, 122, 0.10));
      border-radius: 2px;
    }

    .hero-plan-step {
      position: relative;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 8px 4px;
    }

    .hero-plan-icon {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--alb-cream);
      color: var(--alb-red);
      display: grid;
      place-items: center;
      box-shadow: 0 0 0 4px rgba(245, 237, 224, 0.06);
    }

    .hero-plan-icon svg {
      width: 18px;
      height: 18px;
    }

    .hero-plan-text strong {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--alb-cream);
      letter-spacing: 0.02em;
    }

    .home-content {
      display: grid;
      gap: 32px;
    }

    .home-explore {
      display: block;
    }

    .home-explore-grid {
      gap: 16px;
      margin-top: 4px;
    }

    .home-explore-empty {
      padding: 28px;
      text-align: center;
      color: var(--muted);
      font-size: 14px;
    }

    .suggestion-form {
      padding: 22px;
    }

    .home-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .home-section-header .section-accent {
      margin-bottom: 0;
    }

    .home-section-header a {
      color: var(--alb-red);
      font-weight: 700;
    }

    .suggestion-section {
      padding: 24px 28px 28px;
      background: var(--surface-card);
      border: 1px solid var(--line);
      border-radius: 12px;
    }

    .suggestion-copy p {
      margin-top: 8px;
      max-width: 720px;
    }

    .suggestion-form {
      padding: 0;
      margin-top: 18px;
      background: transparent;
      border: 0;
      box-shadow: none;
      display: grid;
      gap: 12px;
    }

    .suggestion-form mat-form-field {
      width: 100%;
    }

    .suggestion-actions {
      display: flex;
      justify-content: flex-end;
    }

    .chip-row {
      margin-bottom: 18px;
    }

    @media (max-width: 1023px) {
      .home-hero {
        grid-template-columns: 1fr;
      }
      .hero-plan-card {
        padding: 22px;
      }
      .home-explore-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }

    @media (max-width: 767px) {
      .home-hero-actions {
        display: grid;
        grid-template-columns: 1fr;
      }
      .home-hero-actions .mat-mdc-button-base,
      .suggestion-actions button {
        width: 100%;
        min-height: 46px;
      }
      .home-explore-grid {
        grid-template-columns: 1fr !important;
      }
      .suggestion-section {
        padding: 20px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);
  private readonly suggestionService = inject(SuggestionService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly visitService = inject(VisitService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly loading = signal(true);
  protected readonly sendingSuggestion = signal(false);
  protected readonly totalLocations = signal(0);
  protected readonly selectedCat = signal<number | null>(null);
  protected readonly skeletons = Array(6);
  protected readonly totalCategories = computed(() => this.categories().length);
  protected readonly copy = computed(() => HOME_COPY[this.languageService.language()]);

  protected readonly suggestionForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email]],
    landmarkName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    categoryId: this.fb.control<number | null>(null),
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1200)]]
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((r) => this.categories.set(r.items));
    this.loadLocations();

    const user = this.authService.user();
    if (user) {
      this.visitService.getVisited(user.id).subscribe();
      this.suggestionForm.patchValue({
        fullName: user.fullName,
        email: user.email
      });
    }
  }

  protected selectCategory(id: number | null): void {
    this.selectedCat.set(id);
    this.loadLocations();
  }

  protected visibleLocations(): Location[] {
    return this.locations().slice(0, 3);
  }

  private loadLocations(): void {
    this.loading.set(true);
    this.locationService.getAll({ limit: 3, categoryId: this.selectedCat() }).subscribe({
      next: (r) => {
        this.locations.set(r.items);
        this.totalLocations.set(r.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected submitSuggestion(): void {
    if (this.suggestionForm.invalid) {
      this.suggestionForm.markAllAsTouched();
      this.snackBar.open(this.copy().required, 'Close', { duration: 2500 });
      return;
    }

    this.sendingSuggestion.set(true);
    this.suggestionService.create(this.suggestionForm.getRawValue()).subscribe({
      next: () => {
        const { fullName, email } = this.suggestionForm.getRawValue();
        this.sendingSuggestion.set(false);
        this.suggestionForm.reset({
          fullName,
          email,
          landmarkName: '',
          city: '',
          categoryId: null,
          message: ''
        });
        this.snackBar.open(this.copy().sent, 'Close', { duration: 3000 });
      },
      error: () => this.sendingSuggestion.set(false)
    });
  }

  protected isVisited(id: number): boolean {
    return this.visitService.visitedIds().has(id);
  }
}
