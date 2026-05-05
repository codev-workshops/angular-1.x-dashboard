import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { CryptoApiService } from '../../services/crypto-api.service';
import { WatchlistService } from '../../services/watchlist.service';
import { Asset } from '../../models/asset.model';
import { AssetCardComponent } from '../../components/asset-card/asset-card';
import { HeaderComponent } from '../../components/header/header';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AssetCardComponent, HeaderComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  assets: Asset[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  selectedAsset: Asset | null = null;

  private readonly destroy$ = new Subject<void>();
  private previousPrices = new Map<string, number>();

  constructor(
    private readonly cryptoApi: CryptoApiService,
    private readonly watchlistService: WatchlistService,
  ) {}

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isWatchlisted(assetId: string): boolean {
    return this.watchlistService.isInWatchlist(assetId);
  }

  toggleWatchlist(assetId: string): void {
    this.watchlistService.toggleAsset(assetId);
  }

  onAssetSearched(assetId: string): void {
    this.watchlistService.addAsset(assetId);
  }

  selectAsset(asset: Asset): void {
    this.selectedAsset = this.selectedAsset?.id === asset.id ? null : asset;
  }

  closeDetail(): void {
    this.selectedAsset = null;
  }

  private startPolling(): void {
    this.watchlistService.getWatchlistIds().pipe(
      switchMap(ids => {
        return timer(0, environment.pollingIntervalMs).pipe(
          switchMap(() => {
            this.cryptoApi.updateTimestamp();
            return this.cryptoApi.fetchMarketData(ids);
          })
        );
      }),
      tap(assets => {
        if (assets.length > 0) {
          this.errorMessage = null;
        }
        this.trackPriceChanges(assets);
        this.assets = assets;
        this.isLoading = false;

        if (this.selectedAsset) {
          const updated = assets.find(a => a.id === this.selectedAsset!.id);
          if (updated) {
            this.selectedAsset = updated;
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private trackPriceChanges(assets: Asset[]): void {
    for (const asset of assets) {
      this.previousPrices.set(asset.id, asset.currentPrice);
    }
  }
}
