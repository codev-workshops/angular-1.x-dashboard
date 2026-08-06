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

The complete Chromium run is **45 tests passed** across 11 spec files:

- `navigation.spec.ts` — 3
- `widgets.spec.ts` — 6
- `reorder.spec.ts` — 1
- `resize.spec.ts` — 4
- `settings-modal.spec.ts` — 4
- `explicit-save.spec.ts` — 3
- `layouts.spec.ts` — 7
- `layouts-explicit-save.spec.ts` — 3
- `dynamic-options.spec.ts` — 2
- `dynamic-data.spec.ts` — 5
- `persistence.spec.ts` — 7

Command and result:

```text
$ npx playwright test --reporter=line --workers=4
Running 45 tests using 4 workers
45 passed (12.4s)
```

The suite uses hash routes and only the migration DOM/CSS contract. It uses
incremental mouse sequences for sortable reorder and resize interactions.

## Legacy behavior notes

- The layouts explicit-save demo displays the `save changes (1)` state after a
  dashboard change, but switching layouts proceeds directly without showing
  the described “Unsaved Changes” modal. The parity suite records this actual
  behavior.
- The default custom-settings modal accepts OK but the legacy widget title
  remains unchanged; the suite records the actual result.
- In the layouts demo, Layout 3 is intentionally unlocked and has a remove
  icon, while Layout 1 and Layout 2 are locked.
- The legacy override modal template uses a differently cased filename on
  disk. The reproducible server supplies the case-compatible URL mapping needed
  on Linux.
