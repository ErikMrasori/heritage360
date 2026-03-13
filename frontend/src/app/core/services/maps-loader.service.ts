import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MapsLoaderService {
  // The Google Maps script is loaded once and shared across map-driven pages.
  private readonly loader = new Loader({
    apiKey: environment.googleMapsApiKey,
    version: 'weekly'
  });

  load() {
    return this.loader.load();
  }
}
