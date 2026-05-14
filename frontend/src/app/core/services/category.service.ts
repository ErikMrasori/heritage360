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

  create(name: string) {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, { name });
  }

  update(id: number, name: string) {
    return this.http.put<Category>(`${environment.apiUrl}/categories/${id}`, { name });
  }

  delete(id: number) {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`);
  }
}
