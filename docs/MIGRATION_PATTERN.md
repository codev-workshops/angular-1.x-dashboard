# AngularJS → React migration pattern

This is the canonical reference for the `angular-1.x-dashboard` → React migration.
**Read this before writing a line of code.** Every session working on this migration
must produce code that looks like it was written by one person.

The AngularJS app (`src/`, `dist/`, `template/`, `test/`, `gulp*`, `Grunt*`, `bower.json`,
root `package.json`) is the **reference implementation**. It stays runnable and is never
modified. The React port lives in the sibling workspace `web-react/`.

---

## 0. The hard constraints

1. **DOM fidelity is the contract.** The frozen Playwright suite in `e2e-playwright/`
   selects on CSS classes, element structure and literal user-visible text. Copy classes,
   nesting and strings **verbatim** from the AngularJS templates. Do not "improve" markup,
   do not rename a class, do not fix a typo in a user-visible string
   (e.g. the demo really does say `congfigurable widget` — keep it).
2. **The e2e suite is frozen.** Not a selector, not an assertion, not a timeout may change.
   If a test fails, the React code is wrong.
3. **The AngularJS app is frozen.** If you need to change it to make React work, you are
   solving the wrong problem.
4. **When this document and the actual AngularJS template disagree, the template wins.**
   Implement what the template does and say so in your PR description.
5. **Do not edit orchestrator-owned files** (see §7). Request the edit in your PR instead.

---

## 1. Target stack

| Concern | Choice |
| --- | --- |
| Build / dev server | Vite, dev server on **port 5173** (AngularJS harness owns 3000) |
| UI | React 18 + TypeScript (`strict: true`) |
| Routing | React Router v6, **`HashRouter`** — the hash paths must match ngRoute exactly |
| Local/global state | React local state first; `zustand` (vanilla `createStore`, per-instance) only for the layouts sub-system |
| Utilities | `lodash-es` — keep using `merge` / `defaults` / `pick` etc. so deep-merge semantics stay identical |
| CSS | Bootstrap 3.3.7 + a **copy** of the built `dist/malhar-angular-dashboard.css` and the demo styles, in `web-react/src/styles/` |
| Unit tests | Vitest + @testing-library/react + jsdom |
| E2E | the frozen Playwright suite in `e2e-playwright/`, run with `E2E_BASE_URL=http://localhost:5173` |

**Not used, deliberately:** `axios`, `@tanstack/react-query`, `msw`. This project is a
client-side widget framework with **no HTTP layer** — all persistence is a `Storage`-shaped
object (usually `window.localStorage`). Do not add dead dependencies. If you think you need
a network call, you have misread the AngularJS source.

The frozen suite selects on attributes that are authored in the AngularJS templates, so those
are part of the DOM contract and must be emitted verbatim as literal, inert HTML attributes
on the React elements. React passes unknown dash-cased attributes straight through. Known
cases from the frozen suite include `ng-model="result.title"`,
`ng-model="result.dataModelOptions.limit"`, `ng-model` values beginning `item.`,
`ng-dblclick="editTitle(layout)"`, the bare `dashboard` attribute, and `data-layout`.

**The rule:** copy every attribute that appears literally in the AngularJS template source
onto the corresponding React element, in addition to wiring the real React behavior —
except `ng-repeat` and `ng-init`, whose elements React generates structurally.

Do not reproduce attributes and classes Angular adds at runtime:
`ng-scope`, `ng-binding`, `ng-isolate-scope`, `ng-cloak`, `ng-valid*`/`ng-dirty`/`ng-pristine`,
and `ui-sortable-handle`.

---

## 2. Translation table

