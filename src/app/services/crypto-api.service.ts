import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, Subject, BehaviorSubject, of, catchError, timeout } from 'rxjs';
import { Asset, CoinGeckoMarketResponse, CoinGeckoSearchResult } from '../models/asset.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CryptoApiService {
  private readonly baseUrl = environment.cryptoApiBaseUrl;
  private readonly lastUpdated$ = new BehaviorSubject<Date>(new Date());
  private readonly refreshTrigger$ = new Subject<void>();

  constructor(private readonly http: HttpClient) {}

  getLastUpdated(): Observable<Date> {
    return this.lastUpdated$.asObservable();
  }

  updateTimestamp(): void {
    this.lastUpdated$.next(new Date());
  }

  fetchMarketData(ids: string[]): Observable<Asset[]> {
    if (ids.length === 0) {
      return of([]);
    }
    const url = `${this.baseUrl}/coins/markets`;
    const params = {
      vs_currency: 'usd',
      ids: ids.join(','),
      order: 'market_cap_desc',
      sparkline: 'true',
      price_change_percentage: '24h',
    };
    return this.http.get<CoinGeckoMarketResponse[]>(url, { params }).pipe(
      timeout(5000),
      map(data => data.map(coin => this.mapToAsset(coin))),
      catchError(() => of(this.getDemoData(ids)))
    );
  }

  triggerRefresh(): void {
    this.refreshTrigger$.next();
  }

  searchCoins(query: string): Observable<CoinGeckoSearchResult[]> {
    const url = `${this.baseUrl}/search`;
    return this.http.get<{ coins: CoinGeckoSearchResult[] }>(url, {
      params: { query }
    }).pipe(
      timeout(5000),
      map(response => response.coins.slice(0, 10)),
      catchError(() => of(this.getDemoSearchResults(query)))
    );
  }

  private mapToAsset(coin: CoinGeckoMarketResponse): Asset {
    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      priceChangePercentage24h: coin.price_change_percentage_24h ?? 0,
      marketCap: coin.market_cap,
      totalVolume: coin.total_volume,
      sparklineIn7d: coin.sparkline_in_7d?.price ?? [],
      lastUpdated: coin.last_updated,
    };
  }

  private generateSparkline(basePrice: number): number[] {
    const points: number[] = [];
    let price = basePrice * (0.92 + Math.random() * 0.08);
    for (let i = 0; i < 168; i++) {
      price += price * (Math.random() - 0.48) * 0.02;
      points.push(price);
    }
    return points;
  }

  private getDemoData(ids: string[]): Asset[] {
    const demoAssets: Record<string, Asset> = {
      bitcoin: {
        id: 'bitcoin', symbol: 'btc', name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        currentPrice: 96432.00 + Math.random() * 500 - 250,
        priceChangePercentage24h: 2.34 + Math.random() * 2 - 1,
        marketCap: 1890000000000, totalVolume: 42000000000,
        sparklineIn7d: this.generateSparkline(96432),
        lastUpdated: new Date().toISOString(),
      },
      ethereum: {
        id: 'ethereum', symbol: 'eth', name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        currentPrice: 3456.78 + Math.random() * 50 - 25,
        priceChangePercentage24h: -1.23 + Math.random() * 2 - 1,
        marketCap: 415000000000, totalVolume: 18000000000,
        sparklineIn7d: this.generateSparkline(3456),
        lastUpdated: new Date().toISOString(),
      },
      solana: {
        id: 'solana', symbol: 'sol', name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        currentPrice: 178.45 + Math.random() * 5 - 2.5,
        priceChangePercentage24h: 5.67 + Math.random() * 2 - 1,
        marketCap: 82000000000, totalVolume: 5600000000,
        sparklineIn7d: this.generateSparkline(178),
        lastUpdated: new Date().toISOString(),
      },
      cardano: {
        id: 'cardano', symbol: 'ada', name: 'Cardano',
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        currentPrice: 0.72 + Math.random() * 0.05 - 0.025,
        priceChangePercentage24h: -0.89 + Math.random() * 2 - 1,
        marketCap: 25000000000, totalVolume: 890000000,
        sparklineIn7d: this.generateSparkline(0.72),
        lastUpdated: new Date().toISOString(),
      },
      ripple: {
        id: 'ripple', symbol: 'xrp', name: 'XRP',
        image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        currentPrice: 2.18 + Math.random() * 0.1 - 0.05,
        priceChangePercentage24h: 3.45 + Math.random() * 2 - 1,
        marketCap: 120000000000, totalVolume: 7200000000,
        sparklineIn7d: this.generateSparkline(2.18),
        lastUpdated: new Date().toISOString(),
      },
      dogecoin: {
        id: 'dogecoin', symbol: 'doge', name: 'Dogecoin',
        image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
        currentPrice: 0.198 + Math.random() * 0.01 - 0.005,
        priceChangePercentage24h: 1.12 + Math.random() * 2 - 1,
        marketCap: 29000000000, totalVolume: 2100000000,
        sparklineIn7d: this.generateSparkline(0.198),
        lastUpdated: new Date().toISOString(),
      },
      polkadot: {
        id: 'polkadot', symbol: 'dot', name: 'Polkadot',
        image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
        currentPrice: 7.85 + Math.random() * 0.3 - 0.15,
        priceChangePercentage24h: -2.34 + Math.random() * 2 - 1,
        marketCap: 10500000000, totalVolume: 450000000,
        sparklineIn7d: this.generateSparkline(7.85),
        lastUpdated: new Date().toISOString(),
      },
      'avalanche-2': {
        id: 'avalanche-2', symbol: 'avax', name: 'Avalanche',
        image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
        currentPrice: 38.92 + Math.random() * 2 - 1,
        priceChangePercentage24h: 4.21 + Math.random() * 2 - 1,
        marketCap: 15800000000, totalVolume: 780000000,
        sparklineIn7d: this.generateSparkline(38.92),
        lastUpdated: new Date().toISOString(),
      },
    };

    return ids
      .map(id => demoAssets[id])
      .filter((asset): asset is Asset => asset !== undefined);
  }

  private getDemoSearchResults(query: string): CoinGeckoSearchResult[] {
    const allCoins: CoinGeckoSearchResult[] = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png', market_cap_rank: 1 },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png', market_cap_rank: 2 },
      { id: 'solana', name: 'Solana', symbol: 'SOL', thumb: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png', market_cap_rank: 5 },
      { id: 'cardano', name: 'Cardano', symbol: 'ADA', thumb: 'https://assets.coingecko.com/coins/images/975/thumb/cardano.png', market_cap_rank: 9 },
      { id: 'ripple', name: 'XRP', symbol: 'XRP', thumb: 'https://assets.coingecko.com/coins/images/44/thumb/xrp-symbol-white-128.png', market_cap_rank: 4 },
      { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', thumb: 'https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png', market_cap_rank: 8 },
      { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', thumb: 'https://assets.coingecko.com/coins/images/12171/thumb/polkadot.png', market_cap_rank: 13 },
      { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', thumb: 'https://assets.coingecko.com/coins/images/12559/thumb/Avalanche_Circle_RedWhite_Trans.png', market_cap_rank: 12 },
      { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', thumb: 'https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png', market_cap_rank: 14 },
      { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', thumb: 'https://assets.coingecko.com/coins/images/2/thumb/litecoin.png', market_cap_rank: 18 },
    ];
    const q = query.toLowerCase();
    return allCoins.filter(c =>
      c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }
}
