import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { LanguageService } from '../../core/services/language.service';
import { LocationService } from '../../core/services/location.service';
import {
  LeafletIcon,
  LeafletLayerGroup,
  LeafletLatLngTuple,
  LeafletMap,
  LeafletNamespace,
  MapsLoaderService
} from '../../core/services/maps-loader.service';
import { VisitService } from '../../core/services/visit.service';
import { Category, Location } from '../../core/models/app.models';
import { locationTitle } from '../../core/utils/localized-location';
import { resolveMediaUrl } from '../../core/utils/media-url';
import { FilterBarChange } from '../../shared/components/filter-bar.component';
import { MapControlsComponent } from '../../shared/components/map-controls.component';
import { MarkerPopupComponent } from '../../shared/components/marker-popup.component';

const MAP_PAGE_COPY = {
  sq: {
    title: 'Harta',
    subtitle: 'Filtro lokacionet, zgjidh nje shenjues, pastaj merr drejtimet ose ndiqe nje vizite.',
    empty: 'Asnje lokacion nuk perputhet me filtrat.',
    noLocations: 'Lokacionet nuk u ngarkuan.',
    mapError: 'Harta nuk mund te ngarkohet per momentin.',
    geoMissing: 'Akses ne vendndodhje nuk eshte i disponueshem ne kete shfletues.',
    geoDenied: 'Lejo aksesin ne vendndodhje per te marre drejtimet.',
    visitSaved: 'Vizita u ruajt.',
    visitRemoved: 'Vizita u hoq.',
    close: 'Mbyll'
  },
  en: {
    title: 'Map',
    subtitle: 'Filter locations, select a marker, then get directions or track a visit.',
    empty: 'No locations match these filters.',
    noLocations: 'Locations could not be loaded.',
    mapError: 'The map could not be loaded right now.',
    geoMissing: 'Location access is not available in this browser.',
    geoDenied: 'Allow location access to get directions.',
    visitSaved: 'Visit saved.',
    visitRemoved: 'Visit removed.',
    close: 'Close'
  }
} as const;

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, MapControlsComponent, MarkerPopupComponent],
  template: `
    <div class="page-shell map-page-shell">
      <section class="page-header">
        <h1>{{ copy().title }}</h1>
        <p>{{ copy().subtitle }}</p>
      </section>

      <app-map-controls
        [categories]="categories()"
        [search]="search"
        [categoryId]="selectedCategoryId"
        [visibleCount]="filteredLocations().length"
        [progress]="authService.isAuthenticated() ? visitService.progress() : null"
        (filtersChange)="onFiltersChange($event)">
      </app-map-controls>

      <section class="ui-map-card">
        <div class="osm-map-shell">
          <div #mapContainer class="osm-map-canvas"></div>

          <app-marker-popup
            [location]="selectedLocation()"
            [visited]="selectedLocation() ? isVisited(selectedLocation()!.id) : false"
            [authenticated]="authService.isAuthenticated()"
            [loading]="visitLoading()"
            (details)="goToLocation($event)"
            (directions)="getDirections($event)"
            (toggleVisited)="toggleVisited($event)">
          </app-marker-popup>

          @if (loading() || !mapsReady()) {
            <div class="osm-map-loading skeleton"></div>
          }
          @if (!loading() && !mapError() && !filteredLocations().length) {
            <div class="osm-map-empty">{{ copy().empty }}</div>
          }
          @if (mapError()) {
            <div class="map-error">{{ mapError() }}</div>
          }
        </div>
      </section>
    </div>
  `
})
export class MapPageComponent implements OnInit, AfterViewInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  private readonly categoryService = inject(CategoryService);
  private readonly languageService = inject(LanguageService);
  private readonly locationService = inject(LocationService);
  private readonly mapsLoader = inject(MapsLoaderService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly visitService = inject(VisitService);

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private leaflet?: LeafletNamespace;
  private map?: LeafletMap;
  private markersLayer?: LeafletLayerGroup;
  private viewReady = false;
  private readonly defaultCenter: LeafletLatLngTuple = [42.6026, 20.903];

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly selectedLocation = signal<Location | null>(null);
  protected readonly mapsReady = signal(false);
  protected readonly loading = signal(true);
  protected readonly visitLoading = signal(false);
  protected readonly mapError = signal('');
  protected readonly copy = computed(() => MAP_PAGE_COPY[this.languageService.language()]);
  protected search = '';
  protected selectedCategoryId: number | null = null;

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((response) => this.categories.set(response.items));

    this.locationService.getAllForMap().subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.loading.set(false);
        this.syncMap();
      },
      error: () => {
        this.loading.set(false);
        this.mapError.set(this.copy().noLocations);
      }
    });

    this.mapsLoader.load()
      .then((leaflet) => {
        this.leaflet = leaflet;
        this.mapsReady.set(true);
        this.syncMap();
      })
      .catch(() => {
        this.mapError.set(this.copy().mapError);
      });

    const user = this.authService.user();
    if (user) {
      this.visitService.getVisited(user.id).subscribe(() => this.renderMarkers());
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

  protected filteredLocations(): Location[] {
    const search = this.search.trim().toLowerCase();
    return this.locations().filter((location) =>
      (!search || this.matchesSearch(location, search)) &&
      (!this.selectedCategoryId || location.categoryId === this.selectedCategoryId)
    );
  }

  protected onFiltersChange(filters: FilterBarChange): void {
    this.search = filters.search;
    this.selectedCategoryId = filters.categoryId;
    this.selectedLocation.set(null);
    this.syncMap(true);
  }

  protected goToLocation(id: number): void {
    this.router.navigate(['/locations', id]);
  }

  protected getDirections(location: Location): void {
    const c = this.copy();
    if (!navigator.geolocation) {
      this.snackBar.open(c.geoMissing, c.close, { duration: 3000 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const startLat = position.coords.latitude;
        const startLng = position.coords.longitude;
        window.open(
          this.osrmRouteUrl(startLat, startLng, location.latitude, location.longitude),
          '_blank',
          'noopener,noreferrer'
        );
      },
      () => this.snackBar.open(c.geoDenied, c.close, { duration: 3000 }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  protected toggleVisited(location: Location): void {
    this.visitLoading.set(true);
    const request = this.isVisited(location.id)
      ? this.visitService.delete(location.id)
      : this.visitService.create(location.id);

    request.subscribe({
      next: () => {
        this.visitLoading.set(false);
        this.renderMarkers();
        const c = this.copy();
        this.snackBar.open(this.isVisited(location.id) ? c.visitSaved : c.visitRemoved, c.close, { duration: 2500 });
      },
      error: () => this.visitLoading.set(false)
    });
  }

  protected isVisited(id: number): boolean {
    return this.visitService.visitedIds().has(id);
  }

  private syncMap(fitBounds = true): void {
    if (!this.viewReady || !this.leaflet || !this.mapContainer || this.loading() || this.mapError()) {
      return;
    }

    if (!this.map) {
      this.map = this.leaflet.map(this.mapContainer.nativeElement, { zoomControl: true });
      this.leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);
      this.markersLayer = this.leaflet.layerGroup();
      this.markersLayer.addTo(this.map);
    }

    this.renderMarkers();

    const visibleLocations = this.filteredLocations();
    if (!fitBounds) {
      window.setTimeout(() => this.map?.invalidateSize(), 0);
      return;
    }

    if (!visibleLocations.length) {
      this.map.setView(this.defaultCenter, 8);
      window.setTimeout(() => this.map?.invalidateSize(), 0);
      return;
    }

    const bounds = this.leaflet.latLngBounds(
      visibleLocations.map((location) => [location.latitude, location.longitude] as LeafletLatLngTuple)
    );
    this.map.fitBounds(bounds, { padding: [42, 42], maxZoom: 13 });
    window.setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private renderMarkers(): void {
    if (!this.leaflet || !this.markersLayer) {
      return;
    }

    this.markersLayer.clearLayers();

    for (const location of this.filteredLocations()) {
      this.leaflet.marker([location.latitude, location.longitude], {
        icon: this.createPinIcon(location)
      })
      .addTo(this.markersLayer)
      .on('click', () => this.selectLocation(location));
    }
  }

  private createPinIcon(location: Location): LeafletIcon {
    const title = this.escapeHtml(locationTitle(location, this.languageService.language()));
    const thumbnail = this.getThumb(location);
    const image = thumbnail ? `<img class="map-pin-thumb" src="${this.escapeHtml(thumbnail)}" alt="">` : '';
    const visited = this.isVisited(location.id) ? ' visited' : '';
    const selected = this.selectedLocation()?.id === location.id ? ' selected' : '';

    return this.leaflet!.divIcon({
      className: 'map-pin-wrapper',
      html: `<div class="custom-map-pin${visited}${selected}">${image}<span>${title}</span></div>`,
      iconSize: [170, 44],
      iconAnchor: [18, 42]
    });
  }

  private getThumb(location: Location): string | null {
    return resolveMediaUrl(location.media?.find((media) => media.mediaType === 'image')?.mediaUrl);
  }

  private selectLocation(location: Location): void {
    this.selectedLocation.set(location);
    this.renderMarkers();
    this.map?.setView([location.latitude, location.longitude], 14);
  }

  private matchesSearch(location: Location, search: string): boolean {
    return [
      location.title,
      location.titleSq,
      location.city,
      location.citySq
    ].some((value) => value?.toLowerCase().includes(search));
  }

  private osrmRouteUrl(startLat: number, startLng: number, endLat: number, endLng: number): string {
    const centerLat = (startLat + endLat) / 2;
    const centerLng = (startLng + endLng) / 2;
    return `https://map.project-osrm.org/?z=13&center=${centerLat},${centerLng}&loc=${startLat},${startLng}&loc=${endLat},${endLng}&hl=en&alt=0&srv=0`;
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