| AngularJS | React |
| --- | --- |
| `angular.module('ui.dashboard')` | the library in `web-react/src/lib/`, public surface re-exported from `src/lib/index.ts` |
| `.factory('WidgetModel', ...)` (a constructor) | a plain exported `class` in `src/lib/models/` — **no DI, no singletons** |
| `.directive('dashboard', ...)` attribute directive | `<Dashboard options={options} scope={scope} />` |
| `.controller(...)` on a directive | logic in the component + a `use*` hook |
| directive `scope: true` inherited scope | props + React context (`DashboardContext`) |
| `templateUrl` on a directive | JSX in the component |
| `$scope.$eval(attrs.dashboard)` | the `options` prop (the same mutable object — see §4) |
| `$scope.$emit('widgetChanged')` / `$broadcast('widgetResized')` | a per-dashboard `EventEmitter` on `DashboardContext`; `emit('widgetChanged', widget)` / `emit('widgetResized', size)` |
| `ng-repeat="widget in widgets"` | `widgets.map(...)` with a **stable** `key` (a per-instance `uid`, never the array index — reordering and title edits must not remount) |
| `ng-if` / `ng-show` / `ng-hide` | `{cond && <.../>}` / `style={{display: cond ? '' : 'none'}}` — mind the difference: `ng-if` removes from the DOM, `ng-show` only hides it. The e2e suite can tell them apart. |
| `ng-style="widget.containerStyle"` | `style={toReactStyle(widget.containerStyle)}` |
| `ng-class="{active: x}"` | `className={classNames('...', {active: x})}` — but emit the **same** class list and order the tests expect |
| `ng-click` / `ng-dblclick` / `ng-blur` / `ng-mousedown` / `ng-submit` | `onClick` / `onDoubleClick` / `onBlur` / `onMouseDown` / `onSubmit` |
| `ng-model` on an input | controlled input (`value` + `onChange`) |
| `ng-include="url"` | look the url up in the **template registry** (§3) and render the component |
| `$uibModal.open(...)` | `<Modal>` rendering Bootstrap-3 markup (`.modal-backdrop.fade.in` + `.modal.fade.in` > `.modal-dialog` > `.modal-content`) via a portal; `result.then/catch` → `onOk(result)` / `onDismiss(reason)` |
| `ui-sortable` (jQuery-UI) | the hand-rolled `useSortable` hook (§5) — **do not add a drag-and-drop library** |
| jQuery resize maths in `DashboardWidgetCtrl.grabResizer` | port near-verbatim into `useResizer` with refs + `window.addEventListener('mousemove'/'mouseup')` (§5) |
| `$interval(fn, 500)` | `setInterval` in an effect, cleared on unmount |
| `$timeout(fn, 0)` | `queueMicrotask` / `setTimeout(fn, 0)` — usually a `useEffect` is the right answer |
| `$q` / promise-or-value from storage | `Promise.resolve(...)` + a `isThenable()` guard; storage may return a value **or** a promise and both paths must work |
| `$log.warn/info` | `logger.warn/info` in `src/lib/logger.ts` (a thin `console` wrapper so tests can spy) |
| `angular.extend(a, b)` | `Object.assign(a, b)` |
| `angular.copy(x)` | `_.cloneDeep(x)` |
| `_.merge` / `_.defaults` / `_.pick` | same functions from `lodash-es` |
| `jQuery.extend(true, target, src)` | `_.merge(target, src)` |
| `angular.isArray/isObject/isFunction/isNumber/isDefined` | plain TS type guards |
| `$injector` lookup of a data-model by string name | the **data-model registry**: `Record<string, WidgetDataModelCtor>` |
| `$compile(template)($scope)` inside `.widget-content` | render the registry-resolved component as a React child of `.widget-content` |

The JSX must preserve the observable DOM structure and behavior described above.

### Frozen-contract checklist

Every later wave must preserve these contract facts:

- The frozen suite selects `ng-model="result.title"`,
  `ng-model="result.dataModelOptions.limit"`, `ng-model` values beginning `item.`,
  `ng-dblclick="editTitle(layout)"`, the bare `dashboard` attribute, and `data-layout`.
- Required localStorage keys are `demo_simple`, `explicitSave`, and `demo_resize`.
  `demo_simple` stores `{widgets:[...]}` without a top-level `hash`; `explicitSave`
  defers writes until explicit save; `demo_resize` stores a payload containing `widgets`.
- Route navigation uses `page.goto('/#' + route)`, so HashRouter paths must match exactly.
- The suite uses `waitUntil: 'networkidle'`; routes must settle without pending network
  activity.
- `clearStorageBeforeBoot` clears localStorage once per browser context using a
  sessionStorage marker.
- Layouts must preserve the `.layout-tabs` sibling structure and exactly one active dashboard.
- `.widget-header` must be draggable for sortable behavior.
- `.e-resizer` and `.w-resizer` must have usable bounding boxes.
- `.widget-resizer-marquee` must appear during a resize drag and disappear after mouseup.

---

## 3. The central design decision: three registries

AngularJS compiles arbitrary strings (`directive: 'wt-time'`, `templateUrl: 'app/template/fluid.html'`,
`dataModelType: 'RandomDataModel'`) into live DOM through `$compile`/`$injector`. React has no
runtime compiler, so those strings resolve through explicit registries. **Widget definition
objects (WDOs) keep their existing field names and values** — this is what keeps serialized
localStorage payloads byte-compatible with AngularJS.

```ts
// src/lib/registry.ts
export type WidgetContentProps = {
  widget: WidgetModel;
  widgetData: unknown;          // pushed by the widget's data model, if any
  scope: Record<string, unknown>; // the host page's "scope" object
  [prop: string]: unknown;      // resolved `attrs`
};

export type WidgetRegistry = Record<string, React.ComponentType<WidgetContentProps>>;
export type DataModelRegistry = Record<string, WidgetDataModelCtor>;
```

Resolution order inside `<Widget>` mirrors `DashboardWidgetCtrl.makeTemplateString()`:

