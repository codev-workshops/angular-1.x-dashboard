import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, widgets } from './helpers';

test.describe('widget settings modal', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('edits and persists a widget title', async ({ page }) => {
    await openRoute(page, '/');
    const widget = widgets(page).first();
    await widget.locator('.glyphicon-cog').click();
    const modal = page.locator('.modal');
    await expect(modal).toContainText('Widget Options');
    await expect(modal).toContainText('Widget 1');
    await modal.locator('input[name="widgetTitle"]').fill('Modal Widget');
    await modal.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(modal).toBeHidden();
    await expect(widget.locator('span.widget-title')).toHaveText('Modal Widget');
    await page.reload({ waitUntil: 'networkidle' });
    await expect(widgets(page).first().locator('span.widget-title')).toHaveText('Modal Widget');
  });

  test('cancel and close leave the title unchanged', async ({ page }) => {
    await openRoute(page, '/');
    const widget = widgets(page).first();
    for (const action of ['Cancel', '×']) {
      await widget.locator('.glyphicon-cog').click();
      const modal = page.locator('.modal');
      if (action === 'Cancel') {
        await modal.getByRole('button', { name: 'Cancel', exact: true }).click();
      } else {
        await modal.locator('button.close').click();
      }
      await expect(modal).toBeHidden();
      await expect(widget.locator('span.widget-title')).toHaveText('Widget 1');
    }
  });
});
