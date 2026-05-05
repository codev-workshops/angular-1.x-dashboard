# Live Crypto Ticker Dashboard

A frontend-only live cryptocurrency ticker dashboard built with Angular 21. Displays real-time market data with auto-refreshing prices, sparkline charts, watchlist management, and dark/light theme support.

![Angular](https://img.shields.io/badge/Angular-21-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Live Price Updates** — Auto-refreshes every 10 seconds using RxJS polling
- **Dashboard View** — Card-based layout showing name, symbol, price, 24h change, sparkline charts, market cap, and volume
- **Watchlist** — Add/remove assets with localStorage persistence
- **Search** — Debounced search with autocomplete powered by CoinGecko API
- **Dark/Light Mode** — Theme toggle with localStorage persistence
- **Responsive Design** — Works on desktop and mobile
- **Asset Detail Modal** — Click any card to see expanded stats and a 7-day chart
- **Sparkline Charts** — Lightweight canvas-based charts (no external chart library)

## API Used

**[CoinGecko API v3](https://www.coingecko.com/en/api)** (free, no API key required)

- `/coins/markets` — Fetch market data with sparkline
- `/search` — Search for coins by name or symbol

## How Real-Time Updates Work

1. The `WatchlistService` emits the current list of watched asset IDs via a `BehaviorSubject`
2. The `DashboardComponent` subscribes to watchlist changes and starts an RxJS `timer` that fires every 10 seconds
3. On each tick, `CryptoApiService.fetchMarketData()` calls the CoinGecko markets endpoint
4. Results are mapped to a clean `Asset` model and rendered via `AssetCardComponent`
5. The polling interval is configurable via `src/environments/environment.ts`

## Project Structure

```
src/
├── app/
│   ├── models/          # TypeScript interfaces (Asset, API responses)
│   ├── services/        # Business logic separated from UI
│   │   ├── crypto-api.service.ts    # API calls & data mapping
│   │   ├── watchlist.service.ts     # Watchlist state & localStorage
│   │   └── theme.service.ts         # Dark/light mode management
│   ├── components/      # Reusable UI components
│   │   ├── asset-card/       # Asset display card
│   │   ├── header/           # App header with search & theme toggle
│   │   ├── price-indicator/  # Color-coded price change badge
│   │   ├── search-bar/       # Debounced search with dropdown
│   │   └── sparkline-chart/  # Canvas-based mini chart
│   ├── pages/
│   │   └── dashboard/   # Main dashboard page
│   ├── app.ts           # Root component
│   ├── app.config.ts    # App providers (router, HTTP)
│   └── app.routes.ts    # Route definitions
├── environments/        # Environment-specific config
│   ├── environment.ts
│   └── environment.prod.ts
└── styles.scss          # Global styles & CSS variables
```

## How to Run

### Prerequisites
- Node.js 18+ and npm

### Install & Start
```bash
npm install
ng serve
```
Open http://localhost:4200 in your browser.

### Build for Production
```bash
ng build --configuration=production
```

## Architecture Notes

The codebase is structured for easy migration to other frameworks:

- **Business logic is isolated in services** — `CryptoApiService`, `WatchlistService`, and `ThemeService` contain all logic and can be ported to React hooks or vanilla JS modules
- **Components are small and focused** — Each has a single responsibility
- **No heavy dependencies** — Charts use native Canvas API, no Chart.js or D3
- **CSS variables for theming** — Theme system works independently of Angular
- **Models are plain TypeScript interfaces** — No framework coupling

## Configuration

Edit `src/environments/environment.ts` to customize:

| Setting | Default | Description |
|---------|---------|-------------|
| `cryptoApiBaseUrl` | `https://api.coingecko.com/api/v3` | CoinGecko API base URL |
| `pollingIntervalMs` | `10000` | Auto-refresh interval in ms |
| `defaultCryptoIds` | 8 popular coins | Default watchlist coins |

## License

MIT
