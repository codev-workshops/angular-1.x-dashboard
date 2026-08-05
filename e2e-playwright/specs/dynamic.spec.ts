import { test, expect } from '@playwright/test';
import { clearStorageBeforeBoot, openRoute, widgets } from './helpers';

test.describe('dynamic demos', () => {
  test.beforeEach(async ({ page }) => clearStorageBeforeBoot(page));

  test('switches dynamic options between list and thumbnail DOM', async ({ page }) => {
    await openRoute(page, '/dynamic-options');
    await expect(page.locator('table.people')).toBeVisible();
    await expect(page.locator('.people img')).toHaveCount(0);
    await page.getByRole('button', { name: 'Thumbnail', exact: true }).first().click();
    await expect(page.locator('.people img')).toHaveCount(10);
    await expect(page.locator('table.people')).toHaveCount(0);
    await page.getByRole('button', { name: 'List', exact: true }).first().click();
    await expect(page.locator('table.people')).toBeVisible();
  });

  test('updates cart detail and summary consistently', async ({ page }) => {
    await openRoute(page, '/dynamic-data');
    await expect(page.locator('.cart-detail')).toBeVisible();
    await expect(page.locator('.cart-summary')).toBeVisible();
    await expect(page.locator('.cart-summary .empty')).toHaveText('The cart is empty');
    const inputs = page.locator('input[ng-model^="item."]');
    await inputs.nth(0).fill('Apple');
    await inputs.nth(1).fill('2');
    await inputs.nth(2).fill('1.50');
    await page.getByRole('button', { name: /Add/i }).click();
    await expect(page.locator('.cart-detail')).toContainText('Apple');
    await expect(page.locator('.cart-summary')).toContainText('$3.00');
    await expect(page.locator('.cart-summary')).toContainText('2');
    await page.locator('.cart-detail .glyphicon-remove').click();
    await expect(page.locator('.cart-detail .empty')).toHaveText('The cart is empty');
    await expect(page.locator('.cart-summary .empty')).toHaveText('The cart is empty');
  });
});
