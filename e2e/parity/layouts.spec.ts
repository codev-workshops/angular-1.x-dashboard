import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute, storageValue, widgets } from './helpers';

function tabs(page: import('@playwright/test').Page) {
  return page.locator('.nav.nav-tabs.layout-tabs > li');
}

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/layouts');
});

test('three default layout tabs render with Layout 1 active', async ({ page }) => {
  await expect(tabs(page)).toHaveCount(4);
  await expect(tabs(page).nth(0)).toHaveClass(/active/);
  for (const title of ['Layout 1', 'Layout 2', 'Layout 3']) {
    await expect(page.locator('.layout-tabs')).toContainText(title);
  }
});

test('switching tabs swaps the active dashboard', async ({ page }) => {
  await widgets(page).first().locator('.buttons .glyphicon-remove').click();
  await expect(widgets(page)).toHaveCount(4);
  await tabs(page).nth(1).click();
  await expect(tabs(page).nth(1)).toHaveClass(/active/);
  await expect(widgets(page)).toHaveCount(5);
  await tabs(page).nth(0).click();
  await expect(tabs(page).nth(0)).toHaveClass(/active/);
  await expect(widgets(page)).toHaveCount(4);
});

test('plus creates a Custom layout and activates it', async ({ page }) => {
  await page.locator('.layout-tabs .glyphicon-plus').click();
  await expect(page.locator('.layout-tabs')).toContainText('Custom');
  await expect(tabs(page).nth(3)).toHaveClass(/active/);
});

test('a custom layout can be renamed and rejects blank title', async ({ page }) => {
  await page.locator('.layout-tabs .glyphicon-plus').click();
  const custom = tabs(page).nth(3);
  await custom.locator('span').filter({ hasText: 'Custom' }).dblclick();
  const input = custom.locator('input');
  await input.fill('');
  await input.blur();
  await expect(input).toBeVisible();
  await input.fill('Renamed Layout');
  await input.press('Enter');
  await expect(custom).toContainText('Renamed Layout');
  await page.reload();
  await expect(tabs(page).nth(3)).toContainText('Renamed Layout');
});

test('a removable custom layout is removed and previous layout activates', async ({ page }) => {
  await page.locator('.layout-tabs .glyphicon-plus').click();
  const custom = tabs(page).nth(3);
  await expect(custom.locator('.remove-layout-icon')).toBeVisible();
  await custom.locator('.remove-layout-icon').click();
  await expect(page.locator('.layout-tabs')).not.toContainText('Custom');
  await expect(tabs(page).nth(2)).toHaveClass(/active/);
});

test('locked default layouts have no remove icon and are not renameable', async ({ page }) => {
  await expect(tabs(page).nth(0).locator('.remove-layout-icon')).toHaveCount(0);
  await expect(tabs(page).nth(1).locator('.remove-layout-icon')).toHaveCount(0);
  await expect(tabs(page).nth(2).locator('.remove-layout-icon')).toHaveCount(1);
  const title = tabs(page).nth(0).locator('span').filter({ hasText: 'Layout 1' });
  await title.dblclick();
  await expect(tabs(page).nth(0).locator('input')).toBeHidden();
  await expect(title).toHaveText('Layout 1');
});

test('layout state and active tab persist across reload', async ({ page }) => {
  await page.locator('.layout-tabs .glyphicon-plus').click();
  await expect(tabs(page).nth(3)).toHaveClass(/active/);
  await page.reload();
  await expect(page.locator('.layout-tabs')).toContainText('Custom');
  await expect(tabs(page).nth(3)).toHaveClass(/active/);
  const saved = JSON.parse((await storageValue(page, 'demo-layouts'))!);
  expect(saved.storageHash).toBe('fs4df4d51');
  expect(saved.layouts.map((layout: { title: string }) => layout.title)).toContain('Custom');
});
