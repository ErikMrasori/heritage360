import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VisitProgress, VisitedLocationsResponse } from '../models/app.models';

const EMPTY_PROGRESS: VisitProgress = {
  totalVisited: 0,
  nextMilestone: 5,
  milestones: [
    { threshold: 5, achieved: false, remaining: 5 },
    { threshold: 10, achieved: false, remaining: 10 },
    { threshold: 25, achieved: false, remaining: 25 }
  ]
};

@Injectable({ providedIn: 'root' })
export class VisitService {
  private readonly http = inject(HttpClient);

  readonly visitedIds = signal<Set<number>>(new Set());
  readonly progress = signal<VisitProgress>(EMPTY_PROGRESS);

  create(locationId: number) {
    return this.http.post<{ progress: VisitProgress }>(`${environment.apiUrl}/visits`, { locationId }).pipe(
      tap((response) => {
        const next = new Set(this.visitedIds());
        next.add(locationId);
        this.visitedIds.set(next);
        this.progress.set(response.progress);
      })
    );
  }

  delete(locationId: number) {
    return this.http.delete<{ progress: VisitProgress }>(`${environment.apiUrl}/visits/${locationId}`).pipe(
      tap((response) => {
        const next = new Set(this.visitedIds());
        next.delete(locationId);
        this.visitedIds.set(next);
        this.progress.set(response.progress);
      })
    );
  }

  getVisited(userId: number) {
    return this.http.get<VisitedLocationsResponse>(`${environment.apiUrl}/users/${userId}/visited`).pipe(
      tap((res) => {
        const ids = new Set(res.items.map((visit) => visit.location_id));
        this.visitedIds.set(ids);
        this.progress.set(res.progress);
      })
    );
  }
}
