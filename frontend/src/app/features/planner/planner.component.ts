import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

type Step = 'form' | 'loading' | 'result';

interface DaySlot {
  location: string;
  description: string;
}

interface PlannerDay {
  day: number;
  title: string;
  morning: DaySlot;
  afternoon: DaySlot;
  evening: DaySlot;
  tip: string;
}

interface PlannerItinerary {
  days: PlannerDay[];
}

interface AnthropicMessageResponse {
  content: Array<{ type: string; text: string }>;
}

const INTERESTS = [
  'Historical',
  'Cultural',
  'Natural',
  'Food & Drink',
  'Adventure',
  'Religious Sites',
  'Architecture'
] as const;

const STYLES = [
  { label: 'Relaxed', hint: 'fewer stops' },
  { label: 'Balanced', hint: '' },
  { label: 'Packed', hint: 'max stops' }
] as const;

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule],
  template: `
    <div class="page-shell">
      <section class="page-header">
        <h1>Trip Planner</h1>
        <p>Tell us a little about your trip and we'll draft a day-by-day itinerary across Kosovo.</p>
      </section>

      @if (step() === 'form') {
        <div class="card-surface planner-card">
          <div class="planner-field">
            <label for="planner-city">Where are you staying?</label>
            <input id="planner-city" type="text" [(ngModel)]="city" name="city" placeholder="e.g. Prishtina" />
          </div>

          <div class="planner-field">
            <label for="planner-days">How many days?</label>
            <input id="planner-days" type="number" min="1" max="14" [(ngModel)]="days" name="days" />
          </div>

          <div class="planner-field">
            <label>What interests you?</label>
            <div class="chip-row">
              @for (interest of interests; track interest) {
                <button type="button"
                        class="cat-chip"
                        [class.active]="isInterestSelected(interest)"
                        (click)="toggleInterest(interest)">
                  {{ interest }}
                </button>
              }
            </div>
          </div>

          <div class="planner-field">
            <label>Travel style</label>
            <div class="chip-row">
              @for (option of stylesList; track option.label) {
                <button type="button"
                        class="cat-chip"
                        [class.active]="travelStyle() === option.label"
                        (click)="setStyle(option.label)">
                  {{ option.label }}
                  @if (option.hint) {
                    <span class="chip-hint">&nbsp;({{ option.hint }})</span>
                  }
                </button>
              }
            </div>
          </div>

          <div class="planner-actions">
            <button mat-flat-button type="button"
                    class="visit-btn-primary"
                    [disabled]="!canGenerate()"
                    (click)="generate()">
              Generate my plan
            </button>
          </div>
        </div>
      }

      @if (step() === 'loading') {
        <div class="planner-skeletons">
          @for (n of [1, 2, 3]; track n) {
            <div class="skeleton-card planner-skel-card">
              <div class="skeleton skeleton-line" style="height:18px;width:35%;margin:0 0 14px;"></div>
              <div class="skeleton skeleton-line long"></div>
              <div class="skeleton skeleton-line mid"></div>
              <div class="skeleton skeleton-line short"></div>
            </div>
          }
        </div>
      }

      @if (step() === 'result' && itinerary(); as plan) {
        <div class="planner-result">
          @for (day of plan.days; track day.day) {
            <article class="card-surface planner-day-card">
              <div class="section-accent">
                <h2>Day {{ day.day }} — {{ day.title }}</h2>
              </div>
              <div class="planner-slot">
                <div class="planner-slot-label">Morning</div>
                <div class="planner-slot-body">
                  <strong>{{ day.morning.location }}</strong>
                  <p>{{ day.morning.description }}</p>
                </div>
              </div>
              <div class="planner-slot">
                <div class="planner-slot-label">Afternoon</div>
                <div class="planner-slot-body">
                  <strong>{{ day.afternoon.location }}</strong>
                  <p>{{ day.afternoon.description }}</p>
                </div>
              </div>
              <div class="planner-slot">
                <div class="planner-slot-label">Evening</div>
                <div class="planner-slot-body">
                  <strong>{{ day.evening.location }}</strong>
                  <p>{{ day.evening.description }}</p>
                </div>
              </div>
              <div class="planner-tip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.3V17h6v-1.2c0-.9.4-1.7 1-2.3A6 6 0 0 0 12 3Z"
                        stroke="#C8102E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <em>Local tip: {{ day.tip }}</em>
              </div>
            </article>
          }

          <div class="planner-result-actions">
            <button mat-stroked-button type="button" (click)="reset()">Plan another trip</button>
            <a mat-flat-button class="visit-btn-primary" routerLink="/locations">Browse locations</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .planner-card { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
    .planner-field { display: flex; flex-direction: column; gap: 8px; }
    .planner-field label { font-weight: 600; font-size: 0.95rem; color: var(--alb-ink, #2b2b2b); }
    .planner-field input {
      padding: 10px 12px; border: 1px solid var(--line, #d6d6d6);
      border-radius: 8px; font: inherit; max-width: 320px;
    }
    .planner-field input:focus { outline: 2px solid #C8102E; border-color: transparent; }
    .planner-actions { display: flex; justify-content: flex-end; padding-top: 8px; }
    .chip-hint { color: #6b6b6b; font-size: 0.85em; }

    .planner-skeletons { display: flex; flex-direction: column; gap: 16px; }
    .planner-skel-card { padding: 20px; }

    .planner-result { display: flex; flex-direction: column; gap: 18px; }
    .planner-day-card { padding: 22px; display: flex; flex-direction: column; gap: 14px; }
    .planner-slot {
      display: grid; grid-template-columns: 110px 1fr; gap: 16px;
      padding: 10px 0; border-bottom: 1px solid #f0ede9;
    }
    .planner-slot:last-of-type { border-bottom: none; }
    .planner-slot-label {
      text-transform: uppercase; letter-spacing: 0.08em;
      font-size: 0.75rem; font-weight: 700; color: #C8102E; padding-top: 2px;
    }
    .planner-slot-body strong { display: block; margin-bottom: 4px; }
    .planner-slot-body p { margin: 0; color: #2b2b2b; line-height: 1.45; }

    .planner-tip {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; background: #faf9f7;
      border-radius: 10px; color: #6b6b6b; font-size: 0.92rem;
    }
    .planner-tip svg { flex-shrink: 0; margin-top: 1px; }
    .planner-tip em { font-style: italic; }

    .planner-result-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; flex-wrap: wrap; }

    @media (max-width: 640px) {
      .planner-slot { grid-template-columns: 1fr; gap: 4px; }
    }
  `]
})
export class PlannerComponent {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly interests = INTERESTS;
  protected readonly stylesList = STYLES;

