import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { CryptoApiService } from '../../services/crypto-api.service';
import { CoinGeckoSearchResult } from '../../models/asset.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBarComponent implements OnDestroy {
  @Output() assetSelected = new EventEmitter<string>();

  searchQuery = '';
  results: CoinGeckoSearchResult[] = [];
  isSearching = false;
  showResults = false;

  private readonly searchSubject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly cryptoApi: CryptoApiService) {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.trim().length < 2) {
          return of([]);
        }
        this.isSearching = true;
        return this.cryptoApi.searchCoins(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.results = results;
      this.isSearching = false;
      this.showResults = results.length > 0;
    });
  }

  onSearchInput(): void {
    this.searchSubject$.next(this.searchQuery);
    if (this.searchQuery.trim().length < 2) {
      this.results = [];
      this.showResults = false;
    }
  }

  selectResult(coin: CoinGeckoSearchResult): void {
    this.assetSelected.emit(coin.id);
    this.searchQuery = '';
    this.results = [];
    this.showResults = false;
  }

  onBlur(): void {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  onFocus(): void {
    if (this.results.length > 0) {
      this.showResults = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
