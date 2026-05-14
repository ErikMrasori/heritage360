import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../core/models/app.models';
import { LanguageService } from '../../core/services/language.service';

export interface FilterBarChange {
  search: string;
  categoryId: number | null;
}

const FILTER_COPY = {
  sq: { search: 'Kerko', category: 'Kategoria', all: 'Te gjitha kategorite', defaultPlaceholder: 'Kerko me emer ose qytet' },
  en: { search: 'Search', category: 'Category', all: 'All categories', defaultPlaceholder: 'Search by name or city' }
} as const;

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <section class="ui-filter-bar" [class.compact]="compact">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ copy().search }}</mat-label>
        <input matInput [(ngModel)]="searchValue" (ngModelChange)="emitChange()" [placeholder]="placeholder || copy().defaultPlaceholder" />
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ copy().category }}</mat-label>
        <mat-select [(ngModel)]="categoryValue" (ngModelChange)="emitChange()">
          <mat-option [value]="null">{{ copy().all }}</mat-option>
          @for (category of categories; track category.id) {
            <mat-option [value]="category.id">{{ category.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </section>
  `
})
export class FilterBarComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly copy = computed(() => FILTER_COPY[this.languageService.language()]);

  @Input() categories: Category[] = [];
  @Input() placeholder = '';
  @Input() compact = false;
  @Output() filtersChange = new EventEmitter<FilterBarChange>();

  searchValue = '';
  categoryValue: number | null = null;

  @Input()
  set search(value: string) {
    this.searchValue = value || '';
  }

  @Input()
  set categoryId(value: number | null) {
    this.categoryValue = value ?? null;
  }

  protected emitChange(): void {
    this.filtersChange.emit({
      search: this.searchValue,
      categoryId: this.categoryValue
    });
  }
}
