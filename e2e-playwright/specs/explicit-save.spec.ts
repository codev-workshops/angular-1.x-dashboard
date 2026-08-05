import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, storageJson, widgets } from './helpers';

test.describe('explicit saving', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('defers localStorage writes until Save Changes is clicked', async ({ page }) => {
    await openRoute(page, '/explicit-saving');
    const button = page.locator('.btn-toolbar button.btn-success');
    await expect(button).toHaveText('all saved');
    await expect(button).toBeDisabled();
    const before = await storageJson(page, 'explicitSave');
    await page.locator('a', { hasText: 'Click here' }).first().click();
    await expect(button).toHaveText('save changes (1)');
    await expect(button).toBeEnabled();
    await page.locator('.btn-toolbar button.btn-primary', { hasText: 'random' }).first().click();
    await expect(button).toHaveText('save changes (2)');
    expect(await storageJson(page, 'explicitSave')).toEqual(before);
    await button.click();
    await expect(button).toHaveText('all saved');
    const saved = await storageJson(page, 'explicitSave');
    expect(saved.widgets).toHaveLength(7);
    expect(saved.widgets.map((widget: any) => widget.title)).toEqual(await page.locator('.dashboard-widget-area span.widget-title').allTextContents());
    await expect(widgets(page)).toHaveCount(7);
  });
});
