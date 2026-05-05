import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { CryptoApiService } from '../../services/crypto-api.service';
import { SearchBarComponent } from '../search-bar/search-bar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, AsyncPipe, SearchBarComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Output() assetSearched = new EventEmitter<string>();

  constructor(
    public readonly themeService: ThemeService,
    public readonly cryptoApi: CryptoApiService,
  ) {}

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onAssetSelected(id: string): void {
    this.assetSearched.emit(id);
  }
}
