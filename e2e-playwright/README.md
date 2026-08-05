# Playwright E2E contract

This suite is the frozen, DOM-only end-to-end contract for the AngularJS
application and its React migration. It must run unchanged against either app;
only `E2E_BASE_URL` may differ.

**FROZEN — this suite must not be modified for the React migration.**

From a clean checkout, install both locked dependency sets:

```bash
npm ci --prefix harness
npm ci --prefix e2e-playwright
```

Install the Chromium browser once on a fresh machine:

```bash
cd e2e-playwright
npx playwright install chromium
cd ..
```

Start the AngularJS harness in a separate long-lived shell:

```bash
node harness/serve-angular.js
```

Then run the frozen suite:

```bash
E2E_BASE_URL=http://localhost:3000 npm test --prefix e2e-playwright
```

The tests intentionally use only rendered DOM, user interactions, and
`localStorage`. They must not use framework-specific hooks or debug globals.
