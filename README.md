# malhar-angular-dashboard (React Migration)

Dashboard/widget framework — migrating from AngularJS 1.x to React 18 + TypeScript + Vite.

## Status

**Phase 1 complete**: Core model layer ported (WidgetDataModel, WidgetDefCollection, WidgetModel) with full test coverage.
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
    WidgetDataModel.spec.ts
    WidgetDefCollection.ts       # Widget definition registry
    WidgetDefCollection.spec.ts
    WidgetModel.ts               # Widget instance model
    WidgetModel.spec.ts
  hooks/
    useWidgetData.ts             # React hook for data model lifecycle
  components/
    Widget/                      # (future) Widget component
    Dashboard/                   # (future) Dashboard component
    DashboardLayouts/            # (future) Layout management
legacy/                          # Original AngularJS source (reference only)
```

## Migration Phases

1. **Phase 1 (current)** — Core models + types + React hook wrapper
2. Phase 2 — Widget component, Dashboard component, DashboardLayouts
3. Phase 3 — Storage, drag-and-drop, resize, settings modals
4. Phase 4 — Cleanup legacy directory, final polish

## Original Project

Originally [DataTorrent/malhar-angular-dashboard](https://github.com/DataTorrent/malhar-angular-dashboard) — a generic AngularJS dashboard with drag-and-drop widgets, fluid layouts, and persistent storage.
