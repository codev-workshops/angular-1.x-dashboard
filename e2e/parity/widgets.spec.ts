import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, widgetNames, widgets, widgetTitles } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/');
});

test('default widgets render with expected count and labels', async ({ page }) => {
  await expect(widgets(page)).toHaveCount(5);
  await expect(page.locator('.label.label-primary')).toHaveText(['random', 'time', 'datamodel', 'random', 'time']);
});

test('each widget button adds its widget type', async ({ page }) => {
  const buttons = page.locator('.btn-toolbar button.btn-primary');
  const names = await buttons.allTextContents();
  for (const name of names) {
    await buttons.filter({ hasText: name.trim() }).first().click();
  }
  await expect(widgets(page)).toHaveCount(10);
  await expect(page.locator('.label.label-primary')).toContainText(names.map((name) => name.trim()));
});

test('a widget can be removed', async ({ page }) => {
  await widgets(page).first().locator('.buttons .glyphicon-remove').click();
  await expect(widgets(page)).toHaveCount(4);
});

test('a widget can collapse and expand', async ({ page }) => {
  const widget = widgets(page).first();
  await widget.locator('.buttons .glyphicon-minus').click();
  await expect(widget.locator('.widget-content')).toBeHidden();
  await widget.locator('.buttons .glyphicon-plus').click();
  await expect(widget.locator('.widget-content')).toBeVisible();
});

test('widget title editing persists after submit', async ({ page }) => {
  const widget = widgets(page).first();
  await widget.locator('span.widget-title').dblclick();
  const input = widget.locator('.widget-title input');
  await expect(input).toBeVisible();
  await input.fill('Renamed Widget');
  await input.press('Enter');
  await expect(widget.locator('span.widget-title')).toHaveText('Renamed Widget');
});

test('Clear empties the dashboard and Default Widgets restores it', async ({ page }) => {
  await page.locator('.btn-toolbar button').filter({ hasText: 'Clear' }).click();
  await expect(widgets(page)).toHaveCount(0);
  await page.locator('.btn-toolbar button').filter({ hasText: 'Default Widgets' }).click();
  await expect(widgets(page)).toHaveCount(5);
});

test('prependWidget inserts a Prepend Widget at position zero', async ({ page }) => {
  await page.getByText('Click here', { exact: true }).click();
  await expect(widgetTitles(page).first()).toHaveText('Prepend Widget');
});
