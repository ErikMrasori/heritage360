import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '../../core/models/app.models';
import { LanguageService } from '../../core/services/language.service';
import { locationCity, locationTitle } from '../../core/utils/localized-location';

const POPUP_COPY = {
  sq: {
    visited: 'I vizituar',
    directions: 'Merr drejtimet',
    mark: 'Sheno si te vizituar',
    unmark: 'Hiq shenimin',
    details: 'Detajet',
    empty: 'Zgjidh nje shenjues per te pare veprimet.'
  },
  en: {
    visited: 'Visited',
    directions: 'Get directions',
    mark: 'Mark visited',
    unmark: 'Unmark visited',
    details: 'Details',
    empty: 'Select a marker to see actions.'
  }
} as const;

@Component({
  selector: 'app-marker-popup',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <section class="ui-marker-popup" [class.empty]="!location">
      @if (location; as loc) {
        <div class="ui-marker-popup-copy">
          <span>{{ city(loc) }} · {{ loc.categoryName }}</span>
          <strong>{{ title(loc) }}</strong>
          @if (visited) {
            <small>{{ copy().visited }}</small>
          }
        </div>

        <div class="ui-marker-popup-actions">
          <button mat-flat-button type="button" class="primary-action" (click)="directions.emit(loc)">
            {{ copy().directions }}
          </button>
          @if (authenticated) {
            <button mat-stroked-button type="button" (click)="toggleVisited.emit(loc)" [disabled]="loading">
              {{ visited ? copy().unmark : copy().mark }}
            </button>
          }
          <button mat-button type="button" (click)="details.emit(loc.id)">{{ copy().details }}</button>
        </div>
      } @else {
        <p>{{ copy().empty }}</p>
      }
    </section>
  `
})
export class MarkerPopupComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly copy = computed(() => POPUP_COPY[this.languageService.language()]);

  @Input() location: Location | null = null;
  @Input() visited = false;
  @Input() authenticated = false;
  @Input() loading = false;
  @Output() details = new EventEmitter<number>();
  @Output() directions = new EventEmitter<Location>();
  @Output() toggleVisited = new EventEmitter<Location>();

  protected title(location: Location): string {
    return locationTitle(location, this.languageService.language());
  }

  protected city(location: Location): string {
    return locationCity(location, this.languageService.language());
  }
}
