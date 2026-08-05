# React e2e parity report

The frozen Playwright suite (`e2e-playwright/`, unmodified) was run against the React port and
against the AngularJS reference app in the same environment, on the same day, with the same
command and the only difference being `E2E_BASE_URL`.

| | React | AngularJS reference | Baseline (`docs/E2E_BASELINE.md`) |
| --- | --- | --- | --- |
| Total tests | 35 | 35 | 35 |
| Ordinary passes | 31 | 31 | 31 |
| Expected failures (`test.fail()`) | 4 | 4 | 4 |
| Unexpected failures | 0 | 0 | 0 |
| Skipped | 0 | 0 | 0 |
| Playwright summary | `35 passed (56.7s)` | `35 passed (58.5s)` | `35 passed` |

**Verdict: exact parity. Zero deltas against the baseline, so there is no delta requiring a fix
or a pre-existing-failure justification.**

## How each run was produced

React (long-lived shell for the server):

```bash
cd web-react && npm run dev            # http://localhost:5173
cd e2e-playwright && E2E_BASE_URL=http://localhost:5173 npx playwright test --reporter=list
```

AngularJS reference:

```bash
node harness/serve-angular.js          # http://localhost:3000
cd e2e-playwright && E2E_BASE_URL=http://localhost:3000 npx playwright test --reporter=list
```

Browser: Chromium (Playwright 1.49.1), workers 1, retries 0, viewport 1280×720.

## Per-test results, side by side

`P` = ordinary pass, `XF` = expected failure (`test.fail()`, reported by Playwright as a pass).

| Spec › test | React | AngularJS | Baseline |
| --- | --- | --- | --- |
| custom-settings › renders both custom widget definitions and accepts the limit setting | P | P | P |
| custom-settings › uses the widget-specific modal template for the override widget | XF | XF | XF |
| dynamic › switches dynamic options between list and thumbnail DOM | P | P | P |
| dynamic › updates cart detail and summary consistently | P | P | P |
| explicit-save › defers localStorage writes until Save Changes is clicked | P | P | P |
| layouts-explicit-save › offers Save and Don’t Save choices when switching with unsaved changes | XF | XF | XF |
| layouts-explicit-save › dismisses unsaved changes without saving | XF | XF | XF |
| layouts › renders default tabs, switches layouts, creates, renames, and removes | P | P | P |
| layouts › keeps per-layout widget state and layout state across reloads | P | P | P |
| nav › renders the navbar brand and all route links | P | P | P |
| nav › navigates to `/` without console errors and shows its description | P | P | P |
| nav › navigates to `/resize` without console errors and shows its description | P | P | P |
| nav › navigates to `/custom-settings` without console errors and shows its description | P | P | P |
| nav › navigates to `/explicit-saving` without console errors and shows its description | P | P | P |
| nav › navigates to `/layouts` without console errors and shows its description | P | P | P |
| nav › navigates to `/layouts/explicit-saving` without console errors and shows its description | P | P | P |
| nav › navigates to `/dynamic-options` without console errors and shows its description | P | P | P |
| nav › navigates to `/dynamic-data` without console errors and shows its description | P | P | P |
| persistence › serializes only persisted widget fields and restores titles | P | P | P |
| persistence › discards malformed JSON and loads defaults | P | P | P |
| persistence › discards a stale hash and loads defaults | P | P | P |
| persistence › drops saved widgets missing from widget definitions | P | P | P |
| resize › renders the configured resizer handles | P | P | P |
| resize › resizes eastward with a marquee and persists the new width | P | P | P |
| resize › clamps the resizable width to its configured minimum | P | P | P |
| resize › tracks height with width for the ratio widget | XF | XF | XF |
| settings-modal › edits and persists a widget title | P | P | P |
| settings-modal › cancel and close leave the title unchanged | P | P | P |
| sortable › reorders widgets and persists the new order | P | P | P |
| title-edit › commits title with Enter and persists it | P | P | P |
| title-edit › commits title on blur | P | P | P |
| widgets › renders defaults and toolbar actions | P | P | P |
| widgets › adds, clears, and restores default widgets | P | P | P |
| widgets › removes and collapses widgets | P | P | P |
| widgets › prepends a widget from the demo link | P | P | P |

## Diff against the baseline

None. Every line of the baseline's spec inventory is reproduced: the same 31 ordinary passes,
the same 4 expected failures, no unexpected pass and no unexpected failure.

The three documented defects are still reproduced faithfully by the React port and therefore
still fail:

1. **Widget-specific settings modal.** `web-react/src/demo/pages/CustomSettingsDemo.tsx` keeps
   `settingsModalOptions.templateUrl = 'app/template/WidgetSpecificSettings.html'` verbatim.
   That key is deliberately absent from the modal registry, so the override widget's cog does
   not produce the requested modal — as in AngularJS.
2. **Layouts explicit-save confirmation.** The layouts sub-system keeps the unresolvable key
   `template/SaveChangesModal.html`, so switching layouts with unsaved changes renders no
   confirmation modal.
