import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Asset } from '../../models/asset.model';
import { PriceIndicatorComponent } from '../price-indicator/price-indicator';
import { SparklineChartComponent } from '../sparkline-chart/sparkline-chart';

@Component({
  selector: 'app-asset-card',
  standalone: true,
  imports: [CommonModule, PriceIndicatorComponent, SparklineChartComponent],
  templateUrl: './asset-card.html',
  styleUrl: './asset-card.scss',
})
export class AssetCardComponent {
  @Input() asset!: Asset;
  @Input() isWatchlisted = false;
  @Output() toggleWatchlist = new EventEmitter<string>();
  @Output() selectAsset = new EventEmitter<Asset>();

  previousPrice: number | null = null;
  priceFlash: 'up' | 'down' | null = null;

  get sparklineColor(): string {
    return this.asset.priceChangePercentage24h >= 0 ? '#10b981' : '#ef4444';
  }

  get formattedPrice(): string {
    if (this.asset.currentPrice >= 1) {
      return this.asset.currentPrice.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
    }
    return this.asset.currentPrice.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  }

  get formattedMarketCap(): string {
    return this.formatLargeNumber(this.asset.marketCap);
  }

  get formattedVolume(): string {
    return this.formatLargeNumber(this.asset.totalVolume);
  }

  onToggleWatchlist(event: Event): void {
    event.stopPropagation();
    this.toggleWatchlist.emit(this.asset.id);
  }

  onSelect(): void {
    this.selectAsset.emit(this.asset);
  }

  private formatLargeNumber(num: number): string {
    if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)}T`;
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  }
}