  protected city = '';
  protected days = 3;
  protected readonly selectedInterests = signal<string[]>([]);
  protected readonly travelStyle = signal<string>('');
  protected readonly step = signal<Step>('form');
  protected readonly itinerary = signal<PlannerItinerary | null>(null);

  protected canGenerate(): boolean {
    return (
      this.city.trim().length > 0 &&
      this.days >= 1 && this.days <= 14 &&
      this.selectedInterests().length > 0 &&
      this.travelStyle().length > 0
    );
  }

  protected isInterestSelected(interest: string): boolean {
    return this.selectedInterests().includes(interest);
  }

  protected toggleInterest(interest: string): void {
    const current = this.selectedInterests();
    this.selectedInterests.set(
      current.includes(interest)
        ? current.filter((value) => value !== interest)
        : [...current, interest]
    );
  }

  protected setStyle(style: string): void {
    this.travelStyle.set(style);
  }

  protected reset(): void {
    this.itinerary.set(null);
    this.step.set('form');
  }

  protected generate(): void {
    if (!this.canGenerate()) {
      return;
    }

    this.step.set('loading');

    this.http.post<AnthropicMessageResponse>(`${environment.apiUrl}/planner/messages`, {
      days: this.days,
      city: this.city.trim(),
      interests: this.selectedInterests().join(', '),
      style: this.travelStyle()
    }).subscribe({
      next: (response) => {
        const text = response?.content?.[0]?.text;
        if (!text) {
          this.handleError();
          return;
        }
        try {
          const parsed = JSON.parse(text) as PlannerItinerary;
          if (!parsed?.days?.length) {
            this.handleError();
            return;
          }
          this.itinerary.set(parsed);
          this.step.set('result');
        } catch {
          this.handleError();
        }
      },
      error: (err) => this.handleError(err?.error?.message)
    });
  }

  private handleError(message?: string): void {
    this.step.set('form');
    this.snackBar.open(message || 'Could not generate plan. Try again.', 'Close', {
      duration: 4500,
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }
}
