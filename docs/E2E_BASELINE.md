# Frozen Playwright E2E baseline

**FROZEN — this suite must not be modified for the React migration.**

- Date: 2026-08-05T10:49:46Z
- Commit SHA: `774e69e0b31ce344605e2aae5695c2d7ae5b90c4`
- Application: AngularJS harness
- Application URL: `http://localhost:3000`
- Start command: `node harness/serve-angular.js`
- Test command:
  `cd e2e-playwright && npm test -- --reporter=list`
- Browser: Chromium
- Workers: 1
- Total tests: 35
- Result: 31 ordinary PASS, 4 expected FAIL, 0 unexpected FAIL, 0 SKIP
- Playwright summary: `35 passed` because all four expected failures use `test.fail()`

The same suite must run unchanged against the React application with only
`E2E_BASE_URL` changed.

## Spec inventory

### `custom-settings.spec.ts`

- PASS — renders both custom widget definitions and accepts the limit setting
- FAIL (expected/pre-existing) — uses the widget-specific modal template for the override widget

### `dynamic.spec.ts`

- PASS — switches dynamic options between list and thumbnail DOM
- PASS — updates cart detail and summary consistently

### `explicit-save.spec.ts`

- PASS — defers localStorage writes until Save Changes is clicked

### `layouts-explicit-save.spec.ts`

- FAIL (expected/pre-existing) — offers Save and Don’t Save choices when switching with unsaved changes
- FAIL (expected/pre-existing) — dismisses unsaved changes without saving

### `layouts.spec.ts`

- PASS — renders default tabs, switches layouts, creates, renames, and removes
- PASS — keeps per-layout widget state and layout state across reloads

### `nav.spec.ts`

- PASS — renders the navbar brand and all route links
- PASS — navigates to `/` without console errors and shows its description
- PASS — navigates to `/resize` without console errors and shows its description
- PASS — navigates to `/custom-settings` without console errors and shows its description
- PASS — navigates to `/explicit-saving` without console errors and shows its description
- PASS — navigates to `/layouts` without console errors and shows its description
- PASS — navigates to `/layouts/explicit-saving` without console errors and shows its description
- PASS — navigates to `/dynamic-options` without console errors and shows its description
- PASS — navigates to `/dynamic-data` without console errors and shows its description

### `persistence.spec.ts`

- PASS — serializes only persisted widget fields and restores titles
- PASS — discards malformed JSON and loads defaults
- PASS — discards a stale hash and loads defaults
- PASS — drops saved widgets missing from widget definitions

### `resize.spec.ts`

- PASS — renders the configured resizer handles
- PASS — resizes eastward with a marquee and persists the new width
- PASS — clamps the resizable width to its configured minimum
- FAIL (expected/pre-existing) — tracks height with width for the ratio widget

### `settings-modal.spec.ts`

- PASS — edits and persists a widget title
- PASS — cancel and close leave the title unchanged

### `sortable.spec.ts`

- PASS — reorders widgets and persists the new order

### `title-edit.spec.ts`

- PASS — commits title with Enter and persists it
- PASS — commits title on blur

### `widgets.spec.ts`

- PASS — renders defaults and toolbar actions
- PASS — adds, clears, and restores default widgets
- PASS — removes and collapses widgets
- PASS — prepends a widget from the demo link

## 4 pre-existing AngularJS failures

These are intentionally represented with `test.fail()` and are part of the
frozen baseline:

1. **Widget-specific settings modal** — `src/app/customWidgetSettings.js`
   references `app/template/WidgetSpecificSettings.html`, but that file is not
   present. The actual source template is
   `src/app/template/customSettingsTemplate.html`. The override widget's cog
   therefore does not produce the requested modal.
2. **Layouts explicit-save confirmation** —
   `src/components/directives/dashboardLayouts/dashboardLayouts.js` references
   `template/SaveChangesModal.html`, but the available source file is
   `src/components/directives/dashboardLayouts/SaveChangesModal.html`. Switching
   layouts with unsaved changes consequently does not render the confirmation
   modal.
3. **Resize ratio height** — the resize demo includes a widget with
   `heightToWidthRatio`, but an east-edge width drag does not change its
   rendered content height in the AngularJS app. The contract records this
   existing behavior as an expected failure.

No unexpected test failures remained in the baseline run.

## Clean-clone reproduction

Reproduced from a clean clone of branch `migrate/react`:

- Clone SHA: `bb2c1a094f4f44f438d4fed7e2640b44a758fe1c`
- Scratch directory: `/tmp/angular-baseline-clean`
- Dependency setup:

  ```bash
  npm ci --prefix harness
  npm ci --prefix e2e-playwright
  cd e2e-playwright
  npx playwright install chromium
  cd ..
  node harness/serve-angular.js
  cd e2e-playwright
  npm test -- --reporter=list
  ```

- Measured setup times in the verification environment:
  - `harness` `npm ci`: 1.08s
  - `e2e-playwright` `npm ci`: 0.62s
  - `npx playwright install chromium`: 0.47s (browser cache hit)
  - Test suite: 60.1s
- Reproduction result: 31 ordinary passes, 4 expected failures, 0 unexpected
  failures, 0 skipped; Playwright reported `35 passed`.
