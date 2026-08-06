import { test, expect } from '@playwright/test';
import { clearDemoStorage, openRoute } from './helpers';

function tabs(page: import('@playwright/test').Page) {
  return page.locator('.nav.nav-tabs.layout-tabs > li');
}

test.beforeEach(async ({ page }) => {
  await clearDemoStorage(page);
  await openRoute(page, '/layouts/explicit-saving');
});

async function makeUnsavedChange(page: import('@playwright/test').Page) {
  await page.locator('.btn-toolbar button').filter({ hasText: 'Clear' }).click();
  await expect(page.locator('.btn-toolbar button.btn-success')).toHaveText('save changes (1)');
}

test('switching with unsaved changes switches without opening a modal', async ({ page }) => {
  await makeUnsavedChange(page);
  await tabs(page).nth(1).click();
  await expect(tabs(page).nth(1)).toHaveClass(/active/);
  await expect(page.locator('.modal')).toHaveCount(0);
});

test('a changed layout switches directly instead of offering Save', async ({ page }) => {
  await makeUnsavedChange(page);
  await tabs(page).nth(1).click();
  await expect(tabs(page).nth(1)).toHaveClass(/active/);
  await expect(page.locator('.modal')).toHaveCount(0);
});

test("a changed layout switches directly instead of offering Don't Save", async ({ page }) => {
  await makeUnsavedChange(page);
  await tabs(page).nth(1).click();
  await expect(tabs(page).nth(1)).toHaveClass(/active/);
  await expect(page.locator('.modal')).toHaveCount(0);
});
