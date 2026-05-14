import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map as rxMap, of, switchMap } from 'rxjs';
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
  titleSq: string;
  description: string;
  descriptionSq: string;
  city: string;
  citySq: string;
  address: string;
  addressSq: string;
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
    if (query.search)      params = params.set('search', query.search);
    if (query.categoryId)  params = params.set('categoryId', String(query.categoryId));
    if (query.page)        params = params.set('page', String(query.page));
    if (query.limit)       params = params.set('limit', String(query.limit));
    return this.http.get<PaginatedLocations>(`${environment.apiUrl}/locations`, { params });
  }

  getById(id: number) {
    return this.http.get<Location>(`${environment.apiUrl}/locations/${id}`);
  }

  getAllForMap() {
    const limit = 100;
    return this.getAll({ page: 1, limit }).pipe(
      switchMap((firstPage) => {
        const pageCount = Math.ceil(firstPage.total / limit);
        if (pageCount <= 1) {
          return of(firstPage.items);
        }

        const requests = Array.from({ length: pageCount - 1 }, (_, index) =>
          this.getAll({ page: index + 2, limit })
        );

        return forkJoin(requests).pipe(
          rxMap((pages) => [
            ...firstPage.items,
            ...pages.flatMap((page) => page.items)
          ])
        );
      })
    );
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

  /** Upload media files; returns array of { mediaUrl, mediaType } */
  uploadMedia(files: File[]) {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<{ items: { mediaUrl: string; mediaType: string }[] }>(
      `${environment.apiUrl}/uploads`, formData
    );
  }
}
