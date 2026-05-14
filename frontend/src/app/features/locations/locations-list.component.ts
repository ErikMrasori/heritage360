import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Category, Location } from '../../core/models/app.models';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { LanguageService } from '../../core/services/language.service';
import { LocationService } from '../../core/services/location.service';
import { VisitService } from '../../core/services/visit.service';
import { FilterBarChange, FilterBarComponent } from '../../shared/components/filter-bar.component';
import { LocationCardComponent } from '../../shared/components/location-card.component';

const PAGE_SIZE = 10;

const LOCATIONS_COPY = {
  sq: {
    title: 'Lokacionet',
    subtitle: 'Gjej landmarke, muze, vende natyrore dhe vende kulturore.',
    searchPlaceholder: 'Kerko destinacione',
    emptyTitle: 'Asnje lokacion i gjetur',
    emptyHint: 'Provo nje kerkim ose kategori tjeter.'
  },
  en: {
    title: 'Locations',
    subtitle: 'Find landmarks, museums, nature sites, and cultural places.',
    searchPlaceholder: 'Search destinations',
    emptyTitle: 'No locations found',
    emptyHint: 'Try a different search or category.'
  }
} as const;

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule, FilterBarComponent, LocationCardComponent],
  template: `
    <div class="page-shell">
      <section class="page-header">
        <h1>{{ copy().title }}</h1>
        <p>{{ copy().subtitle }}</p>
      </section>

      <app-filter-bar
        class="locs-filter"
        [categories]="categories()"
        [search]="search"
        [categoryId]="selectedCategoryId"
        [placeholder]="copy().searchPlaceholder"
        (filtersChange)="onFiltersChange($event)">
      </app-filter-bar>

      @if (loading()) {
        <div class="grid grid-3">
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
      }

      @if (!loading()) {
        @if (locations().length === 0) {
          <div class="locs-empty card-surface">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" opacity="0.3">
              <path d="M16 3C10.477 3 6 7.477 6 13c0 7.5 10 17 10 17s10-9.5 10-17c0-5.523-4.477-10-10-10zm0 13a3 3 0 110-6 3 3 0 010 6z" fill="#6b6560"/>
            </svg>
            <div>
              <strong>{{ copy().emptyTitle }}</strong>
              <p>{{ copy().emptyHint }}</p>
            </div>
          </div>
        } @else {
          <div class="grid grid-3">
            @for (loc of locations(); track loc.id) {
              <app-location-card [location]="loc" [visited]="isVisited(loc.id)"></app-location-card>
            }
          </div>

          @if (total() > pageSize()) {
            <mat-paginator
              [length]="total()"
              [pageSize]="pageSize()"
              [pageIndex]="currentPage()"
              [pageSizeOptions]="[10, 15, 20]"
              (page)="onPage($event)"
              class="locs-paginator">
            </mat-paginator>
          }
        }
      }
    </div>
  `,
  styles: [`
    .locs-paginator {
      margin-top: 24px;
      border-radius: 8px;
      border: 1px solid var(--line);
    }
  `]
})
export class LocationsListComponent implements OnInit, OnDestroy {
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly authService = inject(AuthService);
  private readonly languageService = inject(LanguageService);

  readonly visitService = inject(VisitService);

  protected readonly copy = computed(() => LOCATIONS_COPY[this.languageService.language()]);

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(true);
  protected readonly currentPage = signal(0);
  protected readonly skeletons = Array(10);
  protected readonly pageSize = signal(PAGE_SIZE);

  protected search = '';
  protected selectedCategoryId: number | null = null;

  private searchDebounce: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((response) => this.categories.set(response.items));
    const user = this.authService.user();
    if (user) {
      this.visitService.getVisited(user.id).subscribe();
    }
    this.loadLocations();
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounce);
  }

  protected onFiltersChange(filters: FilterBarChange): void {
    this.search = filters.search;
    this.selectedCategoryId = filters.categoryId;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage.set(0);
      this.loadLocations();
    }, 250);
  }

  protected onPage(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadLocations();
  }

  protected loadLocations(): void {
    this.loading.set(true);
    this.locationService.getAll({
      search: this.search,
      categoryId: this.selectedCategoryId,
      page: this.currentPage() + 1,
      limit: this.pageSize()
    }).subscribe({
      next: (response) => {
        this.locations.set(response.items);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  protected isVisited(id: number): boolean {
    return this.visitService.visitedIds().has(id);
  }
}
