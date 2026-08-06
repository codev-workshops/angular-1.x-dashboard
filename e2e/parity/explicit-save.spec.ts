import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, storageValue, widgets } from './helpers';

function saveButton(page: import('@playwright/test').Page) {
  return page.locator('.btn-toolbar button').filter({ hasText: /all saved|save changes/ });
}

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/explicit-saving');
});

test('save button starts all saved and disabled', async ({ page }) => {
  await expect(saveButton(page)).toHaveText('all saved');
  await expect(saveButton(page)).toBeDisabled();
});

test('saveable changes increment, save resets, and saved state survives reload', async ({ page }) => {
  await page.locator('.btn-toolbar button.btn-primary').first().click();
  await expect(saveButton(page)).toHaveText('save changes (1)');
  await expect(saveButton(page)).toBeEnabled();
  await saveButton(page).click();
  await expect(saveButton(page)).toHaveText('all saved');
  await expect(saveButton(page)).toBeDisabled();
  await page.reload();
  await expect(widgets(page)).toHaveCount(6);
  await expect(storageValue(page, 'explicitSave')).not.toBeNull();
});

test('unsaved changes are lost on reload', async ({ page }) => {
  await page.locator('.btn-toolbar button.btn-primary').first().click();
  await expect(widgets(page)).toHaveCount(6);
  await expect(saveButton(page)).toHaveText('save changes (1)');
  await page.reload();
  await expect(widgets(page)).toHaveCount(5);
});
