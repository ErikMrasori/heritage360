import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Category } from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);

  getAll() {
    return this.http.get<{ items: Category[] }>(`${environment.apiUrl}/categories`);
  }
}
