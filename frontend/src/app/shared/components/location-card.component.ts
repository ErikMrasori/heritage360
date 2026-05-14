import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '../../core/models/app.models';
import { LanguageService } from '../../core/services/language.service';
import { locationCity, locationDescription, locationTitle } from '../../core/utils/localized-location';
import { resolveMediaUrl } from '../../core/utils/media-url';

const CARD_COPY = {
  sq: { viewDetails: 'Shiko detajet', visited: 'I vizituar' },
  en: { viewDetails: 'View details', visited: 'Visited' }
} as const;

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a [routerLink]="['/locations', location.id]" class="ui-location-card" [class.visited]="visited">
      <div class="ui-location-card-media">
        @if (thumbnail(); as thumb) {
          <img [src]="thumb" [alt]="title()" (error)="onImgError($event)" />
        } @else {
          <div class="ui-location-card-placeholder" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <path d="M16 3C10.477 3 6 7.477 6 13c0 7.5 10 17 10 17s10-9.5 10-17c0-5.523-4.477-10-10-10zm0 13a3 3 0 110-6 3 3 0 010 6z" fill="currentColor"/>
            </svg>
          </div>
        }
        @if (location.categoryName) {
          <span class="ui-location-card-cat" [class]="categoryClass()">{{ location.categoryName }}</span>
        }
        @if (visited) {
          <span class="ui-location-card-badge">{{ copy().visited }}</span>
        }
      </div>

      <div class="ui-location-card-body">
        <div class="ui-location-card-meta">{{ city() }} · {{ location.categoryName }}</div>
        <h3>{{ title() }}</h3>
        <p>{{ description() }}</p>
        <span class="ui-location-card-action">{{ copy().viewDetails }}</span>
      </div>
    </a>
  `,
  styles: [`
    .ui-location-card-cat + .ui-location-card-badge {
      top: 38px;
    }
  `]
})
export class LocationCardComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly copy = computed(() => CARD_COPY[this.languageService.language()]);

  @Input({ required: true }) location!: Location;
  @Input() visited = false;

  protected categoryClass(): string {
    const name = (this.location.categoryName || '').toLowerCase();
    if (name.includes('natur')) return 'cat-natural';
    if (name.includes('histor')) return 'cat-historical';
    if (name.includes('mus') || name.includes('muze')) return 'cat-museum';
    if (name.includes('cultur') || name.includes('kultur')) return 'cat-cultural';
    return '';
  }

  protected title(): string {
    return locationTitle(this.location, this.languageService.language());
  }

  protected description(): string {
    return locationDescription(this.location, this.languageService.language());
  }

  protected city(): string {
    return locationCity(this.location, this.languageService.language());
  }

  protected thumbnail(): string | null {
    return resolveMediaUrl(this.location.media?.find((media) => media.mediaType === 'image')?.mediaUrl);
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
}
