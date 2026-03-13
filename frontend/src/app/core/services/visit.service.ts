import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VisitRecord } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private readonly http = inject(HttpClient);

  create(locationId: number) {
    return this.http.post(`${environment.apiUrl}/visits`, { locationId });
  }

  getVisited(userId: number) {
    return this.http.get<{ items: VisitRecord[] }>(`${environment.apiUrl}/users/${userId}/visited`);
  }
}
