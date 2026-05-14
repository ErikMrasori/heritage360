import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Category, Location, LocationMedia } from '../../core/models/app.models';
import { CategoryService } from '../../core/services/category.service';
import { LocationPayload, LocationService } from '../../core/services/location.service';
import { resolveMediaUrl } from '../../core/utils/media-url';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
const MAX_FILE_MB = 50;

interface UploadPreview {
  url: string;
  type: 'image' | 'video';
  mediaUrl: string | null;
  isObjectUrl: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTabsModule
  ],
  template: `
    <div class="page-shell admin-shell">
      <section class="page-header admin-header">
        <div>
          <h1>Admin CRUD</h1>
          <p>Create, update, and remove platform content.</p>
        </div>
        <button mat-flat-button type="button" class="primary-action" (click)="openCreateModal()">
          Add location
        </button>
      </section>

      <mat-tab-group dynamicHeight class="admin-tabs">
        <mat-tab label="Locations">
          <section class="admin-panel">
            <div class="admin-panel-heading">
              <div>
                <h2>Locations</h2>
                <p>{{ locations().length }} records</p>
              </div>
              <button mat-stroked-button type="button" (click)="openCreateModal()">New location</button>
            </div>

            <div class="admin-list">
              @if (locationsLoading()) {
                @for (_ of skeletons; track $index) {
                  <div class="skeleton-card admin-list-card"></div>
                }
              }

              @for (loc of locations(); track loc.id) {
                <article class="admin-list-card">
                  <div class="admin-list-main">
                    <div>
                      <h3>{{ loc.title }}</h3>
                      <p>{{ loc.city }} / {{ loc.categoryName }}</p>
                    </div>
                    @if (loc.titleSq) {
                      <span class="translation-pill">SQ ready</span>
                    } @else {
                      <span class="translation-pill missing">SQ missing</span>
                    }
                  </div>
                  <div class="admin-list-actions">
                    <button mat-stroked-button type="button" (click)="edit(loc)">Edit</button>
                    <button mat-stroked-button color="warn" type="button" (click)="remove(loc.id)">Delete</button>
                  </div>
                </article>
              }
            </div>
          </section>
        </mat-tab>

        <mat-tab label="Categories">
          <section class="admin-panel narrow">
            <div class="admin-panel-heading">
              <div>
                <h2>Categories</h2>
                <p>Add, rename, or delete categories.</p>
              </div>
            </div>

            <div class="category-form">
              <mat-form-field appearance="outline">
                <mat-label>{{ editingCatId() ? 'Rename category' : 'New category name' }}</mat-label>
                <input matInput [(ngModel)]="catName" (keyup.enter)="saveCategory()" />
              </mat-form-field>
              <button mat-flat-button type="button" class="primary-action" (click)="saveCategory()" [disabled]="!catName.trim()">
                {{ editingCatId() ? 'Save' : 'Add' }}
              </button>
              @if (editingCatId()) {
                <button mat-stroked-button type="button" (click)="cancelCatEdit()">Cancel</button>
              }
            </div>

            <div class="admin-list">
              @if (categoriesLoading()) {
                @for (_ of [1,2,3]; track $index) {
                  <div class="skeleton admin-list-card"></div>
                }
              }

              @for (c of categories(); track c.id) {
                <article class="admin-list-card compact">
                  <h3>{{ c.name }}</h3>
                  <div class="admin-list-actions">
                    <button mat-stroked-button type="button" (click)="startCatEdit(c)">Rename</button>
                    <button mat-stroked-button color="warn" type="button" (click)="deleteCategory(c.id)">Delete</button>
                  </div>
                </article>
              }
            </div>
          </section>
        </mat-tab>
      </mat-tab-group>
    </div>

    @if (locationModalOpen()) {
      <div class="admin-modal-backdrop" (click)="closeLocationModal()">
        <section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="locationModalTitle" (click)="$event.stopPropagation()">
          <header class="admin-modal-header">
            <div>
              <p>{{ editingId() ? 'Update location' : 'Create location' }}</p>
              <h2 id="locationModalTitle">{{ editingId() ? 'Edit current information' : 'Add a new location' }}</h2>
            </div>
            <button type="button" class="icon-button" aria-label="Close" (click)="closeLocationModal()">x</button>
          </header>

          <form [formGroup]="form" (ngSubmit)="submit()" class="modal-form">
            <div class="form-section">
              <div class="form-section-title">
                <span>1</span>
                <div>
                  <h3>English information</h3>
                  <p>Required first for the default public content.</p>
                </div>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>English title</mat-label>
                  <input matInput formControlName="title" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>English city</mat-label>
                  <input matInput formControlName="city" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>English description</mat-label>
                <textarea matInput rows="3" formControlName="description"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>English address</mat-label>
                <input matInput formControlName="address" />
              </mat-form-field>
            </div>

            <div class="form-section">
              <div class="form-section-title">
                <span>2</span>
                <div>
                  <h3>Albanian information</h3>
                  <p>Required after English for the Albanian view.</p>
                </div>
              </div>

              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Albanian title</mat-label>
                  <input matInput formControlName="titleSq" />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Albanian city</mat-label>
                  <input matInput formControlName="citySq" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Albanian description</mat-label>
                <textarea matInput rows="3" formControlName="descriptionSq"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Albanian address</mat-label>
                <input matInput formControlName="addressSq" />
              </mat-form-field>
            </div>

            <div class="form-section">
              <div class="form-section-title">
                <span>3</span>
                <div>
                  <h3>Location details</h3>
                  <p>Map coordinates, category, and media.</p>
                </div>
              </div>

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
                  @for (c of categories(); track c.id) {
                    <mat-option [value]="c.id">{{ c.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div>
                <div class="field-label">Media files</div>
                <div class="upload-zone"
                     [class.drag-over]="isDragging()"
                     (click)="fileInput.click()"
                     (dragover)="onDragOver($event)"
                     (dragleave)="isDragging.set(false)"
                     (drop)="onDrop($event)">
                  <input #fileInput type="file" multiple [accept]="acceptedTypes" (change)="onFileChange($event)" />
                  <div class="upload-icon">File</div>
                  <div class="upload-label">
                    Drop files here or <strong>click to browse</strong><br />
                    <span>JPEG, PNG, WebP, GIF, MP4, WebM - max {{ maxFileMb }}MB each</span>
                  </div>
                </div>

                @if (uploadLoading()) {
                  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                  <div class="upload-status">Uploading...</div>
                }

                @if (uploadPreviews().length) {
                  <div class="upload-preview-grid">
                    @for (p of uploadPreviews(); track p.url; let i = $index) {
                      <div class="upload-preview-item">
                        @if (p.type === 'image') {
                          <img [src]="p.url" [alt]="'preview '+i" />
                        } @else {
                          <video [src]="p.url" muted></video>
                        }
                        <button class="upload-preview-remove" type="button" (click)="removePreview(i)">x</button>
                      </div>
                    }
                  </div>
                }
              </div>

              <div formArrayName="media" class="media-url-list">
                @for (mg of media.controls; track $index) {
                  <div [formGroupName]="$index" class="media-url-card">
                    <div class="form-grid">
                      <mat-form-field appearance="outline">
                        <mat-label>Type</mat-label>
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
                    <mat-form-field appearance="outline">
                      <mat-label>URL</mat-label>
                      <input matInput formControlName="mediaUrl" />
                    </mat-form-field>
                    <button mat-button color="warn" type="button" (click)="removeMedia($index)">Remove media</button>
                  </div>
                }
              </div>

              <button mat-stroked-button type="button" (click)="addMedia()">Add URL media</button>
            </div>

            <footer class="admin-modal-footer">
              <button mat-button type="button" (click)="closeLocationModal()">Cancel</button>
              <button mat-flat-button type="submit" class="primary-action" [disabled]="form.invalid || uploadLoading()">
                {{ editingId() ? 'Update location' : 'Create location' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    }
  `,
  styles: [`
    .admin-shell {
      max-width: 1120px;
    }

    .admin-header,
    .admin-panel-heading,
    .admin-list-main,
    .admin-list-card.compact,
    .admin-list-actions,
    .category-form,
    .admin-modal-header,
    .admin-modal-footer {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .admin-header,
    .admin-panel-heading {
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .primary-action {
      background: var(--alb-red) !important;
      color: #fff !important;
      border-radius: 8px;
    }

    .admin-tabs {
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      background: var(--surface-card);
    }

    .admin-panel {
      padding: 24px;
    }

    .admin-panel.narrow {
      max-width: 620px;
    }

    .admin-panel-heading h2,
    .admin-list-card h3,
    .form-section-title h3,
    .admin-modal-header h2 {
      margin: 0;
    }

    .admin-panel-heading p,
    .admin-list-card p,
    .form-section-title p,
    .admin-modal-header p {
      margin: 4px 0 0;
      color: var(--muted);
      font-size: 13px;
    }

    .admin-list {
      display: grid;
      gap: 10px;
      margin-top: 20px;
    }

    .admin-list-card {
      min-height: 74px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px 16px;
      background: var(--surface-card);
    }

    .admin-list-card.compact,
    .admin-list-main {
      justify-content: space-between;
    }

    .admin-list-main {
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .admin-list-card h3 {
      font-size: 15px;
      font-weight: 650;
    }

    .admin-list-actions {
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .translation-pill {
      border: 1px solid rgba(22, 118, 64, 0.24);
      border-radius: 999px;
      padding: 4px 9px;
      color: #167640;
      background: rgba(22, 118, 64, 0.08);
      font-size: 12px;
      font-weight: 650;
      white-space: nowrap;
    }

    .translation-pill.missing {
      border-color: rgba(200, 16, 46, 0.22);
      color: var(--alb-red);
      background: var(--alb-red-muted);
    }

    .category-form {
      align-items: flex-start;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .category-form mat-form-field {
      flex: 1 1 280px;
    }

    .admin-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 500;
      padding: 24px;
      background: rgba(17, 17, 17, 0.58);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .admin-modal {
      width: min(980px, 100%);
      max-height: min(88vh, 920px);
      overflow: hidden;
      border-radius: 8px;
      background: var(--surface-card);
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
      display: flex;
      flex-direction: column;
    }

    .admin-modal-header {
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--line);
    }

    .admin-modal-header h2 {
      font-size: 24px;
    }

    .icon-button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }

    .modal-form {
      overflow: auto;
      padding: 24px;
      display: grid;
      gap: 20px;
    }

    .form-section {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      display: grid;
      gap: 14px;
    }

    .form-section-title {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .form-section-title span {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--alb-red-muted);
      color: var(--alb-red);
      font-size: 13px;
      font-weight: 700;
      flex: 0 0 auto;
    }

    .field-label {
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 8px;
      font-weight: 650;
    }

    .upload-status {
      font-size: 12px;
      color: var(--muted);
      margin-top: 6px;
    }

    .media-url-list {
      display: grid;
      gap: 10px;
    }

    .media-url-card {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      display: grid;
      gap: 10px;
    }

    .media-url-card mat-form-field,
    .modal-form mat-form-field {
      width: 100%;
    }

    .admin-modal-footer {
      position: sticky;
      bottom: -24px;
      justify-content: flex-end;
      padding: 16px 0 0;
      background: linear-gradient(to top, #fff 70%, rgba(255,255,255,0));
    }

    @media (max-width: 720px) {
      .admin-modal-backdrop {
        padding: 0;
        align-items: stretch;
      }

      .admin-modal {
        max-height: 100vh;
        border-radius: 0;
      }

      .modal-form,
      .admin-modal-header {
        padding: 18px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly locationService = inject(LocationService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly categories = signal<Category[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly locationModalOpen = signal(false);
  protected readonly locationsLoading = signal(true);
  protected readonly categoriesLoading = signal(true);
  protected readonly uploadLoading = signal(false);
  protected readonly isDragging = signal(false);
  protected readonly uploadPreviews = signal<UploadPreview[]>([]);
  protected readonly skeletons = Array(4);

  protected catName = '';
  protected editingCatId = signal<number | null>(null);

  protected readonly acceptedTypes = ALLOWED_TYPES.join(',');
  protected readonly maxFileMb = MAX_FILE_MB;

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    titleSq: ['', Validators.required],
    description: ['', Validators.required],
    descriptionSq: ['', Validators.required],
    city: ['', Validators.required],
    citySq: ['', Validators.required],
    address: ['', Validators.required],
    addressSq: ['', Validators.required],
    latitude: [42.6026, Validators.required],
    longitude: [20.903, Validators.required],
    categoryId: [null as number | null, Validators.required],
    media: this.fb.array([])
  });

  protected get media(): FormArray {
    return this.form.get('media') as FormArray;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.refreshLocations();
  }

  ngOnDestroy(): void {
    this.clearPreviews();
  }

  protected openCreateModal(): void {
    this.prepareBlankForm();
    this.locationModalOpen.set(true);
  }

  protected closeLocationModal(): void {
    this.locationModalOpen.set(false);
    this.editingId.set(null);
    this.clearPreviews();
    this.media.clear();
  }

  protected edit(loc: Location): void {
    this.prepareBlankForm();
    this.editingId.set(loc.id);
    this.form.patchValue({
      title: loc.title,
      titleSq: loc.titleSq || '',
      description: loc.description,
      descriptionSq: loc.descriptionSq || '',
      city: loc.city,
      citySq: loc.citySq || '',
      address: loc.address,
      addressSq: loc.addressSq || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      categoryId: loc.categoryId
    });

    this.media.clear();
    if (loc.media.length) {
      loc.media.forEach((media) => this.addMedia(media));
      this.uploadPreviews.set(
        loc.media.map((media) => ({
          url: resolveMediaUrl(media.mediaUrl) ?? '/placeholder-location.svg',
          type: media.mediaType,
          mediaUrl: media.mediaUrl,
          isObjectUrl: false
        }))
      );
    } else {
      this.addMedia();
    }

    this.locationModalOpen.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    this.processFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  protected removePreview(index: number): void {
    const previews = [...this.uploadPreviews()];
    const [removedPreview] = previews.splice(index, 1);
    this.uploadPreviews.set(previews);
    this.releasePreview(removedPreview);

    if (!removedPreview?.mediaUrl) return;

    const mediaIndex = this.media.controls.findIndex(
      (control) => control.get('mediaUrl')?.value === removedPreview.mediaUrl
    );

    if (mediaIndex >= 0) {
      this.media.removeAt(mediaIndex);
    }
  }

  protected addMedia(media?: Partial<LocationMedia>): void {
    this.media.push(this.createMediaGroup(media));
  }

  protected removeMedia(index: number): void {
    const mediaUrl = this.media.at(index)?.get('mediaUrl')?.value as string | undefined;
    this.media.removeAt(index);
    if (!mediaUrl) return;

    const previews = [...this.uploadPreviews()];
    const previewIndex = previews.findIndex((preview) => preview.mediaUrl === mediaUrl);
    if (previewIndex >= 0) {
      const [removedPreview] = previews.splice(previewIndex, 1);
      this.uploadPreviews.set(previews);
      this.releasePreview(removedPreview);
    }
  }

  protected submit(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const media = (raw.media as LocationMedia[])
      .map((item) => ({
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl?.trim(),
        caption: item.caption?.trim() || null
      }))
      .filter((item) => item.mediaUrl);

    const payload: LocationPayload = {
      title: raw.title?.trim() ?? '',
      titleSq: raw.titleSq?.trim() ?? '',
      description: raw.description?.trim() ?? '',
      descriptionSq: raw.descriptionSq?.trim() ?? '',
      city: raw.city?.trim() ?? '',
      citySq: raw.citySq?.trim() ?? '',
      address: raw.address?.trim() ?? '',
      addressSq: raw.addressSq?.trim() ?? '',
      latitude: Number(raw.latitude),
      longitude: Number(raw.longitude),
      categoryId: Number(raw.categoryId),
      media: media as LocationMedia[]
    };

    const req = this.editingId()
      ? this.locationService.update(this.editingId()!, payload)
      : this.locationService.create(payload);

    req.subscribe(() => {
      this.snackBar.open(`Location ${this.editingId() ? 'updated' : 'created'}.`, 'Close', { duration: 2500 });
      this.closeLocationModal();
      this.refreshLocations();
    });
  }

  protected remove(id: number): void {
    if (!confirm('Delete this location?')) return;
    this.locationService.delete(id).subscribe(() => {
      this.snackBar.open('Location deleted.', 'Close', { duration: 2000 });
      this.refreshLocations();
    });
  }

  protected saveCategory(): void {
    const name = this.catName.trim();
    if (!name) return;

    const req = this.editingCatId()
      ? this.categoryService.update(this.editingCatId()!, name)
      : this.categoryService.create(name);

    req.subscribe(() => {
      this.snackBar.open(`Category ${this.editingCatId() ? 'updated' : 'created'}.`, 'Close', { duration: 2000 });
      this.cancelCatEdit();
      this.loadCategories();
    });
  }

  protected startCatEdit(category: Category): void {
    this.editingCatId.set(category.id);
    this.catName = category.name;
  }

  protected cancelCatEdit(): void {
    this.editingCatId.set(null);
    this.catName = '';
  }

  protected deleteCategory(id: number): void {
    if (!confirm('Delete this category? Locations using it must be reassigned first.')) return;
    this.categoryService.delete(id).subscribe(() => {
      this.snackBar.open('Category deleted.', 'Close', { duration: 2000 });
      this.loadCategories();
    });
  }

  private prepareBlankForm(): void {
    this.editingId.set(null);
    this.clearPreviews();
    this.form.reset({
      title: '',
      titleSq: '',
      description: '',
      descriptionSq: '',
      city: '',
      citySq: '',
      address: '',
      addressSq: '',
      latitude: 42.6026,
      longitude: 20.903,
      categoryId: null
    });
    this.media.clear();
    this.addMedia();
  }

  private processFiles(files: File[]): void {
    const valid = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        this.snackBar.open(`${file.name}: unsupported type.`, 'Dismiss', { duration: 3000 });
        return false;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        this.snackBar.open(`${file.name}: exceeds ${MAX_FILE_MB}MB limit.`, 'Dismiss', { duration: 3000 });
        return false;
      }
      return true;
    });

    if (!valid.length) return;

    const pendingPreviews: UploadPreview[] = valid.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
      mediaUrl: null,
      isObjectUrl: true
    }));

    this.uploadPreviews.update((current) => [...current, ...pendingPreviews]);
    this.uploadLoading.set(true);

    this.locationService.uploadMedia(valid).subscribe({
      next: (response) => {
        const previews = [...this.uploadPreviews()];

        response.items.forEach((item, index) => {
          const preview = pendingPreviews[index];
          const previewIndex = previews.indexOf(preview);
          if (previewIndex === -1) return;

          previews[previewIndex] = {
            ...preview,
            mediaUrl: item.mediaUrl
          };

          this.addMedia({
            mediaType: item.mediaType as 'image' | 'video',
            mediaUrl: item.mediaUrl,
            caption: null
          });
        });

        this.uploadPreviews.set(previews);
        this.uploadLoading.set(false);
        this.snackBar.open(`${response.items.length} file(s) uploaded.`, 'Close', { duration: 2500 });
      },
      error: () => {
        pendingPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        this.uploadPreviews.update((current) => current.filter((preview) => !pendingPreviews.includes(preview)));
        this.uploadLoading.set(false);
      }
    });
  }

  private createMediaGroup(media?: Partial<LocationMedia>) {
    return this.fb.group({
      mediaType: [media?.mediaType || 'image', Validators.required],
      mediaUrl: [media?.mediaUrl || ''],
      caption: [media?.caption || '']
    });
  }

  private refreshLocations(): void {
    this.locationsLoading.set(true);
    this.locationService.getAll({ limit: 100 }).subscribe({
      next: (response) => {
        this.locations.set(response.items);
        this.locationsLoading.set(false);
      },
      error: () => this.locationsLoading.set(false)
    });
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.categories.set(response.items);
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false)
    });
  }

  private clearPreviews(): void {
    this.uploadPreviews().forEach((preview) => this.releasePreview(preview));
    this.uploadPreviews.set([]);
  }

  private releasePreview(preview: UploadPreview | undefined): void {
    if (preview?.isObjectUrl) {
      URL.revokeObjectURL(preview.url);
    }
  }
}
