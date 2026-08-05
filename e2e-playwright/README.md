# Playwright E2E contract

This suite is the frozen, DOM-only end-to-end contract for the AngularJS
application and its React migration. It must run unchanged against either app;
only `E2E_BASE_URL` may differ.

**FROZEN — this suite must not be modified for the React migration.**

Start the application separately, then run:

```bash
npm install --prefix e2e-playwright
E2E_BASE_URL=http://localhost:3000 npm test --prefix e2e-playwright
```

The tests intentionally use only rendered DOM, user interactions, and
`localStorage`. They must not use framework-specific hooks or debug globals.
