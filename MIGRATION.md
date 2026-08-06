# AngularJS to React Migration

## Phase -1 legacy baseline

The untouched AngularJS application has a legacy unit baseline of **306 tests:
305 passing and 1 failing**. The known failure is:

`Directive: dashboard the openWidgetSettings function should emit a "widgetChanged" event on the childScope when the modal promise is called`

The parity gate runs against the legacy application with:

```bash
npm run test:e2e:legacy
```

This starts the reproducible in-repository server with
`E2E_WEB_SERVER_CMD="node tools/legacy-serve/server.js"`. To use another
implementation, start its server separately and set `E2E_BASE_URL`, or provide
both `E2E_BASE_URL` and `E2E_WEB_SERVER_CMD` for Playwright to start it.
React phases should point these variables at the React dev server (for example,
Vite), without changing the parity specs.

The legacy server can also be started directly:

```bash
node tools/legacy-serve/server.js
E2E_BASE_URL=http://127.0.0.1:8000 npm run test:e2e
```

## Green parity run

The complete Chromium run is **48 tests passed** across 11 spec files:

### `navigation.spec.ts` — 3

- all hash routes render their description and dashboard
- navbar links navigate using hash routes
- unknown hash redirects to the root route

### `widgets.spec.ts` — 7

- default widgets render with expected count and labels
- each widget button adds its widget type
- a widget can be removed
- a widget can collapse and expand
- widget title editing persists after submit
- Clear empties the dashboard and Default Widgets restores it
- prependWidget inserts a Prepend Widget at position zero

### `reorder.spec.ts` — 1

- real mouse drag reorders widgets and survives reload

### `resize.spec.ts` — 4

- east resize shows a marquee, changes width, and persists
- minWidth prevents a widget from shrinking below its minimum
- heightToWidthRatio widget maintains approximately one quarter height
- vertical handles are present for the resize demo widgets

### `settings-modal.spec.ts` — 5

- widget-level onSettingsClose ignores Title changes on OK
- dashboard-level onSettingsClose applies a title and persists it
- Cancel and close discard modal edits
- configurable widget exposes limit partial and changing it takes effect
- override modal widget opens its override template

### `explicit-save.spec.ts` — 3

- save button starts all saved and disabled
- saveable changes increment, save resets, and saved state survives reload
- unsaved changes are lost on reload

### `layouts.spec.ts` — 7

- three default layout tabs render with Layout 1 active
- switching tabs swaps the active dashboard
- plus creates a Custom layout and activates it
- a custom layout can be renamed and rejects blank title
- a removable custom layout is removed and previous layout activates
- locked default layouts have no remove icon and are not renameable
- layout state and active tab persist across reload

### `layouts-explicit-save.spec.ts` — 3

- switching with unsaved changes opens the Save Changes modal
- Save saves changes then switches layouts
- Don't Save switches without saving the current dashboard

### `dynamic-options.spec.ts` — 2

- List and Thumbnail toggles recreate the widget and active button is disabled
- dynamic options toolbar is hidden

### `dynamic-data.spec.ts` — 5

- both cart widgets render
- valid item updates detail and summary metrics
- same item merges quantity and recomputes unit price
- invalid submits are rejected without changing the cart
- Auto Fill Cart adds six items and removing one recomputes totals

### `persistence.spec.ts` — 8

- root widget state round-trips through localStorage
- layout state round-trips through localStorage
- edited widget title round-trips through localStorage
- collapse state is not persisted by WidgetModel serialization
- stale dashboard state falls back to default widgets
- malformed dashboard state falls back to default widgets
- stale layout state falls back to default layouts
- malformed layout state falls back to default layouts

Command and result:

```text
$ npx playwright test --reporter=line --workers=4
Running 45 tests using 4 workers
48 passed (10.7s)
```

The suite uses hash routes and only the migration DOM/CSS contract. It uses
incremental mouse sequences for sortable reorder and resize interactions.

## Legacy behavior notes

- The committed distribution contains the SaveChangesModal template under the
  component path, not a flattened `template/SaveChangesModal.html` entry.
  Before the server fix, switching layouts requested that flattened URL and
  received a 404. The in-repository server now recursively maps every
  `/template/<basename>` request to matching app/component partials. Network
  verification shows `200` for `/template/SaveChangesModal.html`, and the
  untouched app opens the modal.
- The modal title and actions work as expected. Its body renders “You have
  unsaved changes...” but the numeric interpolation is blank because the
  untouched legacy template reads `layout.dashboard.unsavedChangeCount`, while
  the count is held elsewhere. The suite records this real legacy rendering
  discrepancy without weakening modal/action coverage.
- The default custom-settings modal accepts OK but the legacy widget title
  remains unchanged; the suite records the actual result.
- In the layouts demo, Layout 3 is intentionally unlocked and has a remove
  icon, while Layout 1 and Layout 2 are locked.
- The legacy override modal template uses a differently cased filename on
  disk. The reproducible server supplies the case-compatible URL mapping needed
  on Linux.
- `WidgetModel.serialize()` stores `title`, `name`, `style`, `size`, and related
  fields, but not `contentStyle`; collapse/expand therefore resets after reload.
