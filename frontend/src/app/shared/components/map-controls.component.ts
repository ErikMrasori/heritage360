import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { Category, VisitProgress } from '../../core/models/app.models';
import { LanguageService } from '../../core/services/language.service';
import { FilterBarChange, FilterBarComponent } from './filter-bar.component';

const MAP_CONTROLS_COPY = {
  sq: { title: 'Filtra te hartes', shown: 'shfaqur', visited: 'te vizituara', placeholder: 'Gjej nje lokacion' },
  en: { title: 'Map filters', shown: 'shown', visited: 'visited', placeholder: 'Find a location' }
} as const;

@Component({
  selector: 'app-map-controls',
  standalone: true,
  imports: [CommonModule, FilterBarComponent],
  template: `
    <aside class="ui-map-controls">
      <div class="ui-map-controls-head">
        <strong>{{ copy().title }}</strong>
        <span>{{ visibleCount }} {{ copy().shown }}</span>
      </div>

      <app-filter-bar
        [categories]="categories"
        [search]="search"
        [categoryId]="categoryId"
        [compact]="true"
        [placeholder]="copy().placeholder"
        (filtersChange)="filtersChange.emit($event)">
      </app-filter-bar>

      @if (progress) {
        <div class="ui-map-progress">
          <span>{{ progress.totalVisited }} {{ copy().visited }}</span>
          @for (milestone of progress.milestones; track milestone.threshold) {
            <span [class.complete]="milestone.achieved">{{ milestone.threshold }}</span>
          }
        </div>
      }
    </aside>
  `
})
export class MapControlsComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly copy = computed(() => MAP_CONTROLS_COPY[this.languageService.language()]);

  @Input() categories: Category[] = [];
  @Input() search = '';
  @Input() categoryId: number | null = null;
  @Input() visibleCount = 0;
  @Input() progress: VisitProgress | null = null;
  @Output() filtersChange = new EventEmitter<FilterBarChange>();
}
