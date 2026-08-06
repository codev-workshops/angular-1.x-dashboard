import { test, expect } from '@playwright/test';
import { clearDemoStorage, dragMouse, openRoute, widgets } from './helpers';

async function dragEast(page: import('@playwright/test').Page, widgetIndex: number, pixels: number) {
  const widget = widgets(page).nth(widgetIndex);
  await widget.scrollIntoViewIfNeeded();
  const handle = widget.locator('.e-resizer').first();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 2, box!.y + box!.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) {
    await page.mouse.move(box!.x + 2 + pixels * i / 8, box!.y + box!.height / 2);
  }
  await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/resize');
});

test('east resize shows a marquee, changes width, and persists', async ({ page }) => {
  const widget = widgets(page).nth(1);
  const before = (await widget.boundingBox())!.width;
  const handle = widget.locator('.e-resizer').first();
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + 2 + 80, box!.y + box!.height / 2, { steps: 8 });
  await expect(page.locator('.widget-resizer-marquee')).toBeVisible();
  await page.screenshot({ path: '/home/ubuntu/legacy-screens/parity-resize-marquee.png' });
  await page.mouse.up();
  await expect(page.locator('.widget-resizer-marquee')).toHaveCount(0);
  await expect.poll(async () => (await widget.boundingBox())!.width).toBeGreaterThan(before);
  const after = (await widget.boundingBox())!.width;
  await page.reload();
  await expect(widgets(page).nth(1).locator('..')).toHaveAttribute('style', /width:/);
  await expect.poll(async () => (await widgets(page).nth(1).boundingBox())!.width).toBeGreaterThan(before - 2);
});

test('minWidth prevents a widget from shrinking below its minimum', async ({ page }) => {
  const widget = widgets(page).nth(5);
  const before = (await widget.boundingBox())!.width;
  await dragEast(page, 5, -500);
  const after = (await widget.boundingBox())!.width;
  expect(after).toBeGreaterThanOrEqual(before - 5);
});

test('heightToWidthRatio widget maintains approximately one quarter height', async ({ page }) => {
  const widget = widgets(page).nth(8);
  await widget.scrollIntoViewIfNeeded();
  await dragEast(page, 8, 100);
  const box = await widget.locator('.widget-content').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height / box!.width).toBeCloseTo(0.25, 1);
});

test('vertical handles are present for the resize demo widgets', async ({ page }) => {
  await expect(widgets(page).first().locator('.n-resizer')).toHaveCount(1);
  await expect(widgets(page).first().locator('.s-resizer')).toHaveCount(1);
});
