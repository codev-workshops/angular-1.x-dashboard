# malhar-angular-dashboard (React Migration)

Dashboard/widget framework — migrating from AngularJS 1.x to React 18 + TypeScript + Vite.

## Status

**Phase 3 complete**: All models ported, React components created with drag-and-drop (sortable), 8-direction resize handles, and widget settings modal. 115 passing tests.
Legacy AngularJS source preserved in `legacy/` for reference during migration.

## Tech Stack

- React 18, TypeScript 5, Vite 5
- @dnd-kit/core + @dnd-kit/sortable (drag-and-drop)
- Jest + @testing-library/react (unit tests)
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
    useResize.ts                 # 8-direction widget resize with marquee preview
  components/
    Widget/Widget.tsx            # Individual widget: resize handles, title editing, collapse, data model, drag handle
    Dashboard/Dashboard.tsx      # Main dashboard: drag-and-drop sorting, settings modal, toolbar, save state
    DashboardLayouts/            # Tab-based multi-layout management
    WidgetSettingsModal/         # Modal dialog for editing widget properties
legacy/                          # Original AngularJS source (reference only)
```

## Migration Phases

1. **Phase 1** — Core models + types + React hook wrapper
2. **Phase 2** — DashboardState, LayoutStorage models + Widget, Dashboard, DashboardLayouts components
3. **Phase 3 (current)** — Drag-and-drop (sortable), 8-direction resize, widget settings modal
4. Phase 4 — Cleanup legacy directory, final polish

## Original Project

Originally [DataTorrent/malhar-angular-dashboard](https://github.com/DataTorrent/malhar-angular-dashboard) — a generic AngularJS dashboard with drag-and-drop widgets, fluid layouts, and persistent storage.