3. **Resize ratio height.** The React `/resize` page reproduces the AngularJS widget order,
   widget sizes and overall page height: at 1280×720, the ratio widget's `.e-resizer` is at
   y=1083.5, leaving a 363.5px margin below the 720px fold in both applications. The
   synthetic drag therefore never reaches it. The expected failure is preserved for the same
   layout reason as in AngularJS, not by special-casing.

## AngularJS re-run output

Because there were no deltas, no failure is being claimed as pre-existing. The AngularJS run is
recorded anyway as the control for the comparison above:

```
Running 35 tests using 1 worker

  ✓  1 [chromium] › custom-settings.spec.ts:7:7 › custom settings › renders both custom widget definitions and accepts the limit setting (1.3s)
  ✘  2 [chromium] › custom-settings.spec.ts:24:7 › custom settings › uses the widget-specific modal template for the override widget (5.8s)
  ✓  3 [chromium] › dynamic.spec.ts:7:7 › dynamic demos › switches dynamic options between list and thumbnail DOM (852ms)
  ✓  4 [chromium] › dynamic.spec.ts:18:7 › dynamic demos › updates cart detail and summary consistently (881ms)
  ✓  5 [chromium] › explicit-save.spec.ts:7:7 › explicit saving › defers localStorage writes until Save Changes is clicked (924ms)
  ✘  6 [chromium] › layouts-explicit-save.spec.ts:7:7 › layouts explicit saving › offers Save and Don’t Save choices when switching with unsaved changes (5.9s)
  ✘  7 [chromium] › layouts-explicit-save.spec.ts:22:7 › layouts explicit saving › dismisses unsaved changes without saving (16.0s)
  ✓  8 [chromium] › layouts.spec.ts:11:7 › dashboard layouts › renders default tabs, switches layouts, creates, renames, and removes (1.0s)
  ✓  9 [chromium] › layouts.spec.ts:32:7 › dashboard layouts › keeps per-layout widget state and layout state across reloads (1.6s)
  ✓  10 [chromium] › nav.spec.ts:18:7 › navigation › renders the navbar brand and all route links (738ms)
  ✓  11 [chromium] › nav.spec.ts:25:9 › navigation › navigates to / without console errors and shows its description (709ms)
  ✓  12 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /resize without console errors and shows its description (722ms)
  ✓  13 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /custom-settings without console errors and shows its description (712ms)
  ✓  14 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /explicit-saving without console errors and shows its description (708ms)
  ✓  15 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /layouts without console errors and shows its description (735ms)
  ✓  16 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /layouts/explicit-saving without console errors and shows its description (709ms)
  ✓  17 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /dynamic-options without console errors and shows its description (712ms)
  ✓  18 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /dynamic-data without console errors and shows its description (714ms)
  ✓  19 [chromium] › persistence.spec.ts:7:7 › dashboard persistence › serializes only persisted widget fields and restores titles (1.4s)
  ✓  20 [chromium] › persistence.spec.ts:25:7 › dashboard persistence › discards malformed JSON and loads defaults (723ms)
  ✓  21 [chromium] › persistence.spec.ts:31:7 › dashboard persistence › discards a stale hash and loads defaults (726ms)
  ✓  22 [chromium] › persistence.spec.ts:40:7 › dashboard persistence › drops saved widgets missing from widget definitions (731ms)
  ✓  23 [chromium] › resize.spec.ts:18:7 › resize demo › renders the configured resizer handles (765ms)
  ✓  24 [chromium] › resize.spec.ts:26:7 › resize demo › resizes eastward with a marquee and persists the new width (868ms)
  ✓  25 [chromium] › resize.spec.ts:45:7 › resize demo › clamps the resizable width to its configured minimum (858ms)
  ✘  26 [chromium] › resize.spec.ts:53:7 › resize demo › tracks height with width for the ratio widget (866ms)
  ✓  27 [chromium] › settings-modal.spec.ts:7:7 › widget settings modal › edits and persists a widget title (1.8s)
  ✓  28 [chromium] › settings-modal.spec.ts:22:7 › widget settings modal › cancel and close leave the title unchanged (1.6s)
  ✓  29 [chromium] › sortable.spec.ts:7:7 › sortable widgets › reorders widgets and persists the new order (1.5s)
  ✓  30 [chromium] › title-edit.spec.ts:7:7 › widget title editing › commits title with Enter and persists it (1.4s)
  ✓  31 [chromium] › title-edit.spec.ts:21:7 › widget title editing › commits title on blur (807ms)
  ✓  32 [chromium] › widgets.spec.ts:7:7 › simple dashboard widgets › renders defaults and toolbar actions (750ms)
  ✓  33 [chromium] › widgets.spec.ts:17:7 › simple dashboard widgets › adds, clears, and restores default widgets (891ms)
  ✓  34 [chromium] › widgets.spec.ts:28:7 › simple dashboard widgets › removes and collapses widgets (868ms)
  ✓  35 [chromium] › widgets.spec.ts:40:7 › simple dashboard widgets › prepends a widget from the demo link (761ms)

  35 passed (58.5s)
```