1. `widget.templateUrl` → `registry[widget.templateUrl]` (the url string is the key)
2. `widget.template` → `registry[widget.template]` (rare; string templates in the demo)
3. otherwise `widget.directive` → `registry[widget.directive]` (defaulting to `widget.name`,
   exactly as `WidgetModel` does today)

A missing key is a hard error: render nothing and `logger.warn` with the unresolved key.

### `attrs` and `dataAttrName`

In AngularJS `attrs: { value: 'randomValue' }` becomes the attribute `value="randomValue"`,
an **expression evaluated against the dashboard scope**. In React:

- `attrs[propName] = 'someKey'` → the content component receives `propName={scope.someKey}`.
- `dataAttrName: 'value'` → the content component receives `value={widgetData}`, where
  `widgetData` is whatever the widget's data model last pushed. (This mirrors
  `widget.attrs[widget.dataAttrName] = 'widgetData'`.)
- If the attr value is not a key of `scope`, pass the literal string through unchanged
  (that is what `attrs: { class: 'demo-widget-resizable' }` needs).

---

## 4. The `options` object is a mutable public API — preserve it

`dashboard.js` deliberately writes callables back onto the caller's options object:

```js
scope.options.addWidget = ...; prependWidget; loadWidgets; saveDashboard;
removeWidget; openWidgetSettings; clear; resetWidgetsToDefault; currentWidgets;
```

Consumers (including the demo pages and the frozen e2e flows that go through them) rely on
this. **Keep it.** `<Dashboard>` mutates the `options` object it is given in an effect, and
also accepts an optional `apiRef` for idiomatic React consumers. Same for `dashboardLayouts`,
which installs `saveLayouts`, `addWidget`, `prependWidget`, `loadWidgets`, `saveDashboard`
that proxy to the *active* layout.

Also preserved verbatim:

- `options.unsavedChangeCount` — incremented on every saveable change when
  `explicitSave` is on, reset to 0 on a forced save. The toolbar button text
  (`all saved` vs `save changes (N)`) is derived from it.
- Defaults applied in the directive controller: `stringifyStorage: true`,
  `hideWidgetSettings: false`, `hideWidgetClose: false`, plus the default
  `settingsModalOptions` and `onSettingsClose`/`onSettingsDismiss`. `_.defaults` semantics —
  shallow for `options`, and `settingsModalOptions` defaulted separately *before* the
  shallow defaults are applied.
- `sortableOptions` = `{stop: saveDashboard, handle: '.widget-header', distance: 5}` merged
  with `options.sortableOptions`.

---

## 5. Interaction layer

### `useSortable`
Reimplement jQuery-UI sortable's *observable* behaviour, nothing more. No DnD library.

- Mousedown on the element matching `handle` (`.widget-header`) arms a drag.
- The drag only starts after the pointer has moved `distance` (5) px.
- While dragging, the dragged `.widget-container` follows the pointer and the other items
  reflow; the drop index is determined by the pointer position relative to sibling midpoints.
- On mouseup: commit the new order, then call `stop()` (which saves the dashboard).
- Escape/blur cancels back to the original order.
- Use **mouse** events (`mousedown`/`mousemove`/`mouseup` on `window`), not pointer or HTML5
  drag events, so the frozen e2e drags behave identically.

The layouts tab bar uses the same hook with `distance: 5` and no handle.

### `useResizer`
Port `DashboardWidgetCtrl.grabResizer` **line by line**; the arithmetic is load-bearing and
the e2e suite asserts on its results. Things that must survive the port:

- ignore anything but the primary button (`e.button !== 0`), `stopPropagation` + `preventDefault`
- the marquee: `<div class="widget-resizer-marquee {region}" style="height:..;width:..">`
  appended inside `.widget`, positioned `top:-1px; left:-1px`, removed on mouseup
- `currentWidthPixel = widget.offsetWidth + 2`, `currentHeightPixel = widget.offsetHeight + 2`
- width unit taken from `containerStyle.width` (`%` or `px`) and preserved across the resize
- `minWidth` from `size.minWidth` (percent resolved against the parent width, minus
  `margin-right`), default 40; `maxWidth` = parent width − margin-right when the unit is `%`,
  otherwise `Infinity`
- `minHeight` = `size.minHeight + headerHeight + 4`, default `40 + headerHeight`
- `heightToWidthRatio`: height is derived from width (and vice-versa for the N/S regions);
  `maxHeight = (maxWidth + marginRight) * ratio + headerHeight + 4`
- all eight regions `nw n ne e se s sw w` behave as in the switch statement
- on mouseup: `setWidth` / `setHeight` on the model, then emit `widgetChanged`, then
  `widgetResized` with `{width, widthPixels, height}`
- the existing guard: **do not** run the resize when the computed width or height is zero

