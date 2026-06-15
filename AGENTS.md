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
- **Test files** — co-located as `*.spec.ts` next to source files
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
- `src/hooks/useWidgetData.ts` — React hook wrapping WidgetDataModel lifecycle
- `src/components/`
  - `Widget/` — individual widget container with title editing, collapse toggle, data model lifecycle
  - `Dashboard/` — main dashboard: add/remove/clear widgets, toolbar, save state, load from storage
  - `DashboardLayouts/` — tab-based multi-layout management
- `legacy/` — original AngularJS source for reference during migration

## Migration Status

Phase 2 complete: DashboardState, LayoutStorage models + Widget, Dashboard, DashboardLayouts React components. 72 tests passing.
