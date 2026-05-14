import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type AppLanguage = 'sq' | 'en';

const STORAGE_KEY = 'ktcp_language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);

  readonly language = signal<AppLanguage>(this.restoreLanguage());

  constructor() {
    effect(() => {
      const language = this.language();

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, language);
      }

      this.document.documentElement.lang = language;
    });
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
  }

  private restoreLanguage(): AppLanguage {
    if (typeof localStorage === 'undefined') {
      return 'sq';
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'sq';
  }
}
