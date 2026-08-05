import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, storageJson, widgets } from './helpers';

async function drag(page: any, handle: any, dx: number, dy = 0): Promise<void> {
  const box = await handle.boundingBox();
  if (!box) throw new Error('resizer has no bounding box');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 5; i += 1) {
    await page.mouse.move(box.x + box.width / 2 + dx * i / 5, box.y + box.height / 2 + dy * i / 5);
  }
  await page.mouse.up();
}

test.describe('resize demo', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('renders the configured resizer handles', async ({ page }) => {
    await openRoute(page, '/resize');
    await expect(page.locator('.e-resizer')).toHaveCount(9);
    await expect(page.locator('.w-resizer')).toHaveCount(9);
    await expect(page.locator('.n-resizer')).toHaveCount(9);
    await expect(page.locator('.s-resizer')).toHaveCount(9);
  });

  test('resizes eastward with a marquee and persists the new width', async ({ page }) => {
    await openRoute(page, '/resize');
    const target = widgets(page).first();
    const before = await target.evaluate((element) => parseFloat((element as HTMLElement).style.width));
    const handle = target.locator('.e-resizer');
    const box = await handle.boundingBox();
    if (!box) throw new Error('resizer has no bounding box');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2);
    await expect(target.locator('.widget-resizer-marquee')).toBeVisible();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2);
    await page.mouse.up();
    await expect(target.locator('.widget-resizer-marquee')).toHaveCount(0);
    const after = await target.evaluate((element) => parseFloat((element as HTMLElement).style.width));
    expect(after).toBeGreaterThan(before);
    expect(await storageJson(page, 'demo_resize')).toMatchObject({ widgets: expect.any(Array) });
  });

  test('clamps the resizable width to its configured minimum', async ({ page }) => {
    await openRoute(page, '/resize');
    const target = widgets(page).nth(4);
    await drag(page, target.locator('.w-resizer'), -1000);
    const width = await target.evaluate((element) => parseFloat((element as HTMLElement).style.width));
    expect(width).toBeGreaterThanOrEqual(40);
  });

  test('tracks height with width for the ratio widget', async ({ page }) => {
    test.fail(true, 'AngularJS ratio widget width drag does not update rendered content height');
    await openRoute(page, '/resize');
    const target = widgets(page).nth(8);
    const before = await target.locator('.widget-content').evaluate((element) => (element as HTMLElement).getBoundingClientRect().height);
    await drag(page, target.locator('.e-resizer'), 80);
    const after = await target.locator('.widget-content').evaluate((element) => (element as HTMLElement).getBoundingClientRect().height);
    expect(after).toBeGreaterThan(before);
  });
});
