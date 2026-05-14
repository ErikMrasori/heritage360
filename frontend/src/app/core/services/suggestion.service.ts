import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface LandmarkSuggestionPayload {
  fullName: string;
  email: string;
  landmarkName: string;
  city: string;
  categoryId: number | null;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class SuggestionService {
  private readonly http = inject(HttpClient);

  create(payload: LandmarkSuggestionPayload) {
    return this.http.post(`${environment.apiUrl}/suggestions`, payload);
  }
}
