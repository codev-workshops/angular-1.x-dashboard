import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const THEME_KEY = 'crypto_dashboard_theme';
type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly theme$ = new BehaviorSubject<Theme>(this.loadTheme());

  constructor() {
    this.applyTheme(this.theme$.getValue());
  }

  getTheme(): Observable<Theme> {
    return this.theme$.asObservable();
  }

  getCurrentTheme(): Theme {
    return this.theme$.getValue();
  }

  toggleTheme(): void {
    const next: Theme = this.theme$.getValue() === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    this.theme$.next(next);
    this.applyTheme(next);
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