`.widget-content` overflow comes from `size.contentOverflow`, and the min-width/min-height
enforcement effects (`applyMinWidth` / `applyMinHeight`) run after layout — port them as a
`useLayoutEffect`.

---

## 6. Models — port with identical semantics

These are framework-free classes; port them 1:1 and keep the method names.

- **`WidgetModel`** — defaults `{title:'Widget', style:{}, size:{width:'33%'},
  enableVerticalResize:true, containerStyle:{width:'33%'}, contentStyle:{}}`, deep-merged with
  the WDO and the overrides via `_.merge(cloneDeep(def), overrides)`. `setWidth` clamps to
  `minWidth`, clamps percentages to 0–100, warns and no-ops on NaN/negative, and returns
  `width + units`. `setHeight` writes `contentStyle.height`. `serialize()` returns exactly
  `_.pick(this, ['title','name','style','size','dataModelOptions','attrs','storageHash'])` —
  **the persisted shape is part of the contract**.
- **`WidgetDefCollection`** — array-like with `map`, `getByName(name)`, `add(def)`; a `def`
  that is a function is instantiated (`new def()`).
- **`DashboardState`** — `save(widgets)` writes `{widgets: serialized, hash}` (JSON-stringified
  when `stringify`), returns `storage.setItem(...) || true`; no storage → `true`.
  `load()` handles a value **or** a promise; malformed JSON → `warn` + `null`; hash mismatch →
  `info`, `removeItem`, `null`; per-widget: unknown `name` → `warn` + skip; mismatched
  per-widget `storageHash` → `info` + skip.
- **`LayoutStorage`** — layouts array + a `states` map keyed by layout id; it is itself a
  `Storage`-shaped object (`setItem`/`getItem`/`removeItem`) that each layout's dashboard
  writes into, with `stringifyStorage: false` for the inner dashboards. Keep `add`, `remove`
  (including the "activate the previous tab" rule), `save`, `load`, `clear`,
  `getActiveLayout`, `_addDefaultLayouts`, `_serializeLayouts`, `_ensureActiveLayout`,
  `_getLayoutId` (max numeric id + 1) with identical behaviour, including `lockDefaultLayouts`.
- **`WidgetDataModel`** — base class with `setup(widget, api)`, `init()`, `updateScope(data)`,
  `destroy()`. The subscriber contract is explicitly
  `WidgetDataModelApi = { updateScope(data: unknown): void }`. `<Widget>` constructs the
  model, calls `setup(widget, api)` followed by `init()`, and calls `destroy()` on unmount.
  `updateScope` no longer touches a scope: it calls the subscriber `<Widget>` installed,
  which sets React state and re-renders the content with the new `widgetData`.
  Subclasses (`RandomDataModel`, `CartDataModel`) keep their public methods
  (`updateLimit`, `addItem`, `removeItem`, `processItems`, …).

---

## 7. Orchestrator-owned files — do not edit

Child sessions must not modify these; they are how parallel work stays conflict-free:

```
web-react/package.json
web-react/package-lock.json
web-react/vite.config.ts
web-react/tsconfig*.json
web-react/index.html
web-react/src/main.tsx
web-react/src/App.tsx                (the route table)
web-react/src/lib/index.ts           (the public API surface)
web-react/src/demo/registry.ts       (the shared widget/data-model registry)
web-react/src/styles/**
e2e-playwright/**                    (FROZEN)
docs/**
harness/**
everything outside web-react/        (the AngularJS app)
```

Need one changed — a new dependency, a new route, a new registry entry? Append a section to
your PR description:

```markdown
## Requested orchestrator edits
- `web-react/package.json`: add `classnames@^2.5.1`
- `web-react/src/demo/registry.ts`: register `'wt-fluid' -> WtFluid`
```

and the orchestrator applies it before merging.

---

## 8. Conventions

- TypeScript `strict`. No `any`, no `as unknown as`, no `getattr`-style dynamic access. If a
  type is hard, the AngularJS source tells you what the shape really is — model it.
- One component per file, named export matching the filename.
- Every ported model and hook gets a Vitest unit test. The AngularJS `*.spec.js` files next
  to each source file are an excellent oracle: port the assertions, they encode real edge cases.
- Comments are rare. Never write a comment that only makes sense while reading the diff.
- Scripts (identical names in `web-react/package.json`, run all four before you push):
  `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`.
- Branch off and target the integration branch **`migrate/react`**.
- Temporary harness routes for visual verification go under `#/__harness/<yourname>` and are
  deleted by the final wave.

## 9. Reference implementation

The worked reference implementation is:

- `web-react/src/lib/components/Widget.tsx`
- `web-react/src/lib/models/WidgetModel.ts`
- `web-react/src/lib/registry.ts`
- Their adjacent Vitest tests

The temporary visual verification route is `#/__harness/reference`.
