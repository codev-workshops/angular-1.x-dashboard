import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-price-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-indicator.html',
  styleUrl: './price-indicator.scss',
})
export class PriceIndicatorComponent {
  @Input() change = 0;

  get isPositive(): boolean {
    return this.change >= 0;
  }

  get formattedChange(): string {
    return `${this.isPositive ? '+' : ''}${this.change.toFixed(2)}%`;
  }

  get arrowIcon(): string {
    return this.isPositive ? '▲' : '▼';
  }
}
