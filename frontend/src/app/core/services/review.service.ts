import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Review, ReviewsResponse } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  getReviews(locationId: number) {
    return this.http.get<ReviewsResponse>(`${environment.apiUrl}/locations/${locationId}/reviews`);
  }

  createReview(locationId: number, rating: number, body: string) {
    return this.http.post<Review>(`${environment.apiUrl}/locations/${locationId}/reviews`, { rating, body });
  }
}
