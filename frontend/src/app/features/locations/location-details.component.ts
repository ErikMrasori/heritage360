import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Location } from '../../core/models/app.models';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { MapsLoaderService } from '../../core/services/maps-loader.service';
import { VisitService } from '../../core/services/visit.service';

@Component({
  selector: 'app-location-details',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MatButtonModule, MatCardModule],
  template: `
    <div class="page-shell">
      @if (location(); as currentLocation) {
        <section class="page-header">
          <h1>{{ currentLocation.title }}</h1>
          <p>{{ currentLocation.city }} • {{ currentLocation.categoryName }}</p>
        </section>

        <div class="grid grid-2">
          <mat-card class="card-surface">
            <mat-card-content>
              <p>{{ currentLocation.description }}</p>
              <p><strong>Address:</strong> {{ currentLocation.address }}</p>
              <p><strong>Coordinates:</strong> {{ currentLocation.latitude }}, {{ currentLocation.longitude }}</p>
              @if (authService.isAuthenticated()) {
                <button mat-flat-button color="primary" type="button" (click)="markVisited(currentLocation.id)">
                  Mark as visited
                </button>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="card-surface">
            <mat-card-content class="map-wrapper">
              @if (mapsReady()) {
                <google-map
                  width="100%"
                  height="420px"
                  [center]="{ lat: currentLocation.latitude, lng: currentLocation.longitude }"
                  [zoom]="12">
                  <map-marker [position]="{ lat: currentLocation.latitude, lng: currentLocation.longitude }"></map-marker>
                </google-map>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <section class="page-header" style="margin-top: 28px;">
          <h2>Media</h2>
          <p>Location images and videos linked by admin users.</p>
        </section>
        <div class="media-grid">
          @for (media of currentLocation.media; track media.mediaUrl) {
            <div class="media-item">
              <strong>{{ media.mediaType | titlecase }}</strong>
              <p>{{ media.caption || 'No caption provided' }}</p>
              <a [href]="media.mediaUrl" target="_blank" rel="noreferrer">{{ media.mediaUrl }}</a>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class LocationDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly locationService = inject(LocationService);
  private readonly visitService = inject(VisitService);
  private readonly mapsLoader = inject(MapsLoaderService);

  protected readonly authService = inject(AuthService);
  protected readonly location = signal<Location | null>(null);
  protected readonly mapsReady = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.locationService.getById(id).subscribe((location) => this.location.set(location));
    this.mapsLoader.load().then(() => this.mapsReady.set(true));
  }

  protected markVisited(locationId: number): void {
    this.visitService.create(locationId).subscribe();
  }
}
