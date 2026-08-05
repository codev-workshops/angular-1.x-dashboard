import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute } from './helpers';

test.describe('layouts explicit saving', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('offers Save and Don’t Save choices when switching with unsaved changes', async ({ page }) => {
    test.fail(true, 'AngularJS demo references missing template/SaveChangesModal.html');
    await openRoute(page, '/layouts/explicit-saving');
    const firstDashboard = page.locator('[dashboard]').first();
    await firstDashboard.locator('button', { hasText: 'Button dropdown' }).click();
    await firstDashboard.locator('.dropdown-menu a', { hasText: 'random' }).click();
    await page.locator('.layout-tabs > li').nth(1).locator('a').click();
    const modal = page.locator('.modal');
    await expect(modal).toContainText('Unsaved Changes to');
    await expect(modal.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Don't Save/ })).toBeVisible();
    await modal.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.locator('.layout-tabs > li').nth(1)).toHaveClass(/active/);
  });

  test('dismisses unsaved changes without saving', async ({ page }) => {
    test.fail(true, 'AngularJS demo references missing template/SaveChangesModal.html');
    await openRoute(page, '/layouts/explicit-saving');
    await page.locator('[dashboard]').first().locator('button', { hasText: 'Button dropdown' }).click();
    await page.locator('[dashboard]').first().locator('.dropdown-menu a', { hasText: 'random' }).click();
    await page.locator('.layout-tabs > li').nth(1).locator('a').click();
    await page.locator('.modal').getByRole('button', { name: /Don't Save/ }).click();
    await expect(page.locator('.layout-tabs > li').nth(1)).toHaveClass(/active/);
  });
});
