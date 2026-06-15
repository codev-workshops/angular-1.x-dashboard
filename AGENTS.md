# AGENTS.md

## Project Overview

React 18 + TypeScript + Vite migration of an AngularJS 1.x dashboard framework.

## Build & Development

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server (HMR)
npm run build        # tsc && vite build — must exit 0
npm test             # Jest unit tests
npm run lint         # ESLint --ext .ts,.tsx src/
```

## Key Conventions

- **TypeScript strict mode** — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Test files** — co-located as `*.spec.ts` / `*.spec.tsx` next to source files (test files excluded from `tsc` build via tsconfig `exclude`)
- **Jest** — ts-jest preset, jsdom environment
- **Lodash** — used for `merge`, `cloneDeep`, `has`, `endsWith`, `max`, `pick`, `map`, `clone` (carried over from original AngularJS codebase)
- **No `structuredClone`** — use `_.cloneDeep` instead (jsdom test environment doesn't support `structuredClone`)
- **No `hasOwnProperty` directly** — use `Object.prototype.hasOwnProperty.call(obj, key)` (ESLint no-prototype-builtins rule)
- **No `react-hooks/exhaustive-deps`** — plugin not installed; don't add eslint-disable comments for it

## Architecture

- `src/types/index.ts` — shared TypeScript interfaces (WidgetDefinition, DashboardOptions, StorageInterface, etc.)
- `src/models/` — pure TypeScript classes (no React dependency), ported from AngularJS
  - `WidgetDataModel` — base data model class
  - `WidgetDefCollection` — widget definition registry
  - `WidgetModel` — widget instance with size/style management
  - `DashboardState` — save/load widget state to/from storage
  - `LayoutStorage` — multiple dashboard layout persistence
- `src/hooks/`
  - `useWidgetData.ts` — React hook wrapping WidgetDataModel lifecycle
  - `useResize.ts` — 8-direction widget resize with marquee preview (ported from DashboardWidgetCtrl.js `grabResizer`)
- `src/components/`
  - `Widget/` — individual widget with resize handles (8 directions), drag handle (via `dragListeners` prop), title editing, collapse toggle, data model lifecycle
  - `Dashboard/` — main dashboard: @dnd-kit sortable drag-and-drop, settings modal integration, add/remove/clear widgets, toolbar, save state
  - `DashboardLayouts/` — tab-based multi-layout management
  - `WidgetSettingsModal/` — modal dialog for editing widget title and properties (replaces `$uibModal` + `WidgetSettingsCtrl`)
- `legacy/` — original AngularJS source for reference during migration

## Migration Status

Phase 3 complete: Drag-and-drop sorting (@dnd-kit), 8-direction resize handles (useResize hook), widget settings modal. 115 tests passing.

## Dependencies Added in Phase 3

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — widget drag-and-drop reordering
