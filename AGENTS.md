# AGENTS.md

## Project Overview

React 18 + TypeScript + Vite dashboard/widget framework. Fully migrated from AngularJS 1.x.

## Build & Development

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server (HMR)
npm run build        # tsc && vite build — must exit 0
npm test             # Jest unit tests (121 tests)
npm run lint         # ESLint --ext .ts,.tsx src/
```

## Key Conventions

- **TypeScript strict mode** — `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Test files** — co-located as `*.spec.ts` / `*.spec.tsx` next to source files (excluded from `tsc` build via tsconfig `exclude`)
- **Jest** — ts-jest preset, jsdom environment, testMatch includes `.spec.ts` and `.spec.tsx`
- **Lodash** — used for `merge`, `cloneDeep`, `has`, `endsWith`, `max`, `pick`, `map`, `clone`
- **No `structuredClone`** — use `_.cloneDeep` instead (jsdom test environment doesn't support `structuredClone`)
- **No `hasOwnProperty` directly** — use `Object.prototype.hasOwnProperty.call(obj, key)` (ESLint no-prototype-builtins rule)
- **No `react-hooks/exhaustive-deps`** — plugin not installed; don't add eslint-disable comments for it
- **CSS** — all dashboard styles in `src/styles/dashboard.css`, imported in `main.tsx`

## Architecture

- `src/index.ts` — barrel export for all public components, models, hooks, and types
- `src/types/index.ts` — shared TypeScript interfaces (WidgetDefinition, DashboardOptions, StorageInterface, etc.)
- `src/models/` — pure TypeScript classes (no React dependency)
  - `WidgetDataModel` — base data model class
  - `WidgetDefCollection` — widget definition registry
  - `WidgetModel` — widget instance with size/style management, auto-incrementing `_id` for stable React keys
  - `DashboardState` — save/load widget state to/from storage
  - `LayoutStorage` — multiple dashboard layout persistence
- `src/hooks/`
  - `useWidgetData.ts` — React hook wrapping WidgetDataModel lifecycle
  - `useResize.ts` — 8-direction widget resize with marquee preview (ported from legacy `grabResizer`)
- `src/components/`
  - `Widget/` — resize handles (8 directions), drag handle (`dragListeners` prop), title editing, collapse toggle, data model lifecycle
  - `Dashboard/` — @dnd-kit sortable drag-and-drop, settings modal integration, toolbar, save state
  - `DashboardLayouts/` — tab-based multi-layout management with `SaveChangesModal` for unsaved changes confirmation
  - `WidgetSettingsModal/` — modal for editing widget title and properties (replaces `$uibModal` + `WidgetSettingsCtrl`)
  - `SaveChangesModal/` — confirmation modal for unsaved layout changes (replaces `SaveChangesModalCtrl`)

## Migration Status

Phase 4 complete: Migration finished. Legacy AngularJS source removed. All features ported. 121 tests passing.

## Dependencies

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — widget drag-and-drop reordering
- `@testing-library/react`, `@testing-library/jest-dom` — component testing
- `lodash` — utility functions (carried over from original codebase)
