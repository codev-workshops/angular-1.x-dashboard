import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const WATCHLIST_KEY = 'crypto_watchlist_ids';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly watchlistIds$ = new BehaviorSubject<string[]>(this.loadFromStorage());

  getWatchlistIds(): Observable<string[]> {
    return this.watchlistIds$.asObservable();
  }

  getCurrentIds(): string[] {
    return this.watchlistIds$.getValue();
  }

  addAsset(id: string): void {
    const current = this.getCurrentIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      this.saveAndEmit(updated);
    }
  }

  removeAsset(id: string): void {
    const updated = this.getCurrentIds().filter(existingId => existingId !== id);
    this.saveAndEmit(updated);
  }

  isInWatchlist(id: string): boolean {
    return this.getCurrentIds().includes(id);
  }

  toggleAsset(id: string): void {
    if (this.isInWatchlist(id)) {
      this.removeAsset(id);
    } else {
      this.addAsset(id);
    }
  }

  private loadFromStorage(): string[] {
    try {
      const stored = localStorage.getItem(WATCHLIST_KEY);
      if (stored) {
        return JSON.parse(stored) as string[];
      }
    } catch {
      // Fall through to defaults
    }
    return [...environment.defaultCryptoIds];
  }

  private saveAndEmit(ids: string[]): void {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
    this.watchlistIds$.next(ids);
  }
}
