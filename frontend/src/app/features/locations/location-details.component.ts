import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { LocationService } from '../../core/services/location.service';
import {
  LeafletIcon,
  LeafletLayerGroup,
  LeafletMap,
  LeafletNamespace,
  MapsLoaderService
} from '../../core/services/maps-loader.service';
import { ReviewService } from '../../core/services/review.service';
import { VisitService } from '../../core/services/visit.service';
import { Location, Review } from '../../core/models/app.models';
import { SanitizeUrlPipe } from '../../shared/pipes/sanitize-url.pipe';
import { locationAddress, locationCity, locationDescription, locationTitle } from '../../core/utils/localized-location';
import { resolveMediaUrl } from '../../core/utils/media-url';

@Component({
  selector: 'app-location-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, RouterLink, SanitizeUrlPipe],
  styles: [`
    .detail-card { padding: 24px; }
    .visit-action { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
    .reviews-summary { display: flex; align-items: baseline; gap: 16px; margin-bottom: 16px; }
    .reviews-summary .avg { font-size: 2rem; font-weight: 600; color: #C8102E; }
    .reviews-summary .count { color: #6b6b6b; font-size: 0.95rem; }
    .review-stars { display: inline-flex; gap: 2px; align-items: center; }
    .review-stars svg { display: block; }
    .review-stars.lg svg { width: 22px; height: 22px; }
    .review-list { display: flex; flex-direction: column; gap: 14px; margin-bottom: 24px; }
    .review-item { padding: 16px 18px; }
    .review-item-head {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; margin-bottom: 8px; flex-wrap: wrap;
    }
    .review-author { font-weight: 600; }
    .review-date { color: #888; font-size: 0.85rem; }
    .review-body { white-space: pre-wrap; color: #2b2b2b; line-height: 1.5; margin: 0; }
    .review-form { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
    .review-form h3 { margin: 0; }
    .review-form .star-picker { display: inline-flex; gap: 4px; }
    .review-form .star-picker button {
      background: transparent; border: none; padding: 2px;
      cursor: pointer; line-height: 0; border-radius: 4px;
    }
    .review-form .star-picker button:focus-visible { outline: 2px solid #C8102E; }
    .review-form .star-picker svg { display: block; }
    .review-form textarea {
      width: 100%; min-height: 90px; padding: 10px 12px;
      border: 1px solid #d6d6d6; border-radius: 8px;
      font: inherit; resize: vertical;
    }
    .review-form textarea:focus { outline: 2px solid #C8102E; border-color: transparent; }
    .review-form-actions { display: flex; justify-content: flex-end; }
    .reviews-empty { color: #6b6b6b; font-style: italic; }
    .media-item img { cursor: zoom-in; }
    .lightbox-backdrop {
      position: fixed; inset: 0; z-index: 1200;
      background: rgba(0,0,0,0.92);
      display: flex; align-items: center; justify-content: center;
    }
    .lightbox-img {
      max-width: 90vw; max-height: 88vh;
      object-fit: contain; border-radius: 6px;
      user-select: none; display: block;
    }
    .lightbox-close {
      position: absolute; top: 16px; right: 20px;
      background: transparent; border: none;
      color: #fff; font-size: 2rem; line-height: 1;
      cursor: pointer; padding: 4px 10px; border-radius: 6px;
      z-index: 1201;
    }
    .lightbox-close:hover { background: rgba(255,255,255,0.12); }
    .lightbox-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(255,255,255,0.12); border: none;
      color: #fff; font-size: 2rem; line-height: 1;
      cursor: pointer; padding: 12px 16px; border-radius: 8px;
      z-index: 1201; transition: background 0.15s;
    }
    .lightbox-nav:hover { background: rgba(255,255,255,0.25); }
    .lightbox-nav:disabled { opacity: 0.2; cursor: default; }
    .lightbox-nav.prev { left: 16px; }
    .lightbox-nav.next { right: 16px; }
    .lightbox-counter {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
      color: rgba(255,255,255,0.7); font-size: 0.9rem;
    }
    .lightbox-caption {
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      color: #fff; font-size: 0.95rem; text-align: center;
      max-width: 80vw; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
  `],
  template: `
    <div class="page-shell">
      @if (loading()) {
        <div style="margin-bottom:24px;">
          <div class="skeleton skeleton-line" style="width:40%;height:16px;margin-bottom:12px;"></div>
          <div class="skeleton skeleton-line" style="width:65%;height:32px;margin-bottom:8px;"></div>
          <div class="skeleton skeleton-line short" style="height:14px;width:25%;"></div>
        </div>
        <div class="grid grid-2">
          <div class="skeleton-card" style="padding:20px;">
            <div class="skeleton skeleton-line" style="height:14px;margin-bottom:10px;"></div>
            <div class="skeleton skeleton-line" style="height:14px;margin-bottom:10px;width:80%;"></div>
            <div class="skeleton skeleton-line" style="height:14px;width:60%;"></div>
          </div>
          <div class="skeleton skeleton-thumb" style="border-radius:16px;height:280px;"></div>
        </div>
      }

      @if (!loading()) {
        @if (location(); as loc) {
          <div>
            <a routerLink="/locations" class="back-link">← Back to locations</a>
          </div>
          <section class="page-header">
            <h1>{{ title(loc) }}</h1>
            <p>
              <span class="accent-text">{{ loc.categoryName }}</span>
              &nbsp;&middot;&nbsp;{{ city(loc) }}
              @if (isVisited()) {
                &nbsp;&middot;&nbsp;<span class="accent-text">Visited</span>
              }
            </p>
          </section>

          <div class="grid grid-2 section-mb">
            <div class="card-surface detail-card" [class.visited]="isVisited()">
              <p class="detail-info">{{ description(loc) }}</p>

              <table class="detail-table">
                <tr>
                  <td class="td-label">Address</td>
                  <td>{{ address(loc) }}</td>
                </tr>
                <tr>
                  <td class="td-label">City</td>
                  <td>{{ city(loc) }}</td>
                </tr>
                <tr>
                  <td class="td-label">Coordinates</td>
                  <td class="td-mono">{{ loc.latitude }}, {{ loc.longitude }}</td>
                </tr>
              </table>

              <div class="visit-action">
                @if (authService.isAuthenticated()) {
                  @if (!isVisited()) {
                    <button mat-flat-button type="button" (click)="toggleVisited(loc.id)"
                            [disabled]="visitLoading()" class="visit-btn-primary">
                      {{ visitLoading() ? 'Saving...' : 'Mark as visited' }}
                    </button>
                  } @else {
                    <button mat-stroked-button type="button" (click)="toggleVisited(loc.id)"
                            [disabled]="visitLoading()" class="visit-btn-secondary">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="#C8102E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      {{ visitLoading() ? 'Saving...' : 'Unmark visited' }}
                    </button>
                  }
                }
                <button mat-stroked-button type="button" (click)="shareLocation(loc)"
                        class="visit-btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 0 6 3 3 0 0 0 2.83-2H18Z" fill="#C8102E"/>
                    <path d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#C8102E"/>
                    <path d="M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="#C8102E"/>
                    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="#C8102E" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                  Share
                </button>
              </div>
            </div>

            <div class="card-surface" style="overflow:hidden;min-height:280px;">
              <div class="osm-map-shell is-detail">
                @if (mapsReady() && !loading()) {
                  <div #mapContainer class="osm-map-canvas osm-map-canvas-detail"></div>
                } @else if (!mapError()) {
                  <div class="skeleton" style="height:280px;border-radius:16px;"></div>
                }
                @if (mapError()) {
                  <div class="map-error">{{ mapError() }}</div>
                }
              </div>
              <div class="map-selection-card">
                <div class="map-selection-copy">
                  <strong>Map view</strong>
                  <p>Coordinates: {{ loc.latitude }}, {{ loc.longitude }}</p>
                </div>
                <div class="map-selection-actions">
                  <button class="map-text-button" type="button" (click)="getDirections(loc)">Get directions</button>
                </div>
              </div>
            </div>
          </div>

          <section class="section-mb">
            <div class="section-accent"><h2>Media</h2></div>
            @if (loc.media.length) {
              <div class="media-grid">
                @for (m of loc.media; track m.mediaUrl; let i = $index) {
                  <div class="media-item">
                    @if (m.mediaType === 'image') {
                      <img [src]="getMediaUrl(m.mediaUrl)" [alt]="m.caption || title(loc)"
                           (error)="onImgError($event)"
                           (click)="openLightbox(loc.media, i)" />
                    } @else if (isYoutube(m.mediaUrl)) {
                      <iframe [src]="getYoutubeEmbed(m.mediaUrl) | sanitize" allowfullscreen></iframe>
                    } @else {
                      <video [src]="getMediaUrl(m.mediaUrl)" controls></video>
                    }
                    @if (m.caption) {
                      <div class="media-caption">{{ m.caption }}</div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="card-surface no-media-empty">
                No media has been added for this location yet.
              </div>
            }
          </section>

          @if (lightboxItems().length && lightboxIndex() >= 0) {
            <div class="lightbox-backdrop" (click)="closeLightbox()">
              <button class="lightbox-close" type="button" (click)="closeLightbox()">&#x2715;</button>
              <button class="lightbox-nav prev" type="button"
                      [disabled]="lightboxIndex() === 0"
                      (click)="$event.stopPropagation(); prevImage()">&#8249;</button>
              <img class="lightbox-img"
                   [src]="getMediaUrl(lightboxItems()[lightboxIndex()].mediaUrl)"
                   [alt]="lightboxItems()[lightboxIndex()].caption || ''"
                   (click)="$event.stopPropagation()" />
              <button class="lightbox-nav next" type="button"
                      [disabled]="lightboxIndex() === lightboxItems().length - 1"
                      (click)="$event.stopPropagation(); nextImage()">&#8250;</button>
              @if (lightboxItems()[lightboxIndex()].caption) {
                <div class="lightbox-caption">{{ lightboxItems()[lightboxIndex()].caption }}</div>
              }
              <div class="lightbox-counter">{{ lightboxIndex() + 1 }} / {{ lightboxItems().length }}</div>
            </div>
          }

          <section class="section-mb">
            <div class="section-accent"><h2>Reviews</h2></div>

            <div class="reviews-summary">
              <span class="avg">{{ reviewsLoaded() ? averageRating().toFixed(1) : '—' }}</span>
              <span class="review-stars lg" aria-hidden="true">
                @for (i of [1,2,3,4,5]; track i) {
                  @if (i <= roundedAverage()) {
                    <svg width="16" height="16" viewBox="0 0 18 18"><path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="#C8102E"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 18 18"><path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="none" stroke="#C8102E" stroke-width="1.5"/></svg>
                  }
                }
              </span>
              <span class="count">{{ totalReviews() }} {{ totalReviews() === 1 ? 'review' : 'reviews' }}</span>
            </div>

            @if (reviews().length) {
              <div class="review-list">
                @for (r of reviews(); track r.id) {
                  <div class="card-surface review-item">
                    <div class="review-item-head">
                      <span class="review-author">{{ r.userName }}</span>
                      <span class="review-stars" aria-label="Rating">
                        @for (i of [1,2,3,4,5]; track i) {
                          @if (i <= r.rating) {
                            <svg width="16" height="16" viewBox="0 0 18 18"><path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="#C8102E"/></svg>
                          } @else {
                            <svg width="16" height="16" viewBox="0 0 18 18"><path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="none" stroke="#C8102E" stroke-width="1.5"/></svg>
                          }
                        }
                      </span>
                      <span class="review-date">{{ r.createdAt | date:'mediumDate' }}</span>
                    </div>
                    @if (r.body) {
                      <p class="review-body">{{ r.body }}</p>
                    }
                  </div>
                }
              </div>
            } @else if (reviewsLoaded()) {
              <p class="reviews-empty">No reviews yet. Be the first to share your experience.</p>
            }

            @if (authService.isAuthenticated() && !hasUserReviewed()) {
              <div class="card-surface review-form">
                <h3>Leave a review</h3>
                <div class="star-picker" role="radiogroup" aria-label="Rating">
                  @for (i of [1,2,3,4,5]; track i) {
                    <button type="button"
                            role="radio"
                            [attr.aria-checked]="formRating() === i"
                            (click)="setFormRating(i)"
                            [attr.aria-label]="i + ' star' + (i === 1 ? '' : 's')">
                      @if (i <= formRating()) {
                        <svg width="16" height="16" viewBox="0 0 18 18"><path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="#C8102E"/></svg>
                      } @else {
                        <svg width="16" height="16" viewBox="0 0 18 18"><path d="M9 1.5L11 6.5H16.5L12 9.8L14 15L9 11.5L4 15L6 9.8L1.5 6.5H7L9 1.5Z" fill="none" stroke="#C8102E" stroke-width="1.5"/></svg>
                      }
                    </button>
                  }
                </div>
                <textarea [(ngModel)]="formBody" name="reviewBody" maxlength="2000"
                          placeholder="Share what made this place memorable..."></textarea>
                <div class="review-form-actions">
                  <button mat-flat-button type="button" class="visit-btn-primary"
                          [disabled]="!formRating() || reviewSubmitting()"
                          (click)="submitReview(loc.id)">
                    {{ reviewSubmitting() ? 'Submitting...' : 'Submit review' }}
                  </button>
                </div>
              </div>
            }
          </section>
        }

        @if (!location() && loadError()) {
          <div class="card-surface loc-error-box">
            <div class="loc-error-title">Location unavailable</div>
            <div class="muted-text">{{ loadError() }}</div>
          </div>
        }
      }
    </div>
  `
})
export class LocationDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly locationService = inject(LocationService);
  private readonly languageService = inject(LanguageService);
  private readonly visitService = inject(VisitService);
  private readonly mapsLoader = inject(MapsLoaderService);
  private readonly reviewService = inject(ReviewService);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private leaflet?: LeafletNamespace;
  private map?: LeafletMap;
  private markerLayer?: LeafletLayerGroup;
  private viewReady = false;

  protected readonly authService = inject(AuthService);
  protected readonly location = signal<Location | null>(null);
  protected readonly mapsReady = signal(false);
  protected readonly loading = signal(true);
  protected readonly visitLoading = signal(false);
  protected readonly mapError = signal('');
  protected readonly loadError = signal('');

  protected readonly reviews = signal<Review[]>([]);
  protected readonly totalReviews = signal(0);
  protected readonly averageRating = signal(0);
  protected readonly reviewsLoaded = signal(false);
  protected readonly reviewSubmitting = signal(false);
  protected readonly formRating = signal(0);
  protected formBody = '';
  protected readonly roundedAverage = computed(() => Math.round(this.averageRating()));

  protected readonly lightboxItems = signal<Location['media']>([]);
  protected readonly lightboxIndex = signal(-1);

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex() < 0) return;
    if (event.key === 'Escape') this.closeLightbox();
    else if (event.key === 'ArrowLeft') this.prevImage();
    else if (event.key === 'ArrowRight') this.nextImage();
  }

  protected openLightbox(media: Location['media'], startIndex: number): void {
    const images = media.filter(m => m.mediaType === 'image');
    const imageIndex = media.slice(0, startIndex + 1).filter(m => m.mediaType === 'image').length - 1;
    this.lightboxItems.set(images);
    this.lightboxIndex.set(imageIndex >= 0 ? imageIndex : 0);
  }

  protected closeLightbox(): void {
    this.lightboxIndex.set(-1);
    this.lightboxItems.set([]);
  }

  protected prevImage(): void {
    const i = this.lightboxIndex();
    if (i > 0) this.lightboxIndex.set(i - 1);
  }

  protected nextImage(): void {
    const i = this.lightboxIndex();
    if (i < this.lightboxItems().length - 1) this.lightboxIndex.set(i + 1);
  }

  protected readonly hasUserReviewed = computed(() => {
    const userId = this.authService.user()?.id;
    if (!userId) {
      return false;
    }
    return this.reviews().some((review) => review.userId === userId);
  });

  private locationId = 0;

  ngOnInit(): void {
    this.mapsLoader.load()
      .then((leaflet) => {
        this.leaflet = leaflet;
        this.mapsReady.set(true);
        window.setTimeout(() => this.syncMap(), 0);
      })
      .catch(() => {
        this.mapError.set('The map could not be loaded right now.');
      });

    this.locationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReviews();

    this.locationService.getById(this.locationId).subscribe({
      next: (location) => {
        this.location.set(location);
        this.loadError.set('');
        this.loading.set(false);
        window.setTimeout(() => this.syncMap(), 0);
      },
      error: (error) => {
        this.location.set(null);
        this.loadError.set(error?.error?.message || 'This location could not be loaded right now.');
        this.loading.set(false);
      }
    });

    const user = this.authService.user();
    if (user) {
      this.visitService.getVisited(user.id).subscribe();
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.syncMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  protected isVisited(): boolean {
    return this.visitService.visitedIds().has(this.locationId);
  }

  protected setFormRating(rating: number): void {
    this.formRating.set(rating);
  }

  protected submitReview(locationId: number): void {
    const rating = this.formRating();
    if (!rating || this.reviewSubmitting()) {
      return;
    }

    this.reviewSubmitting.set(true);
    this.reviewService.createReview(locationId, rating, this.formBody.trim()).subscribe({
      next: () => {
        this.reviewSubmitting.set(false);
        this.formRating.set(0);
        this.formBody = '';
        this.loadReviews();
        this.snackBar.open('Review submitted.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      },
      error: (error) => {
        this.reviewSubmitting.set(false);
        const message = error?.status === 409
          ? 'You have already reviewed this location.'
          : (error?.error?.message || 'Could not submit review right now.');
        this.snackBar.open(message, 'Close', {
          duration: 3500,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  private loadReviews(): void {
    this.reviewService.getReviews(this.locationId).subscribe({
      next: (response) => {
        this.reviews.set(response.items);
        this.totalReviews.set(response.total);
        this.averageRating.set(response.average);
        this.reviewsLoaded.set(true);
      },
      error: () => {
        this.reviews.set([]);
        this.totalReviews.set(0);
        this.averageRating.set(0);
        this.reviewsLoaded.set(true);
      }
    });
  }

  protected toggleVisited(locationId: number): void {
    this.visitLoading.set(true);
    const request = this.isVisited()
      ? this.visitService.delete(locationId)
      : this.visitService.create(locationId);

    request.subscribe({
      next: () => {
        this.visitLoading.set(false);
        this.snackBar.open(this.isVisited() ? 'Visit saved.' : 'Visit removed.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'bottom'
        });
      },
      error: () => this.visitLoading.set(false)
    });
  }

  protected async shareLocation(location: Location): Promise<void> {
    const url = window.location.href;
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };

    if (typeof nav.share === 'function') {
      try {
        await nav.share({ title: location.title, url });
      } catch {
        // User dismissed the share sheet — ignore.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      this.snackBar.open('Link copied to clipboard', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
    } catch {
      this.snackBar.open('Could not copy link.', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom'
      });
    }
  }

  protected getDirections(location: Location): void {
    if (!navigator.geolocation) {
      this.snackBar.open('Location access is not available in this browser.', 'Close', { duration: 3000 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const startLat = position.coords.latitude;
        const startLng = position.coords.longitude;
        const centerLat = (startLat + location.latitude) / 2;
        const centerLng = (startLng + location.longitude) / 2;
        const url = `https://map.project-osrm.org/?z=13&center=${centerLat},${centerLng}&loc=${startLat},${startLng}&loc=${location.latitude},${location.longitude}&hl=en&alt=0&srv=0`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      () => this.snackBar.open('Allow location access to get directions.', 'Close', { duration: 3000 }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  protected isYoutube(url: string): boolean {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  }

  protected getYoutubeEmbed(url: string): string {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  protected onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallbackApplied'] === 'true') {
      img.style.display = 'none';
      return;
    }

    img.dataset['fallbackApplied'] = 'true';
    img.src = '/placeholder-location.svg';
  }

  protected getMediaUrl(mediaUrl: string): string {
    return resolveMediaUrl(mediaUrl) ?? '/placeholder-location.svg';
  }

  protected title(location: Location): string {
    return locationTitle(location, this.languageService.language());
  }

  protected description(location: Location): string {
    return locationDescription(location, this.languageService.language());
  }

  protected city(location: Location): string {
    return locationCity(location, this.languageService.language());
  }

  protected address(location: Location): string {
    return locationAddress(location, this.languageService.language());
  }

  protected openStreetMapUrl(location: Location): string {
    return `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`;
  }

  private syncMap(): void {
    const location = this.location();
    if (!this.viewReady || !this.leaflet || !this.mapContainer || !location || this.mapError()) {
      return;
    }

    if (!this.map) {
      this.map = this.leaflet.map(this.mapContainer.nativeElement, { zoomControl: true });
      this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
      this.markerLayer = this.leaflet.layerGroup();
      this.markerLayer.addTo(this.map);
    }

    const markerLayer = this.markerLayer;
    if (!markerLayer) {
      return;
    }

    markerLayer.clearLayers();
    this.leaflet.marker([location.latitude, location.longitude], {
      icon: this.createPinIcon(location)
    }).addTo(markerLayer);

    this.map.setView([location.latitude, location.longitude], 14);
    window.setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private createPinIcon(location: Location): LeafletIcon {
    const title = this.escapeHtml(this.title(location));
    const thumbnail = this.getThumb(location);
    const image = thumbnail ? `<img class="map-pin-thumb" src="${this.escapeHtml(thumbnail)}" alt="">` : '';

    return this.leaflet!.divIcon({
      className: 'map-pin-wrapper',
      html: `<div class="custom-map-pin visited">${image}<span>${title}</span></div>`,
      iconSize: [170, 44],
      iconAnchor: [18, 42]
    });
  }

  private getThumb(location: Location): string | null {
    return resolveMediaUrl(location.media?.find((media) => media.mediaType === 'image')?.mediaUrl);
  }

  private escapeHtml(value: string): string {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return value.replace(/[&<>"']/g, (char) => entities[char]);
  }
}
