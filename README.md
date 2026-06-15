# malhar-angular-dashboard (React Migration)

Dashboard/widget framework — fully migrated from AngularJS 1.x to React 18 + TypeScript + Vite.

## Status

**Migration complete (Phase 4)**. All models, components, and interactive features ported. Legacy AngularJS source removed. 121 tests passing.

## Tech Stack

- React 18, TypeScript 5, Vite 5
- @dnd-kit/core + @dnd-kit/sortable (drag-and-drop)
- Jest + @testing-library/react (unit tests)
- ESLint 8 + eslint-plugin-react
- Lodash (carried over from original)

## Getting Started

```bash
npm install
npm run dev       # Vite dev server (HMR)
npm run build     # TypeScript check + Vite production build
npm test          # Jest unit tests
npm run lint      # ESLint
```

## Project Structure

```
src/
  index.ts                         # Barrel export for all public API
  styles/dashboard.css             # Styles for widgets, resize handles, modals, layout tabs
  types/index.ts                   # Shared TypeScript interfaces
  models/
    WidgetDataModel.ts             # Base data model class
    WidgetDefCollection.ts         # Widget definition registry
    WidgetModel.ts                 # Widget instance model (size, style, serialize)
    DashboardState.ts              # Persistence: save/load widget state
    LayoutStorage.ts               # Multiple dashboard layout management
  hooks/
    useWidgetData.ts               # React hook for data model lifecycle
    useResize.ts                   # 8-direction widget resize with marquee preview
  components/
    Widget/                        # Individual widget: resize handles, drag handle, title editing, collapse
    Dashboard/                     # Main dashboard: drag-and-drop sorting, settings modal, toolbar
    DashboardLayouts/              # Tab-based multi-layout management with save confirmation
    WidgetSettingsModal/           # Modal for editing widget properties
    SaveChangesModal/              # Confirmation modal for unsaved layout changes
```

## Features

- **Drag-and-drop widget reordering** — powered by @dnd-kit, drag via widget header
- **8-direction resize** — nw/n/ne/w/e/sw/s/se with marquee preview, min/max constraints, aspect ratio support
- **Widget settings modal** — edit title and custom properties, deep-cloned state
- **Save changes modal** — confirmation when switching layouts with unsaved changes
- **Persistent storage** — sync/async storage with hash-based cache invalidation
- **Multi-layout tabs** — create, rename, remove, and switch between dashboard layouts
- **Explicit save mode** — optional manual save with unsaved change counter

## Original Project

Originally [DataTorrent/malhar-angular-dashboard](https://github.com/DataTorrent/malhar-angular-dashboard) — a generic AngularJS dashboard with drag-and-drop widgets, fluid layouts, and persistent storage.
