import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Location, LocationMedia, PaginatedLocations } from '../models/app.models';

export interface LocationQuery {
  search?: string;
  categoryId?: number | null;
  page?: number;
  limit?: number;
}

export interface LocationPayload {
  title: string;
  description: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  categoryId: number;
  media: LocationMedia[];
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);

  getAll(query: LocationQuery = {}) {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.categoryId) params = params.set('categoryId', String(query.categoryId));
    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));

    return this.http.get<PaginatedLocations>(`${environment.apiUrl}/locations`, { params });
  }

  getById(id: number) {
    return this.http.get<Location>(`${environment.apiUrl}/locations/${id}`);
  }

  create(payload: LocationPayload) {
    return this.http.post<Location>(`${environment.apiUrl}/locations`, payload);
  }

  update(id: number, payload: LocationPayload) {
    return this.http.put<Location>(`${environment.apiUrl}/locations/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/locations/${id}`);
  }
}
