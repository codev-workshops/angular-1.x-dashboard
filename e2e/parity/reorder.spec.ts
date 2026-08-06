import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, widgets, widgetTitles } from './helpers';

test('real mouse drag reorders widgets and survives reload', async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/');
  const first = widgets(page).nth(0);
  const second = widgets(page).nth(1);
  const before = await widgetTitles(page).allTextContents();
  const firstBox = await first.locator('.widget-header.panel-heading').boundingBox();
  const secondBox = await second.locator('.widget-header.panel-heading').boundingBox();
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  const startX = firstBox!.x + firstBox!.width / 2;
  const startY = firstBox!.y + firstBox!.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, startY + 100, { steps: 4 });
  for (let i = 1; i <= 10; i += 1) {
    await page.mouse.move(
      startX + (secondBox!.x + secondBox!.width + 100 - startX) * i / 10,
      startY + 100,
    );
  }
  await page.mouse.up();
  await expect.poll(() => widgetTitles(page).allTextContents()).not.toEqual(before);
  const after = await widgetTitles(page).allTextContents();
  await page.reload();
  await expect.poll(() => widgetTitles(page).allTextContents()).toEqual(after);
});
