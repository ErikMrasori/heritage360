import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Category, Location } from '../../core/models/app.models';
import { CategoryService } from '../../core/services/category.service';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule],
  template: `
    <div class="page-shell">
      <section class="hero-panel">
        <h1>Discover Kosovo's cultural, historical, and natural heritage</h1>
        <p>
          Plan visits, explore destinations on the map, and manage verified cultural content through a secure admin workflow.
        </p>
        <div class="hero-actions">
          <a mat-flat-button color="accent" routerLink="/locations">Browse locations</a>
          <a mat-stroked-button routerLink="/map">Open map</a>
        </div>
      </section>

      <section class="page-header" style="margin-top: 28px;">
        <h2>Featured categories</h2>
        <p>Built for tourists, educators, students, and local explorers.</p>
      </section>
      <mat-chip-set class="chip-row">
        @for (category of categories(); track category.id) {
          <mat-chip>{{ category.name }}</mat-chip>
        }
      </mat-chip-set>

      <section class="page-header" style="margin-top: 28px;">
        <h2>Recently added destinations</h2>
        <p>Each location includes coordinates, descriptive content, and linked media.</p>
      </section>
      <div class="grid grid-3">
        @for (location of featuredLocations(); track location.id) {
          <mat-card class="card-surface">
            <mat-card-header>
              <mat-card-title>{{ location.title }}</mat-card-title>
              <mat-card-subtitle>{{ location.city }} • {{ location.categoryName }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>{{ location.description }}</p>
              <div class="chip-row">
                @for (media of location.media; track media.mediaUrl) {
                  <mat-chip>{{ media.mediaType }}</mat-chip>
                }
              </div>
            </mat-card-content>
            <mat-card-actions>
              <a mat-button [routerLink]="['/locations', location.id]">View details</a>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly featuredLocations = signal<Location[]>([]);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((response) => this.categories.set(response.items));
    this.locationService.getAll({ limit: 6 }).subscribe((response) => this.featuredLocations.set(response.items));
  }
}
