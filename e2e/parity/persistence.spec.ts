import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, storageValue, widgets } from './helpers';

test('root widget state round-trips through localStorage', async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/');
  await page.locator('.btn-toolbar button.btn-primary').first().click();
  await expect(widgets(page)).toHaveCount(6);
  await page.reload();
  await expect(widgets(page)).toHaveCount(6);
});

test('layout state round-trips through localStorage', async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/layouts');
  await page.locator('.layout-tabs .glyphicon-plus').click();
  await page.reload();
  await expect(page.locator('.layout-tabs')).toContainText('Custom');
});

test('edited widget title round-trips through localStorage', async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/');
  await widgets(page).first().locator('span.widget-title').dblclick();
  await widgets(page).first().locator('input.form-control').fill('Persisted Title');
  await widgets(page).first().locator('input.form-control').press('Enter');
  await page.reload();
  await expect(widgets(page).first().locator('span.widget-title')).toHaveText('Persisted Title');
});

test('collapse state is not persisted by WidgetModel serialization', async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/');
  const widget = widgets(page).first();
  await widget.locator('.buttons .glyphicon-minus').click();
  await expect(widget.locator('.widget-content')).toHaveCSS('display', 'none');
  await page.reload();
  await expect(widgets(page).first().locator('.widget-content')).not.toHaveCSS('display', 'none');
});

test('stale dashboard state falls back to default widgets', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demo_simple', JSON.stringify({ widgets: [{ name: 'time' }], hash: 'wrong' }));
  });
  await openRoute(page, '/');
  await expect(widgets(page)).toHaveCount(5);
});

test('malformed dashboard state falls back to default widgets', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('demo_simple', '{malformed'));
  await openRoute(page, '/');
  await expect(widgets(page)).toHaveCount(5);
});

test('stale layout state falls back to default layouts', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demo-layouts', JSON.stringify({
      layouts: [{ title: 'Wrong', active: true }],
      states: {},
      storageHash: 'wrong',
    }));
  });
  await openRoute(page, '/layouts');
  for (const title of ['Layout 1', 'Layout 2', 'Layout 3']) {
    await expect(page.locator('.layout-tabs')).toContainText(title);
  }
  await expect(page.locator('.layout-tabs')).not.toContainText('Wrong');
});

test('malformed layout state falls back to default layouts', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('demo-layouts', '{malformed'));
  await openRoute(page, '/layouts');
  for (const title of ['Layout 1', 'Layout 2', 'Layout 3']) {
    await expect(page.locator('.layout-tabs')).toContainText(title);
  }
});
