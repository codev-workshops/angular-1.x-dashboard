import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, storageValue, widgets } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/custom-settings');
});

test('default settings modal edits Title and persists on OK', async ({ page }) => {
  const widget = widgets(page).first();
  await widget.locator('.buttons .glyphicon-cog').click();
  const modal = page.locator('.modal');
  await expect(modal.locator('.modal-header')).toContainText('Widget Options');
  await modal.locator('.modal-body input').first().fill('Configured Title');
  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toHaveCount(0);
  await expect(widget.locator('span.widget-title')).toHaveText('Widget 1');
  await page.reload();
  await expect(widgets(page).first().locator('span.widget-title')).toHaveText('Widget 1');
  await expect(storageValue(page, 'custom-settings')).not.toBeNull();
});

test('Cancel and close discard modal edits', async ({ page }) => {
  const widget = widgets(page).first();
  await widget.locator('.buttons .glyphicon-cog').click();
  const modal = page.locator('.modal');
  await modal.locator('.modal-body input').first().fill('Discarded');
  await modal.getByRole('button', { name: 'Cancel' }).click();
  await expect(widget.locator('span.widget-title')).not.toHaveText('Discarded');
  await widget.locator('.buttons .glyphicon-cog').click();
  await modal.locator('.modal-body input').first().fill('Also discarded');
  await modal.locator('.modal-header button.close').click();
  await expect(modal).toHaveCount(0);
  await expect(widget.locator('span.widget-title')).not.toHaveText('Also discarded');
});

test('configurable widget exposes limit partial and changing it takes effect', async ({ page }) => {
  const widget = widgets(page).first();
  await widget.locator('.buttons .glyphicon-cog').click();
  const modal = page.locator('.modal');
  await expect(modal.locator('.modal-body')).toContainText('Random Limit');
  const limit = modal.locator('.modal-body input').nth(1);
  await limit.fill('3');
  await modal.getByRole('button', { name: 'OK' }).click();
  await expect(modal).toHaveCount(0);
  await expect(widget.locator('.widget-content')).toContainText('Value');
});

test('override modal widget opens its override template', async ({ page }) => {
  await widgets(page).filter({ hasText: 'override modal widget' }).locator('.buttons .glyphicon-cog').click();
  const modal = page.locator('.modal');
  await expect(modal.locator('.modal-header')).toContainText('Custom Settings for a special widget');
  await expect(modal.locator('.modal-footer')).toContainText('fuhget about it');
});
