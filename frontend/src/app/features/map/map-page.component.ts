import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, Location } from '../../core/models/app.models';
import { CategoryService } from '../../core/services/category.service';
import { LocationService } from '../../core/services/location.service';
import { MapsLoaderService } from '../../core/services/maps-loader.service';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMapsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="page-shell">
      <section class="page-header">
        <h1>Interactive map</h1>
        <p>Explore location markers across Kosovo and filter the map by category and keyword.</p>
      </section>

      <section class="card-surface" style="padding: 20px;">
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="search" placeholder="Search by title or city" />
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
      </section>

      <mat-card class="card-surface" style="margin-top: 24px;">
        <mat-card-content class="map-wrapper">
          @if (mapsReady()) {
            <google-map width="100%" height="520px" [center]="center" [zoom]="8">
              @for (location of filteredLocations(); track location.id) {
                <map-marker
                  #marker="mapMarker"
                  [position]="{ lat: location.latitude, lng: location.longitude }"
                  [title]="location.title"
                  (mapClick)="openInfo(marker, location)">
                </map-marker>
              }

              <map-info-window>
                @if (selectedLocation(); as currentLocation) {
                  <strong>{{ currentLocation.title }}</strong>
                  <p>{{ currentLocation.city }}</p>
                  <p>{{ currentLocation.categoryName }}</p>
                }
              </map-info-window>
            </google-map>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class MapPageComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly mapsLoader = inject(MapsLoaderService);
  @ViewChild(MapInfoWindow) private infoWindow?: MapInfoWindow;

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly selectedLocation = signal<Location | null>(null);
  protected readonly mapsReady = signal(false);
  protected search = '';
  protected selectedCategoryId: number | null = null;
  protected readonly center = { lat: 42.6026, lng: 20.903 };

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((response) => this.categories.set(response.items));
    this.locationService.getAll({ limit: 100 }).subscribe((response) => this.locations.set(response.items));
    this.mapsLoader.load().then(() => this.mapsReady.set(true));
  }

  protected filteredLocations(): Location[] {
    const search = this.search.trim().toLowerCase();
    return this.locations().filter((location) => {
      const matchesSearch =
        !search ||
        location.title.toLowerCase().includes(search) ||
        location.city.toLowerCase().includes(search) ||
        location.description.toLowerCase().includes(search);
      const matchesCategory = !this.selectedCategoryId || location.categoryId === this.selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }

  protected openInfo(marker: MapMarker, location: Location): void {
    this.selectedLocation.set(location);
    this.infoWindow?.open(marker);
  }
}
