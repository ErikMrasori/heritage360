import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, Location } from '../../core/models/app.models';
import { CategoryService } from '../../core/services/category.service';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-locations-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="page-shell">
      <section class="page-header">
        <h1>Locations</h1>
        <p>Search and filter destinations across Kosovo by category and keyword.</p>
      </section>

      <section class="card-surface" style="padding: 20px;">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" placeholder="Search by title, city, or description" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedCategoryId">
              <mat-option [value]="null">All categories</mat-option>
              @for (category of categories(); track category.id) {
                <mat-option [value]="category.id">{{ category.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <button mat-flat-button color="primary" type="button" (click)="loadLocations()">Apply filters</button>
      </section>

      <div class="grid grid-3" style="margin-top: 24px;">
        @for (location of locations(); track location.id) {
          <mat-card class="card-surface">
            <mat-card-header>
              <mat-card-title>{{ location.title }}</mat-card-title>
              <mat-card-subtitle>{{ location.city }} • {{ location.categoryName }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ location.description }}</p>
              <p><strong>Address:</strong> {{ location.address }}</p>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button [routerLink]="['/locations', location.id]">Details</a>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `
})
export class LocationsListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected search = '';
  protected selectedCategoryId: number | null = null;

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((response) => this.categories.set(response.items));
    this.loadLocations();
  }

  protected loadLocations(): void {
    this.locationService
      .getAll({
        search: this.search,
        categoryId: this.selectedCategoryId
      })
      .subscribe((response) => this.locations.set(response.items));
  }
}
