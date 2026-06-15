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
- **Lodash** — used for `merge`, `cloneDeep`, `has`, `endsWith`, `max`, `pick` (carried over from original AngularJS codebase)
- **No `structuredClone`** — use `_.cloneDeep` instead (jsdom test environment doesn't support `structuredClone`)

## Architecture

- `src/types/index.ts` — shared TypeScript interfaces (WidgetDefinition, DashboardOptions, etc.)
- `src/models/` — pure TypeScript classes (no React dependency), ported from AngularJS
- `src/hooks/` — React hooks wrapping model classes
- `src/components/` — React components (future phases)
- `legacy/` — original AngularJS source for reference during migration

## Migration Status

Phase 1 complete: WidgetDataModel, WidgetDefCollection, WidgetModel ported with tests.
