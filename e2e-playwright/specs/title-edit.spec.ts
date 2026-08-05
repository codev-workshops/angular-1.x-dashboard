import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, widgets } from './helpers';

test.describe('widget title editing', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('commits title with Enter and persists it', async ({ page }) => {
    await openRoute(page, '/');
    const widget = widgets(page).first();
    await widget.locator('span.widget-title').dblclick();
    const input = widget.locator('form.widget-title input');
    await expect(input).toBeVisible();
    await input.fill('Renamed Widget');
    await input.press('Enter');
    await expect(input).toBeHidden();
    await expect(widget.locator('span.widget-title')).toHaveText('Renamed Widget');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(widgets(page).first().locator('span.widget-title')).toHaveText('Renamed Widget');
  });

  test('commits title on blur', async ({ page }) => {
    await openRoute(page, '/');
    const widget = widgets(page).first();
    await widget.locator('span.widget-title').dblclick();
    const input = widget.locator('form.widget-title input');
    await input.fill('Blurred Widget');
    await input.blur();
    await expect(input).toBeHidden();
    await expect(widget.locator('span.widget-title')).toHaveText('Blurred Widget');
  });
});
