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
  await widgets(page).first().locator('.buttons .glyphicon-remove').click();
  await expect(saveButton(page)).toHaveText('save changes (2)');
  await widgets(page).first().locator('span.widget-title').dblclick();
  await widgets(page).first().locator('input.form-control').fill('Edited');
  await widgets(page).first().locator('input.form-control').press('Enter');
  await expect(saveButton(page)).toHaveText('save changes (3)');
  const handle = widgets(page).first().locator('.e-resizer').first();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 2, box!.y + box!.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 6; i += 1) {
    await page.mouse.move(box!.x + 2 + 40 * i / 6, box!.y + box!.height / 2);
  }
  await page.mouse.up();
  await expect(saveButton(page)).toHaveText('save changes (4)');
  await expect(saveButton(page)).toBeEnabled();
  await saveButton(page).click();
  await expect(saveButton(page)).toHaveText('all saved');
  await expect(saveButton(page)).toBeDisabled();
  await page.reload();
  await expect(widgets(page)).toHaveCount(5);
  const saved = JSON.parse((await storageValue(page, 'explicitSave'))!);
  expect(saved.widgets.map((item: { title: string }) => item.title)).toContain('Edited');
});

test('unsaved changes are lost on reload', async ({ page }) => {
  await page.locator('.btn-toolbar button.btn-primary').first().click();
  await expect(widgets(page)).toHaveCount(6);
  await expect(saveButton(page)).toHaveText('save changes (1)');
  await page.reload();
  await expect(widgets(page)).toHaveCount(5);
});