## React run output

```
Running 35 tests using 1 worker

  ✓  1 [chromium] › custom-settings.spec.ts:7:7 › custom settings › renders both custom widget definitions and accepts the limit setting (1.3s)
  ✘  2 [chromium] › custom-settings.spec.ts:24:7 › custom settings › uses the widget-specific modal template for the override widget (5.8s)
  ✓  3 [chromium] › dynamic.spec.ts:7:7 › dynamic demos › switches dynamic options between list and thumbnail DOM (856ms)
  ✓  4 [chromium] › dynamic.spec.ts:18:7 › dynamic demos › updates cart detail and summary consistently (865ms)
  ✓  5 [chromium] › explicit-save.spec.ts:7:7 › explicit saving › defers localStorage writes until Save Changes is clicked (942ms)
  ✘  6 [chromium] › layouts-explicit-save.spec.ts:7:7 › layouts explicit saving › offers Save and Don’t Save choices when switching with unsaved changes (5.9s)
  ✘  7 [chromium] › layouts-explicit-save.spec.ts:22:7 › layouts explicit saving › dismisses unsaved changes without saving (15.9s)
  ✓  8 [chromium] › layouts.spec.ts:11:7 › dashboard layouts › renders default tabs, switches layouts, creates, renames, and removes (957ms)
  ✓  9 [chromium] › layouts.spec.ts:32:7 › dashboard layouts › keeps per-layout widget state and layout state across reloads (1.5s)
  ✓  10 [chromium] › nav.spec.ts:18:7 › navigation › renders the navbar brand and all route links (733ms)
  ✓  11 [chromium] › nav.spec.ts:25:9 › navigation › navigates to / without console errors and shows its description (708ms)
  ✓  12 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /resize without console errors and shows its description (731ms)
  ✓  13 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /custom-settings without console errors and shows its description (708ms)
  ✓  14 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /explicit-saving without console errors and shows its description (721ms)
  ✓  15 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /layouts without console errors and shows its description (698ms)
  ✓  16 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /layouts/explicit-saving without console errors and shows its description (706ms)
  ✓  17 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /dynamic-options without console errors and shows its description (708ms)
  ✓  18 [chromium] › nav.spec.ts:25:9 › navigation › navigates to /dynamic-data without console errors and shows its description (736ms)
  ✓  19 [chromium] › persistence.spec.ts:7:7 › dashboard persistence › serializes only persisted widget fields and restores titles (1.4s)
  ✓  20 [chromium] › persistence.spec.ts:25:7 › dashboard persistence › discards malformed JSON and loads defaults (731ms)
  ✓  21 [chromium] › persistence.spec.ts:31:7 › dashboard persistence › discards a stale hash and loads defaults (725ms)
  ✓  22 [chromium] › persistence.spec.ts:40:7 › dashboard persistence › drops saved widgets missing from widget definitions (730ms)
  ✓  23 [chromium] › resize.spec.ts:18:7 › resize demo › renders the configured resizer handles (755ms)
  ✓  24 [chromium] › resize.spec.ts:26:7 › resize demo › resizes eastward with a marquee and persists the new width (845ms)
  ✓  25 [chromium] › resize.spec.ts:45:7 › resize demo › clamps the resizable width to its configured minimum (848ms)
  ✘  26 [chromium] › resize.spec.ts:53:7 › resize demo › tracks height with width for the ratio widget (865ms)
  ✓  27 [chromium] › settings-modal.spec.ts:7:7 › widget settings modal › edits and persists a widget title (1.5s)
  ✓  28 [chromium] › settings-modal.spec.ts:22:7 › widget settings modal › cancel and close leave the title unchanged (921ms)
  ✓  29 [chromium] › sortable.spec.ts:7:7 › sortable widgets › reorders widgets and persists the new order (1.4s)
  ✓  30 [chromium] › title-edit.spec.ts:7:7 › widget title editing › commits title with Enter and persists it (1.4s)
  ✓  31 [chromium] › title-edit.spec.ts:21:7 › widget title editing › commits title on blur (799ms)
  ✓  32 [chromium] › widgets.spec.ts:7:7 › simple dashboard widgets › renders defaults and toolbar actions (753ms)
  ✓  33 [chromium] › widgets.spec.ts:17:7 › simple dashboard widgets › adds, clears, and restores default widgets (852ms)
  ✓  34 [chromium] › widgets.spec.ts:28:7 › simple dashboard widgets › removes and collapses widgets (847ms)
  ✓  35 [chromium] › widgets.spec.ts:40:7 › simple dashboard widgets › prepends a widget from the demo link (755ms)

  35 passed (57.3s)
```

A second, independent React run of the whole suite reported `35 passed (56.7s)` with the same
breakdown, so the result is stable and not a one-off.

## `web-react/` scripts

| Script | Result |
| --- | --- |
| `npm run build` | pass |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm run test` | pass — 41 files, 191 tests |
