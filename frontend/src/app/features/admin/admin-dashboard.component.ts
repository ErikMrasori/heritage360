import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, Location, LocationMedia } from '../../core/models/app.models';
import { CategoryService } from '../../core/services/category.service';
import { LocationPayload, LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="page-shell">
      <section class="page-header">
        <h1>Admin dashboard</h1>
        <p>Create, update, and remove location records and their media assets.</p>
      </section>

      <div class="grid grid-2">
        <mat-card class="card-surface">
          <mat-card-header>
            <mat-card-title>{{ editingId() ? 'Edit location' : 'Add location' }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()" class="grid">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput rows="4" formControlName="description"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address" />
              </mat-form-field>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Latitude</mat-label>
                  <input matInput type="number" formControlName="latitude" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Longitude</mat-label>
                  <input matInput type="number" formControlName="longitude" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select formControlName="categoryId">
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ category.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div formArrayName="media" class="grid">
                @for (mediaGroup of media.controls; track $index) {
                  <div [formGroupName]="$index" class="card-surface" style="padding: 16px;">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Media type</mat-label>
                        <mat-select formControlName="mediaType">
                          <mat-option value="image">Image</mat-option>
                          <mat-option value="video">Video</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Caption</mat-label>
                        <input matInput formControlName="caption" />
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" style="width: 100%;">
                      <mat-label>Media URL</mat-label>
                      <input matInput formControlName="mediaUrl" />
                    </mat-form-field>

                    <button mat-button color="warn" type="button" (click)="removeMedia($index)">Remove media</button>
                  </div>
                }
              </div>

              <button mat-stroked-button type="button" (click)="addMedia()">Add media item</button>

              <div class="hero-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
                  {{ editingId() ? 'Update location' : 'Create location' }}
                </button>
                <button mat-button type="button" (click)="resetForm()">Reset</button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card class="card-surface">
          <mat-card-header>
            <mat-card-title>Existing locations</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grid">
              @for (location of locations(); track location.id) {
                <div class="card-surface" style="padding: 16px;">
                  <strong>{{ location.title }}</strong>
                  <p>{{ location.city }} • {{ location.categoryName }}</p>
                  <div class="hero-actions">
                    <button mat-button type="button" (click)="edit(location)">Edit</button>
                    <button mat-button color="warn" type="button" (click)="remove(location.id)">Delete</button>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly editingId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    latitude: [42.6026, Validators.required],
    longitude: [20.903, Validators.required],
    categoryId: [null as number | null, Validators.required],
    media: this.fb.array([])
  });

  protected get media(): FormArray {
    return this.form.get('media') as FormArray;
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((response) => this.categories.set(response.items));
    this.refreshLocations();
    this.addMedia();
  }

  protected addMedia(media?: LocationMedia): void {
    this.media.push(
      this.fb.group({
        mediaType: [media?.mediaType || 'image', Validators.required],
        mediaUrl: [media?.mediaUrl || '', Validators.required],
        caption: [media?.caption || '']
      })
    );
  }

  protected removeMedia(index: number): void {
    this.media.removeAt(index);
  }

  protected edit(location: Location): void {
    this.editingId.set(location.id);
    this.form.patchValue({
      title: location.title,
      description: location.description,
      city: location.city,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      categoryId: location.categoryId
    });
    this.media.clear();
    if (location.media.length) {
      location.media.forEach((media) => this.addMedia(media));
    } else {
      this.addMedia();
    }
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      city: '',
      address: '',
      latitude: 42.6026,
      longitude: 20.903,
      categoryId: null
    });
    this.media.clear();
    this.addMedia();
  }

  protected submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const media = (raw.media as LocationMedia[]).filter((item) => item.mediaUrl);
    const payload: LocationPayload = {
      title: raw.title ?? '',
      description: raw.description ?? '',
      city: raw.city ?? '',
      address: raw.address ?? '',
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      categoryId: Number(raw.categoryId),
      media
    };

    const request = this.editingId()
      ? this.locationService.update(this.editingId()!, payload)
      : this.locationService.create(payload);

    request.subscribe(() => {
      this.resetForm();
      this.refreshLocations();
    });
  }

  protected remove(id: number): void {
    this.locationService.delete(id).subscribe(() => this.refreshLocations());
  }

  private refreshLocations(): void {
    this.locationService.getAll({ limit: 100 }).subscribe((response) => this.locations.set(response.items));
  }
}
