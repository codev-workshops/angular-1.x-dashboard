import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, widgets } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/dynamic-options');
});

test('List and Thumbnail toggles recreate the widget and active button is disabled', async ({ page }) => {
  const widget = widgets(page).first();
  await expect(widget.locator('.label.label-primary')).toHaveText('peopleList');
  await expect(page.getByRole('button', { name: 'List', exact: true }).first()).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Thumbnail', exact: true }).first()).toBeEnabled();
  const before = await widget.locator('.people').allTextContents();
  await page.getByRole('button', { name: 'Thumbnail', exact: true }).first().click();
  await expect(widget.locator('.label.label-primary')).toHaveText('peopleThumbnail');
  await expect(page.getByRole('button', { name: 'Thumbnail', exact: true }).first()).toBeDisabled();
  await expect(page.getByRole('button', { name: 'List', exact: true }).first()).toBeEnabled();
  await expect(widget.locator('.people')).toHaveCount(10);
  expect(await widget.locator('.people').allTextContents()).not.toEqual(before);
});

test('dynamic options toolbar is hidden', async ({ page }) => {
  await expect(page.locator('.dashboard-widget-area .btn-toolbar')).toHaveCount(0);
});
