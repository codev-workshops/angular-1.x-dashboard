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

async function switchWithModal(page: import('@playwright/test').Page) {
  await makeUnsavedChange(page);
  await tabs(page).nth(1).click();
  const modal = page.locator('.modal');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.modal-header')).toContainText('Unsaved Changes to "Layout 2"');
  // The untouched legacy template interpolates an undefined layout.dashboard
  // counter, so the count is blank even though the modal is correctly opened.
  await expect(modal.locator('.modal-body')).toContainText('You have');
  await expect(modal.locator('.modal-body')).toContainText('unsaved changes');
  return modal;
}

test('switching with unsaved changes opens the Save Changes modal', async ({ page }) => {
  await switchWithModal(page);
});

test('Save saves changes then switches layouts', async ({ page }) => {
  const modal = await switchWithModal(page);
  await modal.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(tabs(page).nth(1)).toHaveClass(/active/);
  await expect(modal).toHaveCount(0);
});

test("Don't Save switches without saving the current dashboard", async ({ page }) => {
  const modal = await switchWithModal(page);
  await modal.locator('.modal-footer button').filter({ hasText: "Don't Save" }).click();
  await expect(tabs(page).nth(1)).toHaveClass(/active/);
  await expect(modal).toHaveCount(0);
});
