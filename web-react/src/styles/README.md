# Generated styles

- `dashboard.css` is copied from `dist/malhar-angular-dashboard.css`.
- `demo.css` is compiled from `src/app/demo.less` and the demo-specific rules
  in `src/app/index.less`, excluding `src/app/vendor.less` and its Bower
  Bootstrap import.
- `bootstrap.css` is copied from the pinned `bootstrap@3.3.7` package; its
  glyphicon font files are copied to `web-react/src/fonts/` and
  `web-react/public/fonts/` so both Vite dev fallback URLs and production
  asset resolution work.
  npm package.

Regenerate from the repository root:

```bash
cp dist/malhar-angular-dashboard.css web-react/src/styles/dashboard.css
cat src/app/demo.less src/app/index.less > /tmp/angular-dashboard-demo.less
npx lessc /tmp/angular-dashboard-demo.less web-react/src/styles/demo.css
```
