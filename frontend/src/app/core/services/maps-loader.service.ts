import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

export type LeafletLatLngTuple = [number, number];
export type LeafletPaddingTuple = [number, number];

export interface LeafletLatLngBounds {
  readonly __brand: 'LeafletLatLngBounds';
}

export interface LeafletMap {
  setView(center: LeafletLatLngTuple, zoom: number): LeafletMap;
  fitBounds(bounds: LeafletLatLngBounds, options?: { padding?: LeafletPaddingTuple; maxZoom?: number }): LeafletMap;
  invalidateSize(): LeafletMap;
  remove(): void;
}

export interface LeafletLayer {
  addTo(target: LeafletMap | LeafletLayerGroup): LeafletLayer;
}

export interface LeafletLayerGroup extends LeafletLayer {
  addTo(target: LeafletMap | LeafletLayerGroup): LeafletLayerGroup;
  clearLayers(): void;
}

export interface LeafletMarker extends LeafletLayer {
  addTo(target: LeafletMap | LeafletLayerGroup): LeafletMarker;
  on(event: 'click', handler: () => void): LeafletMarker;
}

export interface LeafletIcon {
  readonly __brand: 'LeafletIcon';
}

export interface LeafletNamespace {
  map(element: HTMLElement, options?: { zoomControl?: boolean }): LeafletMap;
  tileLayer(urlTemplate: string, options?: { attribution?: string; maxZoom?: number }): LeafletLayer;
  layerGroup(): LeafletLayerGroup;
  marker(latLng: LeafletLatLngTuple, options?: { icon?: LeafletIcon }): LeafletMarker;
  divIcon(options: {
    className?: string;
    html?: string;
    iconSize?: LeafletLatLngTuple;
    iconAnchor?: LeafletLatLngTuple;
  }): LeafletIcon;
  circleMarker(
    latLng: LeafletLatLngTuple,
    options?: {
      radius?: number;
      color?: string;
      weight?: number;
      opacity?: number;
      fillColor?: string;
      fillOpacity?: number;
    }
  ): LeafletMarker;
  latLngBounds(latLngs: LeafletLatLngTuple[]): LeafletLatLngBounds;
}

declare global {
  interface Window {
    L?: LeafletNamespace;
  }
}

@Injectable({ providedIn: 'root' })
export class MapsLoaderService {
  private readonly stylesheetHref = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  private readonly scriptSrc = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  private loadPromise?: Promise<LeafletNamespace>;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  load(): Promise<LeafletNamespace> {
    const browserWindow = this.document.defaultView;
    if (!browserWindow) {
      return Promise.reject(new Error('Leaflet can only load in a browser context.'));
    }

    if (browserWindow.L) {
      return Promise.resolve(browserWindow.L);
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.ensureStylesheet();
    this.loadPromise = new Promise<LeafletNamespace>((resolve, reject) => {
      const existingScript = this.document.querySelector('script[data-map-lib="leaflet"]') as HTMLScriptElement | null;
      const script = existingScript ?? this.document.createElement('script');

      const finishLoad = () => {
        if (browserWindow.L) {
          resolve(browserWindow.L);
          return;
        }
        reject(new Error('Leaflet loaded without exposing the global API.'));
      };

      script.onload = finishLoad;
      script.onerror = () => reject(new Error('Failed to load the Leaflet script.'));

      if (!existingScript) {
        script.src = this.scriptSrc;
        script.async = true;
        script.defer = true;
        script.setAttribute('data-map-lib', 'leaflet');
        this.document.head.appendChild(script);
      }
    });

    return this.loadPromise;
  }

  private ensureStylesheet(): void {
    const existingLink = this.document.querySelector('link[data-map-lib="leaflet"]');
    if (existingLink) {
      return;
    }

    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = this.stylesheetHref;
    link.setAttribute('data-map-lib', 'leaflet');
    this.document.head.appendChild(link);
  }
}
