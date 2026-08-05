import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, storageJson, widgetTitles, widgets } from './helpers';

test.describe('sortable widgets', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('reorders widgets and persists the new order', async ({ page }) => {
    await openRoute(page, '/');
    const first = widgets(page).nth(0);
    const second = widgets(page).nth(1);
    const from = await first.locator('.widget-header').boundingBox();
    const to = await second.locator('.widget-header').boundingBox();
    if (!from || !to) throw new Error('widget headers have no bounding boxes');
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2 + 12);
    await page.mouse.move(to.x + to.width / 2, to.y + to.height + 30);
    await page.mouse.move(to.x + to.width / 2, to.y + to.height + 50);
    await page.mouse.up();
    await expect.poll(() => widgetTitles(page)).toEqual(['Widget 2', 'Widget 1', 'Widget 3', 'Widget 4', 'Widget 5']);
    const stored = await storageJson(page, 'demo_simple');
    expect(stored.widgets.slice(0, 2).map((widget: any) => widget.title)).toEqual(['Widget 2', 'Widget 1']);
    await page.reload({ waitUntil: 'networkidle' });
    await expect.poll(() => widgetTitles(page)).toEqual(['Widget 2', 'Widget 1', 'Widget 3', 'Widget 4', 'Widget 5']);
  });
});
