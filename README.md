# malhar-angular-dashboard (React Migration)

Dashboard/widget framework — migrating from AngularJS 1.x to React 18 + TypeScript + Vite.

## Status

**Phase 2 complete**: All models ported (WidgetDataModel, WidgetDefCollection, WidgetModel, DashboardState, LayoutStorage) and React components created (Widget, Dashboard, DashboardLayouts) with 72 passing tests.
Legacy AngularJS source preserved in `legacy/` for reference during migration.

## Tech Stack

- React 18, TypeScript 5, Vite 5
- Jest + ts-jest (unit tests)
- ESLint 8 + eslint-plugin-react
- Lodash (carried over from original)

## Getting Started

```bash
npm install
npm run dev       # Vite dev server
npm run build     # TypeScript check + Vite production build
npm test          # Jest unit tests
npm run lint      # ESLint
```

## Project Structure

```
src/
  types/index.ts                 # Shared TypeScript interfaces
  models/
    WidgetDataModel.ts           # Base data model class
    WidgetDefCollection.ts       # Widget definition registry
    WidgetModel.ts               # Widget instance model
    DashboardState.ts            # Persistence: save/load widget state
    LayoutStorage.ts             # Multiple dashboard layout management
  hooks/
    useWidgetData.ts             # React hook for data model lifecycle
  components/
    Widget/Widget.tsx            # Individual widget container with title editing, collapse, data model
    Dashboard/Dashboard.tsx      # Main dashboard: add/remove widgets, toolbar, save state
    DashboardLayouts/            # Tab-based multi-layout management
legacy/                          # Original AngularJS source (reference only)
```

## Migration Phases

1. **Phase 1** — Core models + types + React hook wrapper
2. **Phase 2 (current)** — DashboardState, LayoutStorage models + Widget, Dashboard, DashboardLayouts components
3. Phase 3 — Drag-and-drop (sortable), resize, settings modals
4. Phase 4 — Cleanup legacy directory, final polish

## Original Project

Originally [DataTorrent/malhar-angular-dashboard](https://github.com/DataTorrent/malhar-angular-dashboard) — a generic AngularJS dashboard with drag-and-drop widgets, fluid layouts, and persistent storage.
