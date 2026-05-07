React Dashboard
====================

Modern React application providing dashboard/widgets functionality. Converted from the original AngularJS 1.x [malhar-angular-dashboard](https://github.com/DataTorrent/malhar-angular-dashboard).

Built with **React 18 + Vite + JavaScript** (no TypeScript).

Features:
---------

 - Adding/removing widgets

 - Widgets are instantiated dynamically via a component registry

 - Widgets drag and drop (with @dnd-kit)

 - Horizontal and vertical widgets resize

 - Fluid layout (widgets can have percentage-based width, or have width set in any other unit)

 - Any React component can be a widget

 - Connecting widgets to real-time data via DataModel classes

 - Changing widget data source dynamically (from widget options)

 - Saving widgets state to localStorage

 - Multiple Dashboard Layouts with tab UI

Contributing
------------

This project welcomes new contributors.

You acknowledge that your submissions to DataTorrent on this repository are made pursuant the terms of the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html) and constitute "Contributions," as defined therein, and you represent and warrant that you have the right and authority to do so.

When **adding new javascript files**, please prepend the Apache v2.0 license header, which can be found in [CONTRIBUTING.md file](CONTRIBUTING.md).


Tech Stack
----------

- **React 18** — UI framework
- **Vite** — Build tool and dev server
- **react-router-dom** — Client-side routing (HashRouter)
- **react-bootstrap** + **Bootstrap 3.3.7** — UI components and styling
- **@dnd-kit** — Drag and drop for widget reordering
- **lodash** — Utility library
- **LESS** — CSS preprocessor (Vite-native support)

Demo Routes
-----------

| Route | Description |
|-------|-------------|
| `/#/simple` | Basic dashboard with add/remove/reorder widgets |
| `/#/resize` | Fluid, resizable, and fixed-ratio widgets |
| `/#/custom-settings` | Custom widget settings modal |
| `/#/explicit-saving` | Manual save with unsaved change counter |
| `/#/layouts` | Multiple dashboard layouts with tabs |
| `/#/layouts/explicit-saving` | Layouts with explicit save mode |
| `/#/dynamic-options` | Dynamic widget options (people list/thumbnail toggle) |
| `/#/dynamic-data` | Shopping cart with shared data model |

Getting Started
---------------

### Prerequisites

- Node.js 20+ (recommended)

### Install and Run

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173/` (or next available port).

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder.

### Docker

```bash
docker build -t react-dashboard .
docker run -p 8080:80 react-dashboard
```

Project Structure
-----------------

```
src/
  components/       # Core React components
    Dashboard.jsx         # Main dashboard with widget management
    DashboardLayouts.jsx  # Multi-layout tab container
    Widget.jsx            # Individual widget panel with resize
    WidgetSettingsModal.jsx
    SaveChangesModal.jsx
  models/           # Plain JS model classes
    WidgetDataModel.js    # Base data model
    WidgetModel.js        # Widget instance model
    WidgetDefCollection.js # Widget definition collection
    DashboardState.js     # Dashboard state management
    LayoutStorage.js      # Layout persistence
    RandomDataModel.js    # Random data source
    CartDataModel.js      # Shopping cart data model
  pages/            # Route page components (one per demo)
  widgets/          # Widget content components
    registry.js           # Maps widget names to React components
  styles/           # LESS stylesheets
  App.jsx           # Root app with routing and navbar
  main.jsx          # Entry point
```

### dashboardOptions

The `dashboardOptions` object is passed to the `<Dashboard>` component:

| key | type | required | description |
| --- | ---- | -------- | ----------- |
| widgetDefinitions | Array | yes | Widget Definition Objects |
| defaultWidgets | Array | yes | Default widget instances `{ name: '...' }` |
| widgetButtons | Boolean | no | Show add/remove widget buttons |
| storage | Object | no | Object with `getItem`/`setItem`/`removeItem` (e.g. `localStorage`) |
| storageId | String | no | Key for storage |
| storageHash | String | no | Hash to invalidate stale stored state |
| explicitSave | Boolean | no | Require manual save |
| hideWidgetSettings | Boolean | no | Hide the settings cog icon |
| hideWidgetClose | Boolean | no | Hide the close button |

### DataModel Pattern

Data models are plain JS classes extending `WidgetDataModel`. Instead of Angular `$scope`, they receive a `setWidgetData` callback (from React `useState`) to trigger re-renders:

```js
import WidgetDataModel from './WidgetDataModel';

class MyDataModel extends WidgetDataModel {
  init() {
    this.interval = setInterval(() => {
      this.updateData({ value: Math.random() });
    }, 1000);
  }
  destroy() {
    clearInterval(this.interval);
  }
}
```

### Widget Registry

The widget registry (`src/widgets/registry.js`) maps widget names and template URLs to React components. To add a new widget, create a component in `src/widgets/`, register it in `registry.js`, and reference it by name in your widget definitions.

### Persistence

Dashboard state is saved to `localStorage` by default. The storage interface expects `getItem(key)`, `setItem(key, value)`, and `removeItem(key)` methods.

License
-------

Apache License, Version 2.0

Links
-----

[Original AngularJS Dashboard](https://github.com/DataTorrent/malhar-angular-dashboard)

[React](https://react.dev/) | [Vite](https://vitejs.dev/) | [@dnd-kit](https://dndkit.com/) | [react-bootstrap](https://react-bootstrap.github.io/)
