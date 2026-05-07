# AGENTS.md

## Project Overview

React dashboard application converted from AngularJS 1.x. Built with React 18, Vite 5, and JavaScript (no TypeScript).

## Development

```bash
npm install
npm run dev      # Start dev server (Vite, typically http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

- **Component Registry Pattern**: Widget content is rendered by looking up React components from `src/widgets/registry.js` by directive name or templateUrl. No dynamic compilation.
- **DataModel Classes**: Plain JS classes in `src/models/` provide data to widgets via a `setWidgetData` callback (replaces Angular `$scope`).
- **Routing**: `react-router-dom` with `HashRouter` — all routes use `/#/` prefix.
- **State**: Dashboard state persists to `localStorage`. Layouts use `LayoutStorage` model.
- **Drag-and-Drop**: `@dnd-kit/core` + `@dnd-kit/sortable` for widget reordering.
- **Styling**: Bootstrap 3.3.7 CSS + LESS files in `src/styles/`. Vite handles LESS natively.
- **Modals**: `react-bootstrap` Modal components replace Angular `$uibModal`.

## Key Directories

| Path | Purpose |
|------|---------|
| `src/components/` | Core components: Dashboard, Widget, DashboardLayouts, modals |
| `src/models/` | Plain JS model classes (no framework dependency) |
| `src/pages/` | One page component per demo route |
| `src/widgets/` | Widget content components + registry |
| `src/styles/` | LESS stylesheets |

## Conventions

- All new `.js`/`.jsx` files must include the Apache 2.0 license header (see CONTRIBUTING.md).
- Functional React components with hooks (no class components).
- No TypeScript, no jQuery, no Angular code.
- Widget definitions use `name`, `directive`, or `templateUrl` to map to registry entries.
- `dataModelType` and `dataModelArgs` are never deep-cloned (they contain class references).

## Docker

Multi-stage build: `node:20-alpine` for build, `nginx:alpine` for serving.

```bash
docker build -t react-dashboard .
docker run -p 8080:80 react-dashboard
```
