# Migration child-session brief

You are one of several sessions migrating this AngularJS 1.x dashboard framework to React,
coordinated by an orchestrator session. This file holds the rules that apply to **all** of us.
Your own prompt adds the scope: your owned files, your behavioural spec, your acceptance criteria.

## Read these first, in this order

1. `docs/MIGRATION_PATTERN.md` — the binding design contract. Non-negotiable.
2. `docs/E2E_BASELINE.md` — the frozen e2e baseline and its three documented pre-existing failures.
3. The spec files under `e2e-playwright/specs/` that cover your scope. Implement against them.
4. The AngularJS source files named in your scope.

**The AngularJS app is the oracle.** Where your prompt and the AngularJS source disagree,
the source wins: implement what the source actually does and say so in your PR description.

## Repository layout

| Path | What it is |
| --- | --- |
| `src/`, `dist/`, `template/`, `test/`, `e2e/`, `gulp*`, `Grunt*`, `karma.conf.js`, `bower.json`, root `package.json` | The AngularJS app. **Frozen.** Never modify. It must stay runnable as the reference implementation. |
| `harness/` | Static server that runs the untouched AngularJS demo. **Frozen.** |
| `e2e-playwright/` | The **FROZEN** Playwright contract. Never modify a selector, assertion or timeout. |
| `web-react/` | The React port. Your work goes here. |
| `docs/` | These docs. Orchestrator-owned. |

Run the AngularJS reference app whenever you need to check behaviour or DOM:

```bash
node harness/serve-angular.js     # http://localhost:3000/
```

Keep servers in a long-lived shell — backgrounded processes die with the shell that spawned
them, which shows up later as a confusing `ERR_CONNECTION_REFUSED`.

## Working in `web-react/`

```bash
cd web-react
npm install
npm run dev         # port 5173
npm run build
npm run lint
npm run typecheck
npm run test
```

All four of `build`, `lint`, `typecheck`, `test` must pass before you open your PR.

## Hard rules

- **Branch off `migrate/react` and open your PR into `migrate/react`.** Never `main`.
- **Never modify a file outside your OWNED FILES list.** This is what makes parallel work
  conflict-free. In particular never touch `e2e-playwright/`, `harness/`, the AngularJS app,
  or the orchestrator-owned files listed in `docs/MIGRATION_PATTERN.md` §7.
- **Do not fix the three documented pre-existing AngularJS bugs.** Reproduce them faithfully,
  including the broken registry key strings `app/template/WidgetSpecificSettings.html` and
  `template/SaveChangesModal.html`, and the `heightToWidthRatio` height behaviour. Those tests
  are marked `test.fail()`; making them pass turns the run **red**, not green.
- **DOM fidelity is the contract.** Copy element nesting, `class` values and user-visible text
  verbatim from the AngularJS templates, including typos. Respect the difference between
  `ng-if` (removed from the DOM) and `ng-show`/`ng-hide` (present but `display:none`). Do **not**
  reproduce Angular runtime artifacts (`ng-*` attributes, `ng-scope`/`ng-binding`/
  `ng-isolate-scope` classes, the bare `widget` attribute, `ui-sortable-handle`).
- TypeScript `strict`. No `any`, no `as unknown as`, no dynamic property access to dodge types.
- Every model, hook and component you add gets a Vitest unit test. The AngularJS `*.spec.js`
  files sitting next to each source file are an excellent oracle — port their assertions,
  they encode real edge cases.
- **Do not add npm dependencies** and **do not add routes to `src/App.tsx`** yourself; both
  files are orchestrator-owned. Request the edit instead (see below).
- Comments are rare. Never write a comment that only makes sense while reading the diff.

## Visual verification

Add a temporary harness page under `web-react/src/demo/harness/` (a file you own), request the
route from the orchestrator, and drive it in a real browser with Playwright: assert **zero
console errors** and that your feature actually works. Attach the screenshot to your final
message. The final wave deletes all `#/__harness/*` routes.

## Requested orchestrator edits

You cannot edit orchestrator-owned files. End your PR description with a section listing every
edit you need, precisely enough to apply blind:

```markdown
## Requested orchestrator edits
- `web-react/src/App.tsx`: add route `#/__harness/foundation` → `<FoundationHarness/>` from `./demo/harness/FoundationHarness`
- `web-react/src/demo/registry.ts`: register `'wt-fluid'` → `WtFluid` from `./widgets/WtFluid`
- `web-react/package.json`: add dependency `some-lib@1.2.3`
```

## Deliverable

One PR into `migrate/react`, all four scripts green, plus a final message summarising what you
built, every place the AngularJS source contradicted your prompt, anything you could not do,
and your screenshot.
